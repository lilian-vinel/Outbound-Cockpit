const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execFileSync } = require('child_process');
const fallbackDeliveries = require('./data/mockDeliveries');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_EXCEL_PATH = path.join(__dirname, 'data', 'ewm_scwm_mon_demo_export.xlsx');
const EXCEL_PATH = process.env.EWM_MONITOR_EXCEL || DEFAULT_EXCEL_PATH;
const PARSER_PATH = path.join(__dirname, 'scripts', 'parseMonitorExcel.py');

let excelCache = {
  mtimeMs: null,
  deliveries: null,
  lastError: null
};

function parseDate(value) {
  return value ? new Date(value) : null;
}

function minutesBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 60000);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getProgress(items, field) {
  items = safeArray(items);
  if (items.length === 0) return 0;
  const done = items.filter(item => Boolean(item[field])).length;
  return Math.round((done / items.length) * 100);
}

function runExcelParser() {
  const candidates = process.platform === 'win32' ? ['py', 'python', 'python3'] : ['python3', 'python', 'py'];
  const errors = [];

  for (const command of candidates) {
    try {
      const args = command === 'py' ? ['-3', PARSER_PATH, EXCEL_PATH] : [PARSER_PATH, EXCEL_PATH];
      return execFileSync(command, args, {
        cwd: __dirname,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
    } catch (error) {
      errors.push(`${command}: ${error.message}`);
    }
  }

  throw new Error(`Could not run Python Excel parser. Tried ${candidates.join(', ')}. ${errors.join(' | ')}`);
}

function readDeliveriesFromExcel() {
  try {
    if (!fs.existsSync(EXCEL_PATH)) {
      excelCache.lastError = `Excel file not found: ${EXCEL_PATH}`;
      return null;
    }

    const stat = fs.statSync(EXCEL_PATH);
    if (excelCache.deliveries && excelCache.mtimeMs === stat.mtimeMs) {
      return excelCache.deliveries;
    }

    const output = runExcelParser();

    const parsed = JSON.parse(output);
    excelCache = {
      mtimeMs: stat.mtimeMs,
      deliveries: parsed,
      lastError: null
    };
    return parsed;
  } catch (error) {
    excelCache.lastError = error.message;
    return null;
  }
}

function getRawDeliveries() {
  const excelDeliveries = readDeliveriesFromExcel();
  if (excelDeliveries && excelDeliveries.length > 0) {
    return {
      sourceType: 'Excel /SCWM/MON demo export',
      sourceFile: path.relative(__dirname, EXCEL_PATH),
      data: excelDeliveries,
      error: null
    };
  }

  return {
    sourceType: 'Fallback mockDeliveries.js',
    sourceFile: 'data/mockDeliveries.js',
    data: fallbackDeliveries,
    error: excelCache.lastError
  };
}

function classifyTime(plannedGiTime, giPosted, now) {
  if (giPosted) return { level: 'done', label: 'GI posted', minutesRemaining: null };

  const planned = parseDate(plannedGiTime);
  if (!planned || Number.isNaN(planned.getTime())) {
    return { level: 'warning', label: 'No valid planned GI', minutesRemaining: null };
  }

  const minutesRemaining = minutesBetween(planned, now);

  if (minutesRemaining < 0) return { level: 'critical', label: `${Math.abs(minutesRemaining)} min overdue`, minutesRemaining };
  if (minutesRemaining <= 45) return { level: 'warning', label: `${minutesRemaining} min left`, minutesRemaining };
  return { level: 'ok', label: `${minutesRemaining} min left`, minutesRemaining };
}

function formatDateTime(value) {
  const parsed = parseDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) return value || '';
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin'
  }).format(parsed);
}

