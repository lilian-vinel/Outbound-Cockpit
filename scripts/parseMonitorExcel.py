#!/usr/bin/env python3
"""Parse a simple SAP EWM /SCWM/MON-style XLSX export into cockpit JSON.

No external dependencies are used. The parser reads the XLSX XML directly and maps
known sheet names to the JSON structure expected by the Node.js cockpit backend.
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import PurePosixPath

NS_MAIN = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
NS_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
NS_PKG_REL = "{http://schemas.openxmlformats.org/package/2006/relationships}"


def col_index_from_ref(cell_ref):
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    index = 0
    for char in letters:
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def read_xml(zf, name):
    try:
        return ET.fromstring(zf.read(name))
    except KeyError:
        return None


def read_shared_strings(zf):
    root = read_xml(zf, "xl/sharedStrings.xml")
    if root is None:
        return []

    strings = []
    for si in root.findall(f"{NS_MAIN}si"):
        texts = []
        direct = si.find(f"{NS_MAIN}t")
        if direct is not None and direct.text is not None:
            texts.append(direct.text)
        for run in si.findall(f"{NS_MAIN}r"):
            t = run.find(f"{NS_MAIN}t")
            if t is not None and t.text is not None:
                texts.append(t.text)
        strings.append("".join(texts))
    return strings


def read_sheet_paths(zf):
    workbook = read_xml(zf, "xl/workbook.xml")
    rels = read_xml(zf, "xl/_rels/workbook.xml.rels")
    if workbook is None or rels is None:
        raise ValueError("Workbook XML is missing or invalid.")

    rid_to_target = {}
    for rel in rels.findall(f"{NS_PKG_REL}Relationship"):
        rid = rel.attrib.get("Id")
        target = rel.attrib.get("Target", "")
        if target.startswith("/"):
            target = target[1:]
        else:
            target = str(PurePosixPath("xl") / target)
        rid_to_target[rid] = target

    sheets = {}
    sheets_node = workbook.find(f"{NS_MAIN}sheets")
    if sheets_node is None:
        return sheets

    for sheet in sheets_node.findall(f"{NS_MAIN}sheet"):
        name = sheet.attrib.get("name")
        rid = sheet.attrib.get(f"{NS_REL}id")
        if name and rid in rid_to_target:
            sheets[name] = rid_to_target[rid]
    return sheets


def cell_value(cell, shared_strings):
    cell_type = cell.attrib.get("t")

    if cell_type == "inlineStr":
        inline = cell.find(f"{NS_MAIN}is")
        if inline is None:
            return ""
        texts = [t.text or "" for t in inline.findall(f".//{NS_MAIN}t")]
        return "".join(texts)

    value_node = cell.find(f"{NS_MAIN}v")
    if value_node is None or value_node.text is None:
        return ""

    raw = value_node.text
    if cell_type == "s":
        try:
            return shared_strings[int(raw)]
        except (ValueError, IndexError):
            return raw
    if cell_type == "b":
        return raw == "1"

    # Keep IDs like DOCNO/HU as strings if Excel stored them as numbers.
    # Convert obvious quantities/resource counts later in the mapping layer.
    return raw


def read_sheet(zf, sheet_path, shared_strings):
    root = read_xml(zf, sheet_path)
    if root is None:
        return []

    rows = []
    sheet_data = root.find(f"{NS_MAIN}sheetData")
    if sheet_data is None:
        return rows

    max_col = 0
    temp_rows = []
    for row in sheet_data.findall(f"{NS_MAIN}row"):
        cells = {}
        for cell in row.findall(f"{NS_MAIN}c"):
            ref = cell.attrib.get("r", "A1")
            col_idx = col_index_from_ref(ref)
            cells[col_idx] = cell_value(cell, shared_strings)
            max_col = max(max_col, col_idx)
        temp_rows.append(cells)

    for cells in temp_rows:
        rows.append([cells.get(i, "") for i in range(max_col + 1)])
    return rows


def rows_to_dicts(rows):
    if not rows:
        return []
    headers = [str(h).strip() for h in rows[0]]
    records = []
    for row in rows[1:]:
        if not any(str(v).strip() for v in row):
            continue
        record = {headers[i]: row[i] if i < len(row) else "" for i in range(len(headers))}
        records.append(record)
    return records


def truthy(value):
    return str(value).strip().upper() in {"X", "TRUE", "1", "YES", "Y"}


def number(value, default=0):
    try:
        if value is None or str(value).strip() == "":
            return default
        return int(float(str(value).replace(",", ".")))
    except ValueError:
        return default


def text(value):
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def excel_datetime(value):
    raw = text(value)
    if not raw:
        return ""
    if "T" in raw:
        return raw
    try:
        serial = float(raw)
    except ValueError:
        return raw

    # Excel serials in this demo workbook were written from ISO timestamps and
    # stored as UTC-like serial values. For the demo cockpit we display Berlin
    # local time on 2026-06-11, therefore +02:00 is applied.
    dt = datetime(1899, 12, 30) + timedelta(days=serial) + timedelta(hours=2)
    return dt.replace(microsecond=0).isoformat() + "+02:00"


def group_by(records, key):
    grouped = {}
    for record in records:
        grouped.setdefault(text(record.get(key)), []).append(record)
    return grouped


def build_deliveries(sheet_records):
    delivery_records = sheet_records.get("Deliveries_MON", [])
    hus_by_doc = group_by(sheet_records.get("HUs_MON", []), "DOCNO")
    wts_by_doc = group_by(sheet_records.get("WarehouseTasks_MON", []), "DOCNO")
    stock_by_doc = group_by(sheet_records.get("Stock_MON", []), "DOCNO")
    blocks_by_doc = group_by(sheet_records.get("BinBlocks_MON", []), "DOCNO")
    logs_by_doc = group_by(sheet_records.get("AppLog_MON", []), "DOCNO")

    deliveries = []
    for row in delivery_records:
        docno = text(row.get("DOCNO"))
        expected_zone = text(row.get("EXPECTED_GI_ZONE"))

        delivery = {
            "deliveryId": docno,
            "warehouse": text(row.get("LGNUM")),
            "tu": text(row.get("TU")),
            "carrier": text(row.get("CARRIER")),
            "route": text(row.get("ROUTE")),
            "shipTo": text(row.get("SHIP_TO")),
            "plannedGiTime": excel_datetime(row.get("PLANNED_GI_TIME")),
            "giPosted": truthy(row.get("GI_POSTED")),
            "giPostedAt": excel_datetime(row.get("GI_POSTED_AT")) or None,
            "door": text(row.get("DOOR")) or None,
            "truckStatus": text(row.get("TRUCK_STATUS")) or "Unknown",
            "wave": text(row.get("WAVE")),
            "waveReleased": truthy(row.get("WAVE_RELEASED")),
            "allWarehouseTasksCreated": truthy(row.get("ALL_WT_CREATED")),
            "queue": text(row.get("QUEUE")),
            "activeResources": number(row.get("ACTIVE_RESOURCES")),
            "openQueueTasks": number(row.get("OPEN_QUEUE_TASKS")),
            "hUs": [],
            "warehouseTasks": [],
            "stockChecks": [],
            "binBlocks": [],
            "logs": [],
        }

        for hu in hus_by_doc.get(docno, []):
            delivery["hUs"].append({
                "hu": text(hu.get("HU")),
                "topHu": text(hu.get("TOP_HU")),
                "currentBin": text(hu.get("CURRENT_BIN")),
                "expectedGiZone": text(hu.get("EXPECTED_GI_ZONE")) or expected_zone,
                "picked": truthy(hu.get("PICKED")),
                "staged": truthy(hu.get("STAGED")),
                "loaded": truthy(hu.get("LOADED")),
                "packStation": text(hu.get("PACK_STATION")) or None,
            })

        for wt in wts_by_doc.get(docno, []):
            delivery["warehouseTasks"].append({
                "wt": text(wt.get("WT")),
                "wo": text(wt.get("WO")),
                "activity": text(wt.get("ACTIVITY")),
                "status": text(wt.get("STATUS")),
                "exceptionCode": text(wt.get("EXCEPTION_CODE")) or None,
                "sourceBin": text(wt.get("SOURCE_BIN")),
                "destBin": text(wt.get("DEST_BIN")),
                "product": text(wt.get("PRODUCT")),
                "qty": number(wt.get("QTY")),
            })

        for stock in stock_by_doc.get(docno, []):
            delivery["stockChecks"].append({
                "product": text(stock.get("PRODUCT")),
                "batch": text(stock.get("BATCH")),
                "requiredQty": number(stock.get("REQUIRED_QTY")),
                "availableQty": number(stock.get("AVAILABLE_QTY")),
                "stockType": text(stock.get("STOCK_TYPE")),
                "sourceBin": text(stock.get("SOURCE_BIN")),
                "hu": text(stock.get("HU")),
            })

        for block in blocks_by_doc.get(docno, []):
            delivery["binBlocks"].append({
                "bin": text(block.get("BIN")),
                "blockType": text(block.get("BLOCK_TYPE")),
                "reason": text(block.get("REASON")),
            })

        for log in logs_by_doc.get(docno, []):
            delivery["logs"].append({
                "type": text(log.get("TYPE")),
                "object": text(log.get("OBJECT")),
                "subobject": text(log.get("SUBOBJECT")),
                "message": text(log.get("MESSAGE")),
                "timestamp": excel_datetime(log.get("TIMESTAMP")),
                "user": text(log.get("USER")),
            })

        deliveries.append(delivery)

    return deliveries


def parse_workbook(xlsx_path):
    with zipfile.ZipFile(xlsx_path) as zf:
        shared_strings = read_shared_strings(zf)
        sheet_paths = read_sheet_paths(zf)
        required_sheets = [
            "Deliveries_MON",
            "HUs_MON",
            "WarehouseTasks_MON",
            "Stock_MON",
            "BinBlocks_MON",
            "AppLog_MON",
        ]
        sheet_records = {}
        for sheet_name in required_sheets:
            path = sheet_paths.get(sheet_name)
            if not path:
                sheet_records[sheet_name] = []
                continue
            sheet_records[sheet_name] = rows_to_dicts(read_sheet(zf, path, shared_strings))
        return build_deliveries(sheet_records)


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: parseMonitorExcel.py <xlsx_path>")
    deliveries = parse_workbook(sys.argv[1])
    print(json.dumps(deliveries, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
