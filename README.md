# SAP EWM Outbound Performance Cockpit

Runnable demo cockpit for SAP EWM outbound monitoring.

The demo uses a fake `/SCWM/MON`-style Excel export as the data source:

```text
data/ewm_scwm_mon_demo_export.xlsx
```

The backend parses this workbook, maps the monitor sheets into delivery/HU/WT/stock/log objects, derives the main blocker per delivery, and sends the enriched data to the frontend.

## Run

```bash
cd ewm_outbound_cockpit
npm start
```

Open:

```text
http://localhost:3000
```

Requirements:

- Node.js
- Python 3

No npm packages are required.

## What the Excel simulates

The workbook contains these sheets:

| Sheet | Meaning |
|---|---|
| Deliveries_MON | Outbound delivery / TU / wave status |
| HUs_MON | HU status, current bin, picking/staging/loading flags |
| WarehouseTasks_MON | WT/WO status, activity, exception codes |
| Stock_MON | Required vs. available stock |
| BinBlocks_MON | Blocked bins or HU/bin restrictions |
| AppLog_MON | Simulated application log messages |
| Dashboard | Human-readable Excel overview |
| Mapping | Explains how the sheets are used |

The join key is `DOCNO`.

Boolean fields use:

```text
X = true
blank = false
```

## Backend flow

```text
Excel /SCWM/MON export
        ↓
scripts/parseMonitorExcel.py
        ↓
server.js status derivation
        ↓
Frontend cockpit
```

## Replace the Excel file

Use the same sheet names and headers, then replace:

```text
data/ewm_scwm_mon_demo_export.xlsx
```

Alternative path:

```bash
EWM_MONITOR_EXCEL=/path/to/your/export.xlsx npm start
```

## Main APIs

```text
/api/stats        KPI summary
/api/deliveries   enriched delivery list
/api/deliveries/:deliveryId drilldown
```

## Logo

The sidebar logo uses:

```text
public/assets/company-logo.png
```

Replace that file with the real company logo and keep the same name. PNG with transparent background works best.

## Current UI features

- Language switch in the header: English and German.
- Cockpit title switches correctly:
  - English: `Outbound Performance Cockpit`
  - German: `Warenausgang Performance Cockpit`
- KPI buttons:
  - GI posted
  - Critical, not GI posted
  - Warnings, not GI posted
- Clicking a KPI applies the corresponding delivery filter and scrolls to `#deliveries`.
- By default, the delivery table shows all deliveries.
- Clicking a delivery row opens `#details`.
- The details section shows the specific delivery bottleneck, suggested next action and SAP-standard resolution steps.
- Root causes are shown as a compact expandable section below the KPI buttons.
- Refresh button, CSV export and visible data-source section have been removed.

## Windows / PowerShell note

The backend tries multiple Python commands automatically:

```text
py
python
python3
```

So on Windows PowerShell the demo should work even if the command is `py` instead of `python3`.

## Important note

This is a presentable demo architecture, not a productive SAP integration. For the real version, the Excel parser should be replaced with an SAP-facing layer, for example OData, CDS view, RFC, ABAP REST endpoint, or exported monitor variants.