function deriveStatus(delivery, now = new Date()) {
  const hUs = safeArray(delivery.hUs);
  const warehouseTasks = safeArray(delivery.warehouseTasks);
  const stockChecks = safeArray(delivery.stockChecks);
  const binBlocks = safeArray(delivery.binBlocks);
  const logs = safeArray(delivery.logs);

  const huCount = hUs.length;
  const pickedProgress = getProgress(hUs, 'picked');
  const stagedProgress = getProgress(hUs, 'staged');
  const loadedProgress = getProgress(hUs, 'loaded');

  const openWts = warehouseTasks.filter(wt => wt.status === 'OPEN');
  const cancelledWts = warehouseTasks.filter(wt => wt.status === 'CANCELLED');
  const differences = warehouseTasks.filter(wt => wt.exceptionCode);
  const missingStock = stockChecks.filter(s => Number(s.availableQty) < Number(s.requiredQty));
  const errorLogs = logs.filter(log => log.type === 'E');

  let mainBlocker = 'No blocker';
  let nextAction = 'No action required';
  let overallLevel = 'ok';

  if (delivery.giPosted) {
    mainBlocker = 'GI already posted';
    nextAction = 'Completed';
    overallLevel = 'done';
  } else if (delivery.truckStatus === 'Not arrived') {
    mainBlocker = 'Truck not at door';
    nextAction = 'Check TU arrival and gate process';
    overallLevel = 'critical';
  } else if (!delivery.door) {
    mainBlocker = 'No door assigned';
    nextAction = 'Assign door or check TU planning';
    overallLevel = 'critical';
  } else if (!delivery.waveReleased) {
    mainBlocker = 'Wave not released';
    nextAction = 'Release wave and check application log';
    overallLevel = 'critical';
  } else if (!delivery.allWarehouseTasksCreated) {
    mainBlocker = 'Not all warehouse tasks created';
    nextAction = 'Check wave release / WT creation log';
    overallLevel = 'critical';
  } else if (missingStock.length > 0) {
    mainBlocker = 'Available stock missing';
    nextAction = 'Check stock type, batch, HU, source bin and availability';
    overallLevel = 'critical';
  } else if (binBlocks.length > 0) {
    mainBlocker = 'Source or destination bin blocked';
    nextAction = 'Check bin block and physical inventory status';
    overallLevel = 'critical';
  } else if (cancelledWts.length > 0) {
    mainBlocker = 'Cancelled warehouse task';
    nextAction = 'Recreate WT or analyze cancellation reason';
    overallLevel = 'critical';
  } else if (differences.length > 0) {
    mainBlocker = 'Picking difference reported';
    nextAction = 'Check exception code and difference handling';
    overallLevel = 'warning';
  } else if (pickedProgress < 100) {
    if (Number(delivery.activeResources) === 0) {
      mainBlocker = 'No active resource in picking queue';
      nextAction = 'Assign resource or check RF queue';
      overallLevel = 'critical';
    } else if (Number(delivery.openQueueTasks) > 50) {
      mainBlocker = 'Picking queue overloaded';
      nextAction = 'Shift resources or prioritize urgent WOs';
      overallLevel = 'warning';
    } else {
      mainBlocker = 'Picking incomplete';
      nextAction = 'Check open warehouse orders and tasks';
      overallLevel = 'warning';
    }
  } else if (stagedProgress < 100) {
    const huAtPack = hUs.find(hu => hu.packStation);
    mainBlocker = huAtPack ? 'HU still at pack station' : 'HU not in GI zone';
    nextAction = huAtPack ? 'Confirm staging WT from pack station to GI zone' : 'Check open staging WT';
    overallLevel = 'warning';
  } else if (loadedProgress < 100) {
    mainBlocker = 'HU staged but not loaded';
    nextAction = 'Check loading WT / loading confirmation at door';
    overallLevel = 'warning';
  } else if (loadedProgress === 100 && !delivery.giPosted) {
    mainBlocker = 'Loaded but GI not posted';
    nextAction = 'Post goods issue or check GI posting error';
    overallLevel = 'warning';
  } else if (errorLogs.length > 0) {
    mainBlocker = 'Application log error';
    nextAction = 'Open log details';
    overallLevel = 'critical';
  }

  const timeStatus = classifyTime(delivery.plannedGiTime, delivery.giPosted, now);
  if (!delivery.giPosted && timeStatus.level === 'critical') overallLevel = 'critical';
  if (!delivery.giPosted && timeStatus.level === 'warning' && overallLevel === 'ok') overallLevel = 'warning';

  return {
    ...delivery,
    hUs,
    warehouseTasks,
    stockChecks,
    binBlocks,
    logs,
    plannedGiDisplay: formatDateTime(delivery.plannedGiTime),
    giPostedDisplay: delivery.giPostedAt ? formatDateTime(delivery.giPostedAt) : null,
    huCount,
    pickedProgress,
    stagedProgress,
    loadedProgress,
    openWtCount: openWts.length,
    cancelledWtCount: cancelledWts.length,
    differenceCount: differences.length,
    missingStockCount: missingStock.length,
    blockedBinCount: binBlocks.length,
    logErrorCount: errorLogs.length,
    mainBlocker,
    nextAction,
    overallLevel,
    timeStatus
  };
}

