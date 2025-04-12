import { Validity, type Parcel } from "@/model/parcel";
import { cuzkLoginStatus } from "@/storage";

export function setRowsId(rows: HTMLTableRowElement[]) {
    //remove headers
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const parcelNumber = getParcelNumber(row);
        row.id = parcelNumber;
    }
}

export function getTableRows(includeRemoved: boolean = false): HTMLTableRowElement[] | [] {
    const table = document.querySelector("form[action$='/update-parcely'] table");
    if (!table) return []

    const includeRemovedSelector = includeRemoved ? "" : ":not([style*='text-decoration: line-through;'])";
    const parcelsSelector = `tr:not(:first-of-type):not(:last-of-type)${includeRemovedSelector}`;

    let rows = Array.from(
        table.querySelectorAll(parcelsSelector)) as HTMLTableRowElement[];
    return rows || [];
}

export async function messageToSW(msg: any, isService: boolean = false) {
    let id;
    if (!isService) id = getOpportunityId();
    // Send a message to the service worker
    const payload = {
        id,
        ...msg
    }

    console.log("[CRM_CUZK]: Sending message to service worker:", payload);
    return await chrome.runtime.sendMessage(payload);
}

export function getOpportunityId(): number {
    const opportunityId = parseInt(window.location.href.split("/").at(-1) ?? "")
    if (isNaN(opportunityId) || opportunityId <= 0 || !opportunityId) {
        console.log("[CRM_CUZK]: Invalid opportunity ID", opportunityId);
        return 0;
    }
    return opportunityId;
}

export function getParcelsOwner(row: HTMLTableRowElement): string {
    const tab = document.querySelector("#detail-tab > strong") as HTMLSpanElement;
    if (!tab) return ""

    // remove "prodej" suffix;
    const owner = tab?.innerText?.split(" – ")[1]?.replace(/prodej.*/gi, "").trim() || "";
    return owner
}

export function getParcelNumber(row: HTMLTableRowElement): string {
    // return row.querySelector("td:nth-child(7)")?.innerText
    if (!row) return "";
    const parcelNumberCell = row.querySelector("td:nth-child(7)") as HTMLTableCellElement;
    const parcelNumber = parcelNumberCell?.innerText;
    if (!parcelNumber) return "";

    return parcelNumber;
}

export function getParcelArea(row: HTMLTableRowElement): string {
    const areaInput = row.querySelector("td:nth-child(10) input") as HTMLInputElement
    const area = areaInput?.value;
    if (!area) return ""
    return area
}

export function getCadastralLink(row: HTMLTableRowElement): string {
    const link = row.querySelector("td:nth-child(19) a") as HTMLAnchorElement;
    if (!link) return ""
    return link.href;
}

export function getLV(row: HTMLTableRowElement): string {
    // return row.querySelector("td:nth-child(5)")?.innerText;
    const LVCell = row.querySelector("td:nth-child(5)") as HTMLTableCellElement;
    const LV = LVCell?.innerText;
    if (!LV) return "";

    return LV;
}

export function parseRowData(row: HTMLTableRowElement): Parcel {
    const parcelNumber = getParcelNumber(row);
    const lv = getLV(row);
    const area = getParcelArea(row);
    const url = getCadastralLink(row);
    const owner = getParcelsOwner(row);

    return {
        parcelNumber,
        area,
        lv,
        owner,
        crm: {
            parcelNumber,
            area,
            lv,
            owner,
        },
        url,
    }
}

export function addParcelRowHighlight(parcel: Parcel, validity: Validity, detail: string) {
    if (!parcel) return;
    if (!parcel.parcelNumber) {
        console.log("[CRM_CUZK]: Parcel number not found:", parcel);
        return;
    }
    if (!validity) {
        console.log("[CRM_CUZK]: Validity not found for parcel:", parcel.parcelNumber);
        return;
    }
    const row = document.getElementById(parcel.parcelNumber) as HTMLTableRowElement;
    if (!row) {
        console.log("[CRM_CUZK]: Row not found for parcel:", parcel.parcelNumber);
        return;
    }

    if (row.classList.contains("highlighted")) {
        return;
    }

    const highlightIcon = {
        [Validity.VALID]: "fa-check",
        [Validity.INVALID]: "fa-exclamation-triangle",
        [Validity.UNKNOWN]: "fa-question",
        [Validity.NOT_FOUND]: "fa-question",
    }[validity] ?? Validity.UNKNOWN;

    const background = {
        [Validity.VALID]: "bg-success-light",
        [Validity.UNKNOWN]: "bg-warning-light",
        [Validity.NOT_FOUND]: "bg-warning-light",
        [Validity.INVALID]: "bg-danger-light",
    }[validity] ?? "bg-warning-light";

    row?.classList.add(background);

    const warningIcon = document.createElement("i");
    warningIcon.classList.add("fa", "cursor-pointer", highlightIcon);
    if (detail) warningIcon.title = "Detail kontrly PV";
    row.querySelector("td:first-of-type")?.appendChild(warningIcon);

    row.classList.add("highlighted");
}

export function removeParcelRowHighlight(parcel: Parcel) {
    if (!parcel) return;
    if (!parcel.parcelNumber) {
        console.log("[CRM_CUZK]: Parcel number not found:", parcel);
        return;
    }
    const row = document.getElementById(parcel.parcelNumber) as HTMLTableRowElement;
    if (!row) {
        console.log("[CRM_CUZK]: Row not found for parcel:", parcel.parcelNumber);
        return;
    }
    if (row.classList.contains("highlighted")) {
        row.classList.remove("highlighted", "bg-success-light", "bg-danger-light", "bg-warning-light");
        const warningIcon = row.querySelector("i.fa");
        if (warningIcon) {
            warningIcon.remove();
        }
    }
}

