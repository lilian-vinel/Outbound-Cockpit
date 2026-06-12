const state = {
  deliveries: [],
  stats: null,
  selectedDeliveryId: null,
  language: localStorage.getItem('ewmCockpitLanguage') || 'en',
  rootCausesExpanded: false
};

const els = {
  kpiGiPosted: document.querySelector('#kpiGiPosted'),
  kpiCritical: document.querySelector('#kpiCritical'),
  kpiWarnings: document.querySelector('#kpiWarnings'),
  kpiButtons: document.querySelectorAll('[data-kpi-filter]'),
  reasonList: document.querySelector('#reasonList'),
  rootCauseToggle: document.querySelector('#rootCauseToggle'),
  rootCauseCount: document.querySelector('#rootCauseCount'),
  deliveryTableBody: document.querySelector('#deliveryTableBody'),
  deliveryPanelTitle: document.querySelector('#deliveryPanelTitle'),
  searchInput: document.querySelector('#searchInput'),
  statusFilter: document.querySelector('#statusFilter'),
  clearFilterBtn: document.querySelector('#clearFilterBtn'),
  langEnBtn: document.querySelector('#langEnBtn'),
  langDeBtn: document.querySelector('#langDeBtn'),
  detailTitle: document.querySelector('#detailTitle'),
  detailBadge: document.querySelector('#detailBadge'),
  detailContent: document.querySelector('#detailContent')
};

const translations = {
  en: {
    appTitleShort: 'Outbound Performance Cockpit',
    navOverview: 'Overview',
    navDeliveries: 'Deliveries',
    navReasons: 'Root causes',
    navDetails: 'Details',
    warehouseLabel: 'Warehouse 8000',
    cockpitMode: 'Outbound monitoring',
    operationalMonitoring: 'Operational monitoring',
    mainTitle: 'Outbound Performance Cockpit',
    kpiGiPosted: 'GI posted',
    kpiGiPostedSub: 'Deliveries sent out',
    kpiCritical: 'Critical',
    kpiCriticalSub: 'Not GI posted, immediate action required',
    kpiWarnings: 'Warnings',
    kpiWarningsSub: 'Not GI posted, at risk',
    rootCauseView: 'Root cause view',
    whyNotSent: 'Why deliveries are not sent out',
    rootCauseSingular: '{count} root cause',
    rootCausePlural: '{count} root causes',
    processHealth: 'Process health',
    outboundBottleneck: 'Outbound bottleneck',
    noOutboundBottleneck: 'No outbound bottleneck',
    noOutboundBottleneckText: 'This delivery has no open outbound bottleneck in the current data set.',
    suggestedNextAction: 'Suggested next action',
    sapStandardActions: 'Possible SAP standard actions',
    deliveryMonitoring: 'Affected deliveries',
    outboundDeliveries: 'Outbound deliveries',
    deliveryTitleAll: 'All outbound deliveries',
    deliveryTitleDone: 'GI posted deliveries',
    deliveryTitleCritical: 'Critical deliveries not GI posted',
    deliveryTitleWarning: 'Warning deliveries not GI posted',
    searchPlaceholder: 'Search delivery, TU, carrier, wave...',
    filterAll: 'All statuses',
    filterCritical: 'Critical',
    filterWarning: 'Warning',
    filterDone: 'GI posted',
    clearFilter: 'Show all',
    thStatus: 'Status',
    thDelivery: 'Delivery',
    thPlannedGi: 'Planned GI',
    thTuDoor: 'TU / Door',
    thPick: 'Pick',
    thStage: 'Stage',
    thLoad: 'Load',
    thMainBlocker: 'Main blocker',
    thNextAction: 'Next action',
    selectedDelivery: 'Selected delivery',
    noDeliverySelected: 'No delivery selected',
    selectRow: 'Select a row',
    selectDeliveryEmpty: 'Select a delivery row to see the bottleneck, SAP standard actions, HUs, warehouse tasks, stock checks, bin blocks and application logs.',
    noOpenBlockers: 'No open delivery blockers.',
    noDeliveriesFound: 'No deliveries found for the current filter.',
    couldNotLoad: 'Could not load cockpit data.',
    noDoor: 'No door',
    yes: 'Yes',
    no: 'No',
    plannedGi: 'Planned GI',
    carrier: 'Carrier',
    wave: 'Wave',
    mainBlocker: 'Main blocker',
    handlingUnits: 'Handling Units',
    noHus: 'No HUs created or assigned yet.',
    warehouseTasks: 'Warehouse Tasks',
    noWts: 'No warehouse tasks available.',
    stockChecks: 'Stock checks',
    noStockIssue: 'No stock issue found.',
    binBlocks: 'Bin blocks',
    noBinBlocks: 'No blocked source or destination bin found.',
    appLogs: 'Application logs',
    noLogs: 'No relevant application log messages.',
    hu: 'HU',
    currentBin: 'Current bin',
    picked: 'Picked',
    staged: 'Staged',
    loaded: 'Loaded',
    wt: 'WT',
    wo: 'WO',
    activity: 'Activity',
    status: 'Status',
    exception: 'Exception',
    source: 'Source',
    destination: 'Destination',
    product: 'Product',
    batch: 'Batch',
    required: 'Required',
    available: 'Available',
    stockType: 'Stock type',
    sourceBin: 'Source bin',
    bin: 'Bin',
    blockType: 'Block type',
    reason: 'Reason',
    type: 'Type',
    object: 'Object',
    message: 'Message',
    user: 'User',
    statusLabels: {
      done: 'GI posted',
      ok: 'On track',
      warning: 'Warning',
      critical: 'Critical'
    },
    timeLabels: {
      'GI posted': 'GI posted',
      'No valid planned GI': 'No valid planned GI'
    },
    minOverdue: '{minutes} min overdue',
    minLeft: '{minutes} min left',
    bottleneckLabels: {
      transport: 'Truck / door issue',
      wave: 'Wave / WT creation issue',
      stock: 'Stock / bin issue',
      picking: 'Picking issue',
      staging: 'Staging issue',
      loading: 'Loading issue',
      giPosting: 'GI posting issue',
      generic: 'Outbound process issue'
    }
  },
  de: {
    appTitleShort: 'Warenausgang Performance Cockpit',
    navOverview: 'Übersicht',
    navDeliveries: 'Lieferungen',
    navReasons: 'Ursachen',
    navDetails: 'Details',
    warehouseLabel: 'Lagernummer 8000',
    cockpitMode: 'Warenausgangsmonitoring',
    operationalMonitoring: 'Operatives Monitoring',
    mainTitle: 'Warenausgang Performance Cockpit',
    kpiGiPosted: 'WA gebucht',
    kpiGiPostedSub: 'Lieferungen rausgegangen',
    kpiCritical: 'Kritisch',
    kpiCriticalSub: 'Nicht WA-gebucht, sofortiger Handlungsbedarf',
    kpiWarnings: 'Warnungen',
    kpiWarningsSub: 'Nicht WA-gebucht, gefährdet',
    rootCauseView: 'Ursachenübersicht',
    whyNotSent: 'Warum Lieferungen nicht rausgegangen sind',
    rootCauseSingular: '{count} Ursache',
    rootCausePlural: '{count} Ursachen',
    processHealth: 'Prozessstatus',
    outboundBottleneck: 'Outbound-Engpass',
    noOutboundBottleneck: 'Kein Outbound-Engpass',
    noOutboundBottleneckText: 'Diese Lieferung hat im aktuellen Datenbestand keinen offenen Outbound-Engpass.',
    suggestedNextAction: 'Empfohlene nächste Aktion',
    sapStandardActions: 'Mögliche SAP-Standardmaßnahmen',
    deliveryMonitoring: 'Betroffene Lieferungen',
    outboundDeliveries: 'Auslieferungen',
    deliveryTitleAll: 'Alle Auslieferungen',
    deliveryTitleDone: 'WA-gebuchte Lieferungen',
    deliveryTitleCritical: 'Kritische, nicht WA-gebuchte Lieferungen',
    deliveryTitleWarning: 'Warnungen, nicht WA-gebuchte Lieferungen',
    searchPlaceholder: 'Lieferung, TU, Spediteur, Welle suchen...',
    filterAll: 'Alle Status',
    filterCritical: 'Kritisch',
    filterWarning: 'Warnung',
    filterDone: 'WA gebucht',
    clearFilter: 'Alle anzeigen',
    thStatus: 'Status',
    thDelivery: 'Lieferung',
    thPlannedGi: 'Geplanter WA',
    thTuDoor: 'TU / Tor',
    thPick: 'Komm.',
    thStage: 'Bereitst.',
    thLoad: 'Laden',
    thMainBlocker: 'Hauptblocker',
    thNextAction: 'Nächste Aktion',
    selectedDelivery: 'Ausgewählte Lieferung',
    noDeliverySelected: 'Keine Lieferung ausgewählt',
    selectRow: 'Zeile auswählen',
    selectDeliveryEmpty: 'Wähle eine Lieferzeile aus, um Engpass, SAP-Standardmaßnahmen, HUs, Lageraufgaben, Bestandsprüfungen, Platzsperren und Applikationslogs zu sehen.',
    noOpenBlockers: 'Keine offenen Lieferblocker.',
    noDeliveriesFound: 'Keine Lieferungen für den aktuellen Filter gefunden.',
    couldNotLoad: 'Cockpit-Daten konnten nicht geladen werden.',
    noDoor: 'Kein Tor',
    yes: 'Ja',
    no: 'Nein',
    plannedGi: 'Geplanter WA',
    carrier: 'Spediteur',
    wave: 'Welle',
    mainBlocker: 'Hauptblocker',
    handlingUnits: 'Handling Units',
    noHus: 'Keine HUs erstellt oder zugeordnet.',
    warehouseTasks: 'Lageraufgaben',
    noWts: 'Keine Lageraufgaben vorhanden.',
    stockChecks: 'Bestandsprüfungen',
    noStockIssue: 'Kein Bestandsproblem gefunden.',
    binBlocks: 'Platzsperren',
    noBinBlocks: 'Keine gesperrten Quell- oder Zielplätze gefunden.',
    appLogs: 'Applikationslogs',
    noLogs: 'Keine relevanten Applikationslog-Meldungen.',
    hu: 'HU',
    currentBin: 'Aktueller Platz',
    picked: 'Kommissioniert',
    staged: 'Bereitgestellt',
    loaded: 'Geladen',
    wt: 'LA',
    wo: 'Lagerauftrag',
    activity: 'Aktivität',
    status: 'Status',
    exception: 'Ausnahme',
    source: 'Quelle',
    destination: 'Ziel',
    product: 'Produkt',
    batch: 'Charge',
    required: 'Benötigt',
    available: 'Verfügbar',
    stockType: 'Bestandsart',
    sourceBin: 'Quellplatz',
    bin: 'Lagerplatz',
    blockType: 'Sperrtyp',
    reason: 'Grund',
    type: 'Typ',
    object: 'Objekt',
    message: 'Meldung',
    user: 'Benutzer',
    statusLabels: {
      done: 'WA gebucht',
      ok: 'Im Plan',
      warning: 'Warnung',
      critical: 'Kritisch'
    },
    timeLabels: {
      'GI posted': 'WA gebucht',
      'No valid planned GI': 'Kein gültiger geplanter WA'
    },
    minOverdue: '{minutes} min überfällig',
    minLeft: '{minutes} min übrig',
    bottleneckLabels: {
      transport: 'LKW-/Torproblem',
      wave: 'Wellen-/LA-Erstellungsproblem',
      stock: 'Bestands-/Platzproblem',
      picking: 'Kommissionierproblem',
      staging: 'Bereitstellungsproblem',
      loading: 'Ladeproblem',
      giPosting: 'WA-Buchungsproblem',
      generic: 'Outbound-Prozessproblem'
    }
  }
};

const blockerText = {
  de: {
    'No blocker': 'Kein Blocker',
    'GI already posted': 'WA bereits gebucht',
    'Truck not at door': 'LKW noch nicht am Tor',
    'No door assigned': 'Kein Tor zugeordnet',
    'Wave not released': 'Welle nicht freigegeben',
    'Not all warehouse tasks created': 'Nicht alle Lageraufgaben erstellt',
    'Available stock missing': 'Verfügbarer Bestand fehlt',
    'Source or destination bin blocked': 'Quell- oder Zielplatz gesperrt',
    'Cancelled warehouse task': 'Stornierte Lageraufgabe',
    'Picking difference reported': 'Kommissionierdifferenz gemeldet',
    'No active resource in picking queue': 'Keine aktive Ressource in der Kommissionierqueue',
    'Picking queue overloaded': 'Kommissionierqueue überlastet',
    'Picking incomplete': 'Kommissionierung unvollständig',
    'HU still at pack station': 'HU hängt noch am Packplatz',
    'HU not in GI zone': 'HU nicht in der GI-Zone',
    'HU staged but not loaded': 'HU bereitgestellt, aber nicht geladen',
    'Loaded but GI not posted': 'Geladen, aber WA nicht gebucht',
    'Application log error': 'Fehler im Applikationslog'
  },
  en: {}
};

const actionText = {
  de: {
    'No action required': 'Keine Aktion erforderlich',
    'Completed': 'Abgeschlossen',
    'Check TU arrival and gate process': 'TU-Ankunft und Gate-Prozess prüfen',
    'Assign door or check TU planning': 'Tor zuordnen oder TU-Planung prüfen',
    'Release wave and check application log': 'Welle freigeben und Applikationslog prüfen',
    'Check wave release / WT creation log': 'Wellenfreigabe und LA-Erstellungslog prüfen',
    'Check stock type, batch, HU, source bin and availability': 'Bestandsart, Charge, HU, Quellplatz und Verfügbarkeit prüfen',
    'Check bin block and physical inventory status': 'Platzsperre und Inventurstatus prüfen',
    'Recreate WT or analyze cancellation reason': 'LA neu erstellen oder Stornogrund analysieren',
    'Check exception code and difference handling': 'Ausnahmecode und Differenzenbearbeitung prüfen',
    'Assign resource or check RF queue': 'Ressource zuordnen oder RF-Queue prüfen',
    'Shift resources or prioritize urgent WOs': 'Ressourcen verschieben oder dringende Lageraufträge priorisieren',
    'Check open warehouse orders and tasks': 'Offene Lageraufträge und Lageraufgaben prüfen',
    'Confirm staging WT from pack station to GI zone': 'Bereitstellungs-LA vom Packplatz zur GI-Zone quittieren',
    'Check open staging WT': 'Offene Bereitstellungs-LA prüfen',
    'Check loading WT / loading confirmation at door': 'Lade-LA oder Ladebestätigung am Tor prüfen',
    'Post goods issue or check GI posting error': 'Warenausgang buchen oder WA-Buchungsfehler prüfen',
    'Open log details': 'Logdetails öffnen'
  },
  en: {}
};

const valueText = {
  de: {
    'Not arrived': 'Nicht angekommen',
    'At gate': 'Am Gate',
    'Docked': 'Angedockt',
    'Departed': 'Abgefahren',
    'Unknown': 'Unbekannt',
    'OPEN': 'Offen',
    'CONFIRMED': 'Quittiert',
    'CANCELLED': 'Storniert',
    'PICK': 'Kommissionierung',
    'STAGE': 'Bereitstellung',
    'LOAD': 'Laden'
  },
  en: {}
};

const deliveryBottleneckConfig = {
  transport: {
    blockers: ['Truck not at door', 'No door assigned'],
    description: {
      en: 'The delivery cannot progress because the TU, truck arrival or door assignment is not ready.',
      de: 'Die Lieferung kann nicht weiterlaufen, weil TU, LKW-Ankunft oder Torzuordnung nicht bereit sind.'
    },
    actions: {
      en: [
        'In /SCWM/MON, check TU assignment, door assignment and truck status for the outbound delivery.',
        'Use the standard yard/TU/door process to assign the door or update the truck arrival status.',
        'Do not force loading until TU, door and staging assignment are consistent.'
      ],
      de: [
        'In /SCWM/MON TU-Zuordnung, Torzuordnung und LKW-Status zur Auslieferung prüfen.',
        'Über den SAP-Standard Yard-/TU-/Torprozess das Tor zuordnen oder den LKW-Ankunftsstatus aktualisieren.',
        'Verladung nicht erzwingen, solange TU, Tor und Bereitstellungszuordnung nicht konsistent sind.'
      ]
    }
  },
  wave: {
    blockers: ['Wave not released', 'Not all warehouse tasks created', 'Application log error'],
    description: {
      en: 'The wave is not executable or warehouse task creation did not create all required WTs.',
      de: 'Die Welle ist nicht ausführbar oder die Lageraufgabenerstellung hat nicht alle benötigten LAs erstellt.'
    },
    actions: {
      en: [
        'Use the standard wave monitor to release the wave and check whether WT creation starts successfully.',
        'Open the application log for wave release/WT creation and check stock removal strategy, wave template and activity area determination.',
        'After fixing stock, bin or customizing issues, trigger WT creation again via standard EWM processing.'
      ],
      de: [
        'Über den SAP-Standard-Wellenmonitor die Welle freigeben und prüfen, ob die LA-Erstellung sauber startet.',
        'Applikationslog zur Wellenfreigabe/LA-Erstellung öffnen und Auslagerungsstrategie, Wellen-Template und Aktivitätsbereichsfindung prüfen.',
        'Nach Korrektur von Bestand, Platzsperre oder Customizing die LA-Erstellung erneut über den EWM-Standard anstoßen.'
      ]
    }
  },
  stock: {
    blockers: ['Available stock missing', 'Source or destination bin blocked'],
    description: {
      en: 'Required stock is missing, not available for picking, or the relevant source/destination bin is blocked.',
      de: 'Benötigter Bestand fehlt, ist nicht kommissionierbar oder der relevante Quell-/Zielplatz ist gesperrt.'
    },
    actions: {
      en: [
        'In /SCWM/MON, check Available Stock by product, batch, stock type, HU and source bin.',
        'If stock exists but is not available, use standard posting change/stock type change, replenish the pick face, or correct batch/HU assignment depending on the root cause.',
        'For blocked bins, check bin blocking and physical inventory status. Remove the block only through the standard process and only when operationally valid.'
      ],
      de: [
        'In /SCWM/MON verfügbaren Bestand nach Produkt, Charge, Bestandsart, HU und Quellplatz prüfen.',
        'Wenn Bestand vorhanden, aber nicht verfügbar ist, Standard-Umbuchung/Bestandsartänderung nutzen, Kommissionierplatz nachschieben oder Charge/HU-Zuordnung korrigieren.',
        'Bei gesperrten Plätzen Platzsperre und Inventurstatus prüfen. Sperre nur über den Standardprozess und nur fachlich berechtigt entfernen.'
      ]
    }
  },
  picking: {
    blockers: ['Cancelled warehouse task', 'Picking difference reported', 'No active resource in picking queue', 'Picking queue overloaded', 'Picking incomplete'],
    description: {
      en: 'Picking is not finished, warehouse tasks are cancelled, resources are missing, or differences/exception codes were reported.',
      de: 'Die Kommissionierung ist nicht abgeschlossen, Lageraufgaben wurden storniert, Ressourcen fehlen oder Differenzen/Ausnahmecodes wurden gemeldet.'
    },
    actions: {
      en: [
        'In /SCWM/MON, check open WOs/WTs for the delivery or wave and process them via standard RF picking.',
        'If no resource is working the queue, assign or move resources to the relevant queue/activity area.',
        'For differences or cancelled WTs, check the exception code, process the difference with standard EWM difference handling, then recreate follow-on WTs if needed.'
      ],
      de: [
        'In /SCWM/MON offene Lageraufträge/Lageraufgaben zur Lieferung oder Welle prüfen und über die Standard-RF-Kommissionierung abarbeiten.',
        'Wenn keine Ressource in der Queue arbeitet, Ressourcen der relevanten Queue bzw. dem Aktivitätsbereich zuordnen oder dorthin verschieben.',
        'Bei Differenzen oder stornierten LAs den Ausnahmecode prüfen, Differenz mit SAP-Standard-Differenzenbearbeitung abarbeiten und bei Bedarf Folge-LAs neu erstellen.'
      ]
    }
  },
  staging: {
    blockers: ['HU still at pack station', 'HU not in GI zone'],
    description: {
      en: 'The HU has not reached the correct GI/staging zone yet, or the staging movement from packing is still open.',
      de: 'Die HU hat die korrekte GI-/Bereitstellungszone noch nicht erreicht oder die Bereitstellungsbewegung vom Packplatz ist noch offen.'
    },
    actions: {
      en: [
        'In /SCWM/MON, check the HU current bin and any open staging WT for the delivery.',
        'Confirm the standard staging WT from packing/storage to the GI zone via RF or monitor processing.',
        'If the HU is at the wrong staging area, correct the staging/TU/door assignment before loading.'
      ],
      de: [
        'In /SCWM/MON aktuellen HU-Platz und offene Bereitstellungs-LAs zur Lieferung prüfen.',
        'Die Standard-Bereitstellungs-LA vom Packplatz/Lager zur GI-Zone per RF oder Monitorbearbeitung quittieren.',
        'Wenn die HU im falschen Bereitstellungsbereich steht, zuerst Bereitstellungs-/TU-/Torzuordnung korrigieren.'
      ]
    }
  },
  loading: {
    blockers: ['HU staged but not loaded'],
    description: {
      en: 'HUs are already in the GI/staging zone, but loading to the TU is missing or incomplete.',
      de: 'Die HUs stehen bereits in der GI-/Bereitstellungszone, aber die Verladung auf die TU fehlt oder ist unvollständig.'
    },
    actions: {
      en: [
        'In /SCWM/MON, check the HU current bin, assigned TU, door and loading status.',
        'Use the standard loading process/RF transaction to load the staged HU to the TU or confirm the open loading WT.',
        'If the HU is staged at the wrong GI zone or assigned to the wrong TU, correct the TU/door/staging assignment before loading.'
      ],
      de: [
        'In /SCWM/MON den aktuellen HU-Platz, die zugeordnete TU, das Tor und den Ladestatus prüfen.',
        'Über den SAP-Standard-Ladeprozess/RF die bereitgestellte HU auf die TU laden oder die offene Lade-LA quittieren.',
        'Wenn die HU in der falschen GI-Zone steht oder der falschen TU zugeordnet ist, zuerst TU-/Tor-/Bereitstellungszuordnung korrigieren.'
      ]
    }
  },
  giPosting: {
    blockers: ['Loaded but GI not posted'],
    description: {
      en: 'Loading is complete, but goods issue has not been posted yet.',
      de: 'Die Verladung ist abgeschlossen, aber der Warenausgang wurde noch nicht gebucht.'
    },
    actions: {
      en: [
        'Check in /SCWM/MON whether all HUs are loaded and whether delivery status allows goods issue posting.',
        'Post goods issue using the standard outbound delivery/TU GI posting process.',
        'If GI posting fails, open the application log and correct the blocking delivery, status or stock posting issue.'
      ],
      de: [
        'In /SCWM/MON prüfen, ob alle HUs geladen sind und ob der Lieferstatus die WA-Buchung zulässt.',
        'Warenausgang über den SAP-Standardprozess zur Auslieferung/TU buchen.',
        'Wenn die WA-Buchung fehlschlägt, Applikationslog öffnen und blockierenden Liefer-, Status- oder Bestandsbuchungsfehler korrigieren.'
      ]
    }
  }
};

function t(key, replacements = {}) {
  const dict = translations[state.language] || translations.en;
  let value = dict[key] ?? translations.en[key] ?? key;
  Object.entries(replacements).forEach(([name, replacement]) => {
    value = String(value).replaceAll(`{${name}}`, replacement);
  });
  return value;
}

function statusLabel(level) {
  return t('statusLabels')[level] || level;
}

function translateValue(value) {
  if (!value) return '';
  if (state.language === 'de') return valueText.de[value] || value;
  return value;
}

function translateBlocker(value) {
  if (!value) return '';
  if (state.language === 'de') return blockerText.de[value] || value;
  return value;
}

function translateAction(value) {
  if (!value) return '';
  if (state.language === 'de') return actionText.de[value] || value;
  return value;
}

function translateTimeLabel(label) {
  if (!label) return '';
  const exact = t('timeLabels')[label];
  if (exact) return exact;

  const overdueMatch = String(label).match(/^(\d+) min overdue$/);
  if (overdueMatch) return t('minOverdue', { minutes: overdueMatch[1] });

  const leftMatch = String(label).match(/^(\d+) min left$/);
  if (leftMatch) return t('minLeft', { minutes: leftMatch[1] });

  return label;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function badge(level, text) {
  return `<span class="badge ${level}">${escapeHtml(text || statusLabel(level))}</span>`;
}

function progress(value) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return `
    <div class="progress-cell">
      <div class="progress-label">${safeValue}%</div>
      <div class="progress-track"><span style="width:${safeValue}%"></span></div>
    </div>
  `;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function loadCockpit() {
  const [stats, deliveries] = await Promise.all([
    fetchJson('/api/stats'),
    fetchJson('/api/deliveries')
  ]);

  state.stats = stats;
  state.deliveries = deliveries;

  renderStats();
  renderReasons();
  renderDeliveries();

  if (state.selectedDeliveryId) {
    const selected = state.deliveries.find(d => d.deliveryId === state.selectedDeliveryId);
    if (selected) renderDetails(selected);
    else clearDetails(false);
  }
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.title = state.language === 'de'
    ? 'SAP EWM Warenausgang Performance Cockpit'
    : 'SAP EWM Outbound Performance Cockpit';

  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  els.langEnBtn.classList.toggle('active', state.language === 'en');
  els.langDeBtn.classList.toggle('active', state.language === 'de');

  renderStats();
  renderReasons();
  renderDeliveries();

  if (state.selectedDeliveryId) {
    const selected = state.deliveries.find(d => d.deliveryId === state.selectedDeliveryId);
    if (selected) renderDetails(selected);
  } else {
    clearDetails(false);
  }
}

function setLanguage(language) {
  state.language = language;
  localStorage.setItem('ewmCockpitLanguage', language);
  applyLanguage();
}

function getStatusFilter() {
  return els.statusFilter.value || 'all';
}

function setStatusFilter(status, scrollToDeliveries = false) {
  els.statusFilter.value = status;
  renderStats();
  renderDeliveries();

  if (scrollToDeliveries) {
    const deliveriesSection = document.querySelector('#deliveries');
    if (deliveriesSection) {
      deliveriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#deliveries');
    }
  }
}

function renderStats() {
  const s = state.stats;
  if (!s) return;

  els.kpiGiPosted.textContent = s.giPosted;
  els.kpiCritical.textContent = s.critical;
  els.kpiWarnings.textContent = s.warnings;

  const activeStatus = getStatusFilter();
  els.kpiButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.kpiFilter === activeStatus);
  });
}

function getRootCauseCountLabel(count) {
  return count === 1
    ? t('rootCauseSingular', { count })
    : t('rootCausePlural', { count });
}

function renderReasons() {
  const summary = state.stats?.blockerSummary || {};
  const entries = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  els.rootCauseCount.textContent = getRootCauseCountLabel(entries.length);
  els.rootCauseToggle.setAttribute('aria-expanded', String(state.rootCausesExpanded));
  els.rootCauseToggle.classList.toggle('expanded', state.rootCausesExpanded);
  els.reasonList.classList.toggle('collapsed', !state.rootCausesExpanded);

  if (entries.length === 0) {
    els.reasonList.innerHTML = `<div class="empty-state compact-empty">${t('noOpenBlockers')}</div>`;
    return;
  }

  els.reasonList.innerHTML = entries.map(([reason, count]) => `
    <div class="reason-item">
      <div>
        <strong>${escapeHtml(translateBlocker(reason))}</strong>
        <div class="reason-bar"><span style="width:${Math.round((count / max) * 100)}%"></span></div>
      </div>
      <div class="reason-count">${count}</div>
    </div>
  `).join('');
}

function getFilteredDeliveries() {
  const search = els.searchInput.value.trim().toLowerCase();
  const status = getStatusFilter();

  return state.deliveries.filter(delivery => {
    const matchesSearch = !search || [
      delivery.deliveryId,
      delivery.tu,
      delivery.carrier,
      delivery.shipTo,
      delivery.wave
    ].some(value => String(value || '').toLowerCase().includes(search));

    const matchesStatus = status === 'all' || delivery.overallLevel === status;

    return matchesSearch && matchesStatus;
  });
}

function renderDeliveryPanelTitle() {
  const status = getStatusFilter();
  const titleKey = {
    all: 'deliveryTitleAll',
    done: 'deliveryTitleDone',
    critical: 'deliveryTitleCritical',
    warning: 'deliveryTitleWarning'
  }[status] || 'deliveryTitleAll';

  els.deliveryPanelTitle.textContent = t(titleKey);
}

function renderDeliveries() {
  renderDeliveryPanelTitle();
  const visibleDeliveries = getFilteredDeliveries();

  if (visibleDeliveries.length === 0) {
    els.deliveryTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">${t('noDeliveriesFound')}</td>
      </tr>
    `;
    return;
  }

  els.deliveryTableBody.innerHTML = visibleDeliveries.map(delivery => `
    <tr data-delivery-id="${escapeHtml(delivery.deliveryId)}">
      <td>${badge(delivery.overallLevel, statusLabel(delivery.overallLevel))}</td>
      <td>
        <strong>${escapeHtml(delivery.deliveryId)}</strong><br />
        <small>${escapeHtml(delivery.shipTo)}</small>
      </td>
      <td>
        ${escapeHtml(delivery.plannedGiDisplay)}<br />
        <small>${escapeHtml(translateTimeLabel(delivery.timeStatus.label))}</small>
      </td>
      <td>
        <strong>${escapeHtml(delivery.tu)}</strong><br />
        <small>${escapeHtml(delivery.door || t('noDoor'))} · ${escapeHtml(translateValue(delivery.truckStatus))}</small>
      </td>
      <td>${progress(delivery.pickedProgress)}</td>
      <td>${progress(delivery.stagedProgress)}</td>
      <td>${progress(delivery.loadedProgress)}</td>
      <td><strong>${escapeHtml(translateBlocker(delivery.mainBlocker))}</strong></td>
      <td>${escapeHtml(translateAction(delivery.nextAction))}</td>
    </tr>
  `).join('');

  els.deliveryTableBody.querySelectorAll('tr[data-delivery-id]').forEach(row => {
    row.addEventListener('click', () => showDetails(row.dataset.deliveryId));
  });
}

async function showDetails(deliveryId) {
  state.selectedDeliveryId = deliveryId;
  const delivery = await fetchJson(`/api/deliveries/${encodeURIComponent(deliveryId)}`);
  renderDetails(delivery);

  const detailsSection = document.querySelector('#details');
  if (detailsSection) {
    detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#details');
  }
}

function renderDetails(delivery) {
  els.detailTitle.textContent = `${delivery.deliveryId} · ${delivery.tu}`;
  els.detailBadge.className = `badge ${delivery.overallLevel}`;
  els.detailBadge.textContent = statusLabel(delivery.overallLevel);

  els.detailContent.className = 'detail-content';
  els.detailContent.innerHTML = `
    <div class="detail-meta">
      <div><span>${t('plannedGi')}</span><strong>${escapeHtml(delivery.plannedGiDisplay)}</strong></div>
      <div><span>${t('carrier')}</span><strong>${escapeHtml(delivery.carrier)}</strong></div>
      <div><span>${t('wave')}</span><strong>${escapeHtml(delivery.wave)}</strong></div>
      <div><span>${t('mainBlocker')}</span><strong>${escapeHtml(translateBlocker(delivery.mainBlocker))}</strong></div>
    </div>
    ${renderDeliveryBottleneckSection(delivery)}
    ${renderHuSection(delivery)}
    ${renderWtSection(delivery)}
    ${renderStockSection(delivery)}
    ${renderBinBlockSection(delivery)}
    ${renderLogSection(delivery)}
  `;
}

function getDeliveryBottleneck(delivery) {
  if (!delivery || delivery.giPosted || delivery.mainBlocker === 'GI already posted' || delivery.mainBlocker === 'No blocker') {
    return null;
  }

  const entry = Object.entries(deliveryBottleneckConfig)
    .find(([, config]) => config.blockers.includes(delivery.mainBlocker));

  if (entry) {
    return { key: entry[0], ...entry[1] };
  }

  return {
    key: 'generic',
    description: {
      en: 'The delivery is not GI posted and has an open outbound process issue that needs manual analysis.',
      de: 'Die Lieferung ist nicht WA-gebucht und hat ein offenes Outbound-Prozessproblem, das manuell geprüft werden muss.'
    },
    actions: {
      en: [
        'Open the delivery in /SCWM/MON and check document status, HUs, WTs, stock and application log.',
        'Start with the main blocker shown in the cockpit and validate whether it is still current.',
        'Resolve the issue through the standard EWM follow-on process instead of changing status fields manually.'
      ],
      de: [
        'Lieferung in /SCWM/MON öffnen und Belegstatus, HUs, LAs, Bestand und Applikationslog prüfen.',
        'Mit dem im Cockpit gezeigten Hauptblocker starten und prüfen, ob dieser noch aktuell ist.',
        'Problem über den EWM-Standardfolgeprozess lösen, nicht manuell Statusfelder ändern.'
      ]
    }
  };
}

function renderDeliveryBottleneckSection(delivery) {
  const config = getDeliveryBottleneck(delivery);

  if (!config) {
    return `
      <div class="detail-section bottleneck-analysis no-bottleneck">
        <div class="bottleneck-detail-header">
          <div>
            <span class="eyebrow">${t('processHealth')}</span>
            <h4>${t('noOutboundBottleneck')}</h4>
          </div>
          ${badge(delivery.overallLevel, statusLabel(delivery.overallLevel))}
        </div>
        <p>${t('noOutboundBottleneckText')}</p>
      </div>
    `;
  }

  return `
    <div class="detail-section bottleneck-analysis">
      <div class="bottleneck-detail-header">
        <div>
          <span class="eyebrow">${t('processHealth')}</span>
          <h4>${escapeHtml(t('bottleneckLabels')[config.key] || t('outboundBottleneck'))}</h4>
        </div>
        ${badge(delivery.overallLevel, statusLabel(delivery.overallLevel))}
      </div>
      <p>${escapeHtml(config.description[state.language])}</p>
      <div class="suggestion-card">
        <span>${t('suggestedNextAction')}</span>
        <strong>${escapeHtml(translateAction(delivery.nextAction))}</strong>
      </div>
      <div class="solution-block">
        <h5>${t('sapStandardActions')}</h5>
        <ol>
          ${config.actions[state.language].map(action => `<li>${escapeHtml(action)}</li>`).join('')}
        </ol>
      </div>
    </div>
  `;
}

function renderHuSection(delivery) {
  if (!delivery.hUs.length) {
    return `<div class="detail-section"><h4>${t('handlingUnits')}</h4><p>${t('noHus')}</p></div>`;
  }

  return `
    <div class="detail-section">
      <h4>${t('handlingUnits')}</h4>
      <table class="compact-table">
        <thead><tr><th>${t('hu')}</th><th>${t('currentBin')}</th><th>${t('picked')}</th><th>${t('staged')}</th><th>${t('loaded')}</th></tr></thead>
        <tbody>
          ${delivery.hUs.map(hu => `
            <tr>
              <td>${escapeHtml(hu.hu)}</td>
              <td>${escapeHtml(hu.currentBin)}</td>
              <td>${hu.picked ? t('yes') : t('no')}</td>
              <td>${hu.staged ? t('yes') : t('no')}</td>
              <td>${hu.loaded ? t('yes') : t('no')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderWtSection(delivery) {
  if (!delivery.warehouseTasks.length) {
    return `<div class="detail-section"><h4>${t('warehouseTasks')}</h4><p>${t('noWts')}</p></div>`;
  }

  return `
    <div class="detail-section">
      <h4>${t('warehouseTasks')}</h4>
      <table class="compact-table">
        <thead><tr><th>${t('wt')}</th><th>${t('wo')}</th><th>${t('activity')}</th><th>${t('status')}</th><th>${t('exception')}</th><th>${t('source')}</th><th>${t('destination')}</th></tr></thead>
        <tbody>
          ${delivery.warehouseTasks.map(wt => `
            <tr>
              <td>${escapeHtml(wt.wt)}</td>
              <td>${escapeHtml(wt.wo)}</td>
              <td>${escapeHtml(translateValue(wt.activity))}</td>
              <td>${escapeHtml(translateValue(wt.status))}</td>
              <td>${escapeHtml(wt.exceptionCode || '')}</td>
              <td>${escapeHtml(wt.sourceBin)}</td>
              <td>${escapeHtml(wt.destBin)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStockSection(delivery) {
  if (!delivery.stockChecks.length) {
    return `<div class="detail-section"><h4>${t('stockChecks')}</h4><p>${t('noStockIssue')}</p></div>`;
  }

  return `
    <div class="detail-section">
      <h4>${t('stockChecks')}</h4>
      <table class="compact-table">
        <thead><tr><th>${t('product')}</th><th>${t('batch')}</th><th>${t('required')}</th><th>${t('available')}</th><th>${t('stockType')}</th><th>${t('sourceBin')}</th></tr></thead>
        <tbody>
          ${delivery.stockChecks.map(stock => `
            <tr>
              <td>${escapeHtml(stock.product)}</td>
              <td>${escapeHtml(stock.batch)}</td>
              <td>${escapeHtml(stock.requiredQty)}</td>
              <td>${escapeHtml(stock.availableQty)}</td>
              <td>${escapeHtml(stock.stockType)}</td>
              <td>${escapeHtml(stock.sourceBin)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderBinBlockSection(delivery) {
  if (!delivery.binBlocks.length) {
    return `<div class="detail-section"><h4>${t('binBlocks')}</h4><p>${t('noBinBlocks')}</p></div>`;
  }

  return `
    <div class="detail-section">
      <h4>${t('binBlocks')}</h4>
      <table class="compact-table">
        <thead><tr><th>${t('bin')}</th><th>${t('blockType')}</th><th>${t('reason')}</th></tr></thead>
        <tbody>
          ${delivery.binBlocks.map(block => `
            <tr>
              <td>${escapeHtml(block.bin)}</td>
              <td>${escapeHtml(block.blockType)}</td>
              <td>${escapeHtml(block.reason)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderLogSection(delivery) {
  if (!delivery.logs.length) {
    return `<div class="detail-section"><h4>${t('appLogs')}</h4><p>${t('noLogs')}</p></div>`;
  }

  return `
    <div class="detail-section">
      <h4>${t('appLogs')}</h4>
      <table class="compact-table">
        <thead><tr><th>${t('type')}</th><th>${t('object')}</th><th>${t('message')}</th><th>${t('user')}</th></tr></thead>
        <tbody>
          ${delivery.logs.map(log => `
            <tr>
              <td class="${log.type === 'E' ? 'log-error' : 'log-warning'}">${escapeHtml(log.type)}</td>
              <td>${escapeHtml(log.object)} / ${escapeHtml(log.subobject)}</td>
              <td>${escapeHtml(log.message)}</td>
              <td>${escapeHtml(log.user)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function clearDetails(render = true) {
  state.selectedDeliveryId = null;
  els.detailTitle.textContent = t('noDeliverySelected');
  els.detailBadge.className = 'badge muted';
  els.detailBadge.textContent = t('selectRow');
  els.detailContent.className = 'empty-state';
  els.detailContent.textContent = t('selectDeliveryEmpty');
  if (render) renderDeliveries();
}

els.searchInput.addEventListener('input', renderDeliveries);
els.statusFilter.addEventListener('change', () => setStatusFilter(getStatusFilter(), false));
els.clearFilterBtn.addEventListener('click', () => {
  els.searchInput.value = '';
  setStatusFilter('all', true);
});
els.rootCauseToggle.addEventListener('click', () => {
  state.rootCausesExpanded = !state.rootCausesExpanded;
  renderReasons();
});
els.langEnBtn.addEventListener('click', () => setLanguage('en'));
els.langDeBtn.addEventListener('click', () => setLanguage('de'));
els.kpiButtons.forEach(button => {
  button.addEventListener('click', () => {
    els.searchInput.value = '';
    setStatusFilter(button.dataset.kpiFilter, true);
  });
});

applyLanguage();
loadCockpit().catch(error => {
  console.error(error);
  els.deliveryTableBody.innerHTML = `<tr><td colspan="9" class="empty-state">${t('couldNotLoad')}</td></tr>`;
});