function getStats(data) {
  const total = data.length;
  const giPosted = data.filter(d => d.giPosted).length;
  const notPosted = total - giPosted;
  const critical = data.filter(d => d.overallLevel === 'critical').length;
  const warnings = data.filter(d => d.overallLevel === 'warning').length;
  const stagedNotLoaded = data.filter(d => !d.giPosted && d.stagedProgress === 100 && d.loadedProgress < 100).length;
  const pickingBlocked = data.filter(d => !d.giPosted && (d.pickedProgress < 100 || d.cancelledWtCount > 0 || d.differenceCount > 0)).length;
  const waveIssues = data.filter(d => !d.giPosted && (!d.waveReleased || !d.allWarehouseTasksCreated)).length;
  const stockIssues = data.filter(d => d.missingStockCount > 0 || d.blockedBinCount > 0).length;

  const blockerSummary = data.reduce((acc, item) => {
    if (!item.giPosted) acc[item.mainBlocker] = (acc[item.mainBlocker] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    giPosted,
    notPosted,
    critical,
    warnings,
    stagedNotLoaded,
    pickingBlocked,
    waveIssues,
    stockIssues,
    blockerSummary
  };
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function serveStatic(req, res) {
  const parsedUrl = url.parse(req.url);
  let filePath = path.join(PUBLIC_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(content);
  });
}

function getEnrichedData(parsedUrl) {
  const raw = getRawDeliveries();
  const now = parsedUrl.query.now ? new Date(parsedUrl.query.now) : new Date('2026-06-11T11:20:00+02:00');
  const enriched = raw.data.map(delivery => deriveStatus(delivery, now));
  return { raw, enriched };
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { raw, enriched } = getEnrichedData(parsedUrl);

  if (parsedUrl.pathname === '/api/deliveries') {
    const search = (parsedUrl.query.search || '').toLowerCase();
    const status = parsedUrl.query.status || 'all';

    let result = enriched;

    if (search) {
      result = result.filter(d =>
        String(d.deliveryId).toLowerCase().includes(search) ||
        String(d.tu).toLowerCase().includes(search) ||
        String(d.carrier).toLowerCase().includes(search) ||
        String(d.shipTo).toLowerCase().includes(search) ||
        String(d.wave).toLowerCase().includes(search)
      );
    }

    if (status !== 'all') {
      result = result.filter(d => d.overallLevel === status || (status === 'notPosted' && !d.giPosted));
    }

    sendJson(res, result);
    return;
  }

  if (parsedUrl.pathname === '/api/stats') {
    sendJson(res, getStats(enriched));
    return;
  }

  if (parsedUrl.pathname.startsWith('/api/deliveries/')) {
    const deliveryId = decodeURIComponent(parsedUrl.pathname.split('/').pop());
    const delivery = enriched.find(d => d.deliveryId === deliveryId);
    if (!delivery) {
      sendJson(res, { error: 'Delivery not found' }, 404);
      return;
    }
    sendJson(res, delivery);
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  const raw = getRawDeliveries();
  console.log(`SAP EWM Outbound Performance Cockpit running on http://localhost:${PORT}`);
  console.log(`Data source: ${raw.sourceType} (${raw.sourceFile})`);
  if (raw.error) console.log(`Excel parser warning: ${raw.error}`);
});