export function validationDetailReport(parcel: Parcel): string {
    // generate text report of the validation detail
    const detail = parcel.validationDetail;
    if (!detail || !parcel.cuzk) {
        console.log("[CRM_CUZK]: No validation detail found for parcel:", parcel);
        return "";
    }

    const cell = (type: String, text: string, span: number = 1): string => `<${type} colspan="${span}">${text}</${type}>`;

    const tr = (rowContent: string): string => `<tr>${rowContent}</tr>`;
    const th = (rowContent: string): string => `<tr class="bg-dark text-white">${rowContent}</tr>`;

    const bodyRow = (...cells: any[]): string => tr(cells.map((content) => cell("td", content)).join(""));
    const headerRow = (...cells: any[]): string => th(cells.map((content) => cell("th", content)).join(""));
    const bodyRowSpan = (...cells: any[]): string => tr(cells.map((content) => cell("td", content, 4)).join(""));
    const headerRowSpan = (...cells: any[]): string => th(cells.map((content) => cell("th", content, 4)).join(""));

    console.log("[CRM_CUZK]: Validation detail report:", parcel);
    console.log("[CRM_CUZK]: Validation detail report:", detail);


    const header = headerRow("Parcela", "CRM", "CUZK", "Status");
    const crm = parcel.crm;
    const cuzk = parcel.cuzk;
    console.log("[CRM_CUZK]: Validation detail report:", cuzk);

    const owners = cuzk.owners?.map(({ owner }: { owner: string }) => owner).join("<br/>") || "";
    const FAIL = "<strong>FAIL</strong>";
    const OK = "OK";
    const body =
        bodyRow("Parcela", crm.parcelNumber, cuzk.parcelNumber, detail.parcelNumber ? OK : FAIL) +
        bodyRow("LV", crm.lv, cuzk.lv, detail.lv ? OK : FAIL) +
        bodyRow("Vlastník", crm.owner, owners, detail.owner ? OK : FAIL) +
        bodyRow("Plocha", crm.area, cuzk.area, detail.area ? OK : FAIL) +

        (cuzk.duplicate ?
            headerRowSpan("Duplicitní zápis vlastnictví") +
            bodyRowSpan(cuzk.duplicate ? "<strong>DUPLICITA</strong>" : "")
            : "") +

        (detail.mismatch?.length > 0 ?
            headerRowSpan("Nesoulady") +
            detail.mismatch.map((record: string) => bodyRowSpan(record)).join("")
            : "") +

        (detail.otherRecords?.length > 0 ?
            headerRowSpan("Ostatní zápisy") +
            detail.otherRecords.map((record: string) => bodyRowSpan(record)).join("")
            : "") +

        (detail.restrictionsRecords?.length > 0 ?
            headerRowSpan("Omezení vlastnického práva") +
            detail.restrictionsRecords.map((record: string) => bodyRowSpan(record)).join("")
            : "") +

        (cuzk.seal ?
            headerRowSpan("Plomba") +
            bodyRowSpan(cuzk.seal) : "");

    const tableReport = `<table class="table table-bordered table-striped" >
    <thead>
        ${header}
    </thead>
        <tbody>
            ${body}
    </tbody>
</table>
<a href="${parcel.url}" target="_blank" class="btn btn-primary btn-sm">Otevřít v CUZK</a>`;

    return tableReport;
}

export function insertGroupHeaders(rows: HTMLTableRowElement[], columnIndex: number = 5) {
    // Insert group headers based on the values in the specified column
    let lastValue = "";
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const value = (row.querySelector(`td:nth-child(${columnIndex})`) as HTMLTableCellElement)?.innerText;
        const groupRow = `<tr class="bg-dark text-white lv-header"><td colspan="20"><h5 class="m-0">LV: ${value}</h5></td></tr>`;
        if (value !== lastValue) {
            row.insertAdjacentHTML("beforebegin", groupRow);
            lastValue = value;
        }
    }
}

export function removeGroupHeaders() {
    // Remove group headers
    const headers = document.querySelectorAll(".lv-header");
    headers.forEach(header => header.remove());
}

export async function openCuzkParcels(parcels: Parcel[]) {
    messageToSW({
        type: "crm-check-parcels",
        data: parcels
    });
}

export function registerParcels(): Parcel[] {
    const parcels = getTableRows(false).map(parseRowData);
    messageToSW({
        type: "crm-register-parcels",
        data: parcels
    });

    return parcels
}

export function cuzkLogin() {

    if (Boolean(Number(import.meta.env.VITE_OFFLINE_MODE))) {
        console.log();

        console.log("[CRM_CUZK]: CUZK login is disabled in offline mode");
        cuzkLoginStatus.set(true);
        return;
    }

    messageToSW({
        type: "cuzk-login",
    });
}

export function closeCuzkCards() {
    messageToSW({
        type: "crm-close-cuzk-tabs",
    });
}

export function applyValidations(parcels: Parcel[]) {
    parcels.forEach((parcel) => {
        if (!parcel.validity) {
            removeParcelRowHighlight(parcel);
        } else if (parcel.validity) {
            const validationReport = validationDetailReport(parcel);
            addParcelRowHighlight(parcel, parcel.validity, validationReport);
        }
    });
}