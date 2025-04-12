import { Validity, type Parcel } from "@/model/parcel";
import { cuzkLoginStatus, config, opportunities } from "@/storage";
import { get } from "svelte/store";
import createAlarm from "./alarm";

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function openTab(url: string, active: boolean = true, callback: (tab: any) => void = () => { }) {
    chrome.tabs.create({ url, active }, callback);
}

export function closeTab(tab: any) {
    chrome.tabs.remove(tab.id, () => {
        console.log(`[CRM_CUZK]: Tab ${tab.id} closed`);
    });
}

export function closeTabAfterDelay(delay?: number) {
    return (tab: any) => setTimeout(() => {
        closeTab(tab);
    }, delay || get(config).autoCloseDelay * 1000);
}

export function openCuzk(active: boolean, callback: (tab: any) => void = () => { }) {
    const URL = import.meta.env.VITE_CUZK_URL;
    openTab(URL, active, callback);
}

export function validateParcel(parcel: Parcel): Parcel {
    // Check if the parcel data is valid
    //
    const ownerMatch = parcel.cuzk?.owners?.some(({ owner }: { owner: string }) =>
        compareStrings(parcel.crm.owner, owner) || compareNames(parcel.crm.owner, owner)
    ) || false;

    const areaMatch = compareStrings(parcel.crm.area, parcel.cuzk?.area);
    const parcelNumberMatch = compareStrings(parcel.crm.parcelNumber, parcel.cuzk?.parcelNumber);
    const lvMatch = compareStrings(parcel.crm.lv, parcel.cuzk?.lv);
    const seal = parcel.cuzk?.seal;
    const duplicate = parcel.cuzk?.duplicate;
    const mismatch = parcel.cuzk?.mismatch;

    const otherRecords = parcel.cuzk?.otherRecords;
    const excludeRecords = [
        "Změna číslování parcel",
        "Změna výměr obnovou operátu",
        "dobývací prostor",
    ];

    const hasImportantOtherRecords = otherRecords?.some(
        (r: string) => !excludeRecords.includes(r),
    );

    // const hasProtection = parcel.cuzk?.protection?.length > 0;
    const hasRestrictions = parcel.cuzk?.restrictions?.length > 0;

    const hasDiscrepancies =
        !ownerMatch ||
        duplicate ||
        !areaMatch ||
        !lvMatch ||
        !areaMatch ||
        mismatch ||
        seal ||
        hasImportantOtherRecords;

    const hasOtherRecords =
        hasImportantOtherRecords || hasRestrictions;

    if (!hasDiscrepancies && !hasOtherRecords) {
        parcel.validity = Validity.VALID;
    }
    if (hasOtherRecords) {
        parcel.validity = Validity.UNKNOWN;
    }
    // If there are discrepancies, mark the parcel as invalid
    if (hasDiscrepancies) {
        parcel.validity = Validity.INVALID;
    }

    parcel.validationDetail = {
        owner: ownerMatch,
        duplicate,
        area: areaMatch,
        parcelNumber: parcelNumberMatch,
        lv: lvMatch,
        mismatch,
        hasOtherRecords,
        hasImportantOtherRecords,
        hasRestrictions,
        seal,
        // hasProtection,
        // protectionRecords: parcel.cuzk?.protection || [],
        restrictionsRecords: parcel.cuzk?.restrictions || [],
        otherRecords: parcel.cuzk?.otherRecords || [],
    };
    return parcel;
}

function compareStrings(a: any, b: any): boolean {
    if (a === undefined || b === undefined) return false;
    return a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();
}

function compareNames(a: string, b: string): boolean {
    if (a === undefined || b === undefined) return false;

    const aParts = a.split(" ");
    const bParts = b.split(" ");

    //remove titles by filtering out parts with dot
    const aFiltered = aParts.filter((part) => !part.includes("."));
    const bFiltered = bParts.filter((part) => !part.includes("."));

    //sort the arrays
    aFiltered.sort();
    bFiltered.sort();

    // compare
    if (aFiltered.length !== bFiltered.length) return false;

    for (let i = 0; i < aFiltered.length; i++) {
        if (aFiltered[i].toLowerCase() !== bFiltered[i].toLowerCase()) {
            return false;
        }
    }

    return true

}

export function findOpportunityIdByCuzkTabId(tabId: number, opportunities: { [opportunityId: string]: Parcel[] }) {
    const opportunityId = Object.entries(opportunities).find(([opId, opportunityParcels]) => {
        const hasTab = opportunityParcels.some((parcel: Parcel) => {
            return parcel.cuzk?.tabId === tabId;
        })
        if (hasTab) {
            return opId;
        }
    })
    if (!opportunityId) return null;
    return opportunityId?.[0]
}

export async function cuzkAuth() {
    openCuzk(false, closeTabAfterDelay());
    await sleep(1000)
    console.log("[CRM_CUZK]: CUZK auth:",get(cuzkLoginStatus));


    if (!get(cuzkLoginStatus)) {
        console.log("[CRM_CUZK]: User is not logged in to CUZK");
        //open cuzk login page
        openCuzk(true);
        return false;
    }
    return true;
}

export function updateParcels(opId: number, parcels: Parcel[]) {
    if (!opId || !parcels || parcels.length === 0) return;
    opportunities.update((ops) => {
        ops[opId] = parcels;
        return ops;
    })
}

export function initCuzkAlarm(): boolean {
    //if config cuzkAutoSession is false clear alarm
    const clearAlarm = () => {
        console.log("[CRM_CUZK]: CUZK auto session is disabled");
        chrome.alarms.clear(import.meta.env.VITE_CUZK_LOGIN_ALARM_NAME);
        return false;
    }

    if (!get(config).cuzkAutoSession) {
        return clearAlarm();
    }

    createAlarm(import.meta.env.VITE_CUZK_LOGIN_ALARM_NAME, () => {
        // if user disabled auto session, clear alarm on next trigger
        if (!get(config).cuzkAutoSession) {
            return clearAlarm();
        }

        if (!get(cuzkLoginStatus)) {
            console.log("[CRM_CUZK]: User is not logged in to CUZK");
            openCuzk(true);
            return false;
        }

        console.log("[CRM_CUZK]: CUZK auto session alarm triggered");
        openCuzk(false, closeTabAfterDelay());
    });

    return true;
}