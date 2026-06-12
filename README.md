const deliveries = [
  {
    deliveryId: '8000004711',
    tu: 'TU-4711',
    carrier: 'DHL Freight',
    route: 'DE-SOUTH',
    shipTo: 'Müller Automotive GmbH',
    plannedGiTime: '2026-06-11T10:30:00+02:00',
    giPosted: true,
    giPostedAt: '2026-06-11T10:18:00+02:00',
    door: 'TOR-03',
    truckStatus: 'Departed',
    wave: 'WAVE-1001',
    waveReleased: true,
    allWarehouseTasksCreated: true,
    queue: 'PICK-A',
    activeResources: 3,
    openQueueTasks: 8,
    hUs: [
      { hu: '9000007010', currentBin: 'GI-ZONE-01', expectedGiZone: 'GI-ZONE', picked: true, staged: true, loaded: true, packStation: null },
      { hu: '9000007011', currentBin: 'GI-ZONE-01', expectedGiZone: 'GI-ZONE', picked: true, staged: true, loaded: true, packStation: null }
    ],
    warehouseTasks: [
      { wt: 'WT-4711-001', wo: 'WO-9001', activity: 'PICK', status: 'CONFIRMED', exceptionCode: null, sourceBin: 'A-01-01', destBin: 'GI-ZONE-01', product: 'MAT-1000', qty: 12 },
      { wt: 'WT-4711-002', wo: 'WO-9001', activity: 'LOAD', status: 'CONFIRMED', exceptionCode: null, sourceBin: 'GI-ZONE-01', destBin: 'TU-4711', product: 'MAT-1000', qty: 12 }
    ],
    stockChecks: [],
    binBlocks: [],
    logs: []
  },
  {
    deliveryId: '8000004712',
    tu: 'TU-4712',
    carrier: 'Schenker',
    route: 'FR-PARIS',
    shipTo: 'Paris Retail SA',
    plannedGiTime: '2026-06-11T11:00:00+02:00',
    giPosted: false,
    giPostedAt: null,
    door: null,
    truckStatus: 'Not arrived',
    wave: 'WAVE-1002',
    waveReleased: true,
    allWarehouseTasksCreated: true,
    queue: 'PICK-A',
    activeResources: 2,
    openQueueTasks: 12,
    hUs: [
      { hu: '9000007020', currentBin: 'GI-ZONE-02', expectedGiZone: 'GI-ZONE', picked: true, staged: true, loaded: false, packStation: null },
      { hu: '9000007021', currentBin: 'GI-ZONE-02', expectedGiZone: 'GI-ZONE', picked: true, staged: true, loaded: false, packStation: null }
    ],
    warehouseTasks: [
      { wt: 'WT-4712-001', wo: 'WO-9010', activity: 'PICK', status: 'CONFIRMED', exceptionCode: null, sourceBin: 'A-02-01', destBin: 'GI-ZONE-02', product: 'MAT-2000', qty: 20 },
      { wt: 'WT-4712-002', wo: 'WO-9011', activity: 'LOAD', status: 'OPEN', exceptionCode: null, sourceBin: 'GI-ZONE-02', destBin: 'TU-4712', product: 'MAT-2000', qty: 20 }
    ],
    stockChecks: [],
    binBlocks: [],
    logs: []
  },
  {
    deliveryId: '8000004713',
    tu: 'TU-4713',
    carrier: 'Kühne + Nagel',
    route: 'DE-WEST',
    shipTo: 'West Components AG',
    plannedGiTime: '2026-06-11T11:45:00+02:00',
    giPosted: false,
    giPostedAt: null,
    door: 'TOR-01',
    truckStatus: 'Docked',
    wave: 'WAVE-1003',
    waveReleased: true,
    allWarehouseTasksCreated: true,
    queue: 'PICK-B',
    activeResources: 0,
    openQueueTasks: 67,
    hUs: [
      { hu: '9000007030', currentBin: 'PACK-04', expectedGiZone: 'GI-ZONE', picked: true, staged: false, loaded: false, packStation: 'PACK-04' },
      { hu: '9000007031', currentBin: 'B-04-03', expectedGiZone: 'GI-ZONE', picked: false, staged: false, loaded: false, packStation: null }
    ],
    warehouseTasks: [
      { wt: 'WT-4713-001', wo: 'WO-9020', activity: 'PICK', status: 'CONFIRMED', exceptionCode: null, sourceBin: 'B-01-01', destBin: 'PACK-04', product: 'MAT-3000', qty: 6 },
      { wt: 'WT-4713-002', wo: 'WO-9021', activity: 'PICK', status: 'OPEN', exceptionCode: null, sourceBin: 'B-04-03', destBin: 'PACK-04', product: 'MAT-3100', qty: 18 },
      { wt: 'WT-4713-003', wo: 'WO-9022', activity: 'STAGE', status: 'OPEN', exceptionCode: null, sourceBin: 'PACK-04', destBin: 'GI-ZONE-03', product: 'MAT-3000', qty: 6 }
    ],
    stockChecks: [],
    binBlocks: [],
    logs: []
  },
  {
    deliveryId: '8000004714',
    tu: 'TU-4714',
    carrier: 'DACHSER',
    route: 'CZ-PRAGUE',
    shipTo: 'Bohemia Parts s.r.o.',
    plannedGiTime: '2026-06-11T12:15:00+02:00',
    giPosted: false,
    giPostedAt: null,
    door: 'TOR-04',
    truckStatus: 'At gate',
    wave: 'WAVE-1004',
    waveReleased: false,
    allWarehouseTasksCreated: false,
    queue: 'PICK-C',
    activeResources: 2,
    openQueueTasks: 18,
    hUs: [],
    warehouseTasks: [],
    stockChecks: [
      { product: 'MAT-4000', batch: 'BATCH-24A', requiredQty: 50, availableQty: 12, stockType: 'F2', sourceBin: 'C-02-05', hu: '9000007040' }
    ],
    binBlocks: [],
    logs: [
      { type: 'E', object: 'WAVE', subobject: 'WT_CREATE', message: 'Warehouse task creation failed: insufficient available stock for MAT-4000', timestamp: '2026-06-11T09:42:00+02:00', user: 'EWM_BATCH' }
    ]
  },
  {
    deliveryId: '8000004715',
    tu: 'TU-4715',
    carrier: 'Hellmann',
    route: 'DE-NORTH',
    shipTo: 'North Retail GmbH',
    plannedGiTime: '2026-06-11T13:00:00+02:00',
    giPosted: false,
    giPostedAt: null,
    door: 'TOR-02',
    truckStatus: 'Docked',
    wave: 'WAVE-1005',
    waveReleased: true,
    allWarehouseTasksCreated: true,
    queue: 'PICK-D',
    activeResources: 1,
    openQueueTasks: 23,
    hUs: [
      { hu: '9000007050', currentBin: 'D-09-01', expectedGiZone: 'GI-ZONE', picked: false, staged: false, loaded: false, packStation: null }
    ],
    warehouseTasks: [
      { wt: 'WT-4715-001', wo: 'WO-9030', activity: 'PICK', status: 'CANCELLED', exceptionCode: 'DIFS', sourceBin: 'D-09-01', destBin: 'PACK-02', product: 'MAT-5000', qty: 10 }
    ],
    stockChecks: [
      { product: 'MAT-5000', batch: 'BATCH-31B', requiredQty: 10, availableQty: 10, stockType: 'F2', sourceBin: 'D-09-01', hu: '9000007050' }
    ],
    binBlocks: [
      { bin: 'D-09-01', blockType: 'Stock removal block', reason: 'Physical inventory active' }
    ],
    logs: [
      { type: 'W', object: 'PICKING', subobject: 'EXCEPTION', message: 'Picking difference reported with exception code DIFS', timestamp: '2026-06-11T10:05:00+02:00', user: 'RF_USER_03' }
    ]
  },
  {
    deliveryId: '8000004716',
    tu: 'TU-4716',
    carrier: 'Internal Shuttle',
    route: 'PLANT-02',
    shipTo: 'Plant 02',
    plannedGiTime: '2026-06-11T14:30:00+02:00',
    giPosted: false,
    giPostedAt: null,
    door: 'TOR-05',
    truckStatus: 'Docked',
    wave: 'WAVE-1006',
    waveReleased: true,
    allWarehouseTasksCreated: true,
    queue: 'PICK-A',
    activeResources: 4,
    openQueueTasks: 9,
    hUs: [
      { hu: '9000007060', currentBin: 'GI-ZONE-05', expectedGiZone: 'GI-ZONE', picked: true, staged: true, loaded: true, packStation: null },
      { hu: '9000007061', currentBin: 'GI-ZONE-05', expectedGiZone: 'GI-ZONE', picked: true, staged: true, loaded: false, packStation: null },
      { hu: '9000007062', currentBin: 'PACK-01', expectedGiZone: 'GI-ZONE', picked: true, staged: false, loaded: false, packStation: 'PACK-01' }
    ],
    warehouseTasks: [
      { wt: 'WT-4716-001', wo: 'WO-9040', activity: 'PICK', status: 'CONFIRMED', exceptionCode: null, sourceBin: 'A-03-01', destBin: 'PACK-01', product: 'MAT-6000', qty: 30 },
      { wt: 'WT-4716-002', wo: 'WO-9041', activity: 'STAGE', status: 'OPEN', exceptionCode: null, sourceBin: 'PACK-01', destBin: 'GI-ZONE-05', product: 'MAT-6000', qty: 10 },
      { wt: 'WT-4716-003', wo: 'WO-9042', activity: 'LOAD', status: 'OPEN', exceptionCode: null, sourceBin: 'GI-ZONE-05', destBin: 'TU-4716', product: 'MAT-6000', qty: 20 }
    ],
    stockChecks: [],
    binBlocks: [],
    logs: []
  }
];

module.exports = deliveries;
