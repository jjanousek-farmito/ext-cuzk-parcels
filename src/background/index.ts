import { cuzkLoginStatus, opportunities } from "@/storage";
import { Validity, type Parcel } from "@/model/parcel";

import { closeTab, cuzkAuth, findOpportunityIdByCuzkTabId, initCuzkAlarm, openTab, validateParcel } from "./utils";

console.log("[CRM_CUZK]: Background script loaded");

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason !== "install") {

        // when login status changes and is true, start auto session
        cuzkLoginStatus.subscribe(async (loginStatusValue) => {
            console.log("[CRM_CUZK]: Login status changed:", loginStatusValue);
            initCuzkAlarm();
        })
    }
});

chrome.runtime.onMessage.addListener(async function (msg, sender) {
    if (msg.type === "cuzk-login") {
        await cuzkAuth()
    }

    if (msg.type === "crm-register-parcels") {
        console.log("[CRM_CUZK]: Registering parcels:", msg.data);
        const opportunityId = msg.id as string;
        opportunities.update((ops) => {
            //if parcels are already registered, do not register them again
            if (!ops[opportunityId]) {
                ops[opportunityId] = msg.data;
            } else {
                const parcels = ops[opportunityId].map((parcel: Parcel) => {
                    if (parcel.validity) {
                        parcel.validity = undefined;
                        parcel.validationDetail = undefined;
                    }

                    if (parcel.cuzk) {
                        parcel.cuzk = { tabId: parcel.cuzk.tabId };
                    }

                    return parcel;
                })
                ops[opportunityId] = parcels;
            }
            return ops;
        })
    }

    // recieve parcels data from CUZK
    if (msg.type === "cuzk-parcel-data") {
        console.log("[CRM_CUZK]: CUZK parcel data received:", msg.data);
        const cuzkTabId = sender.tab?.id!;
        //find parcel in store by cuzk tabId

        opportunities.update((ops) => {

            //cuzk has hashed url, so we need to find the opportunityId by previously stored cuzk tabId
            const opportunityId = findOpportunityIdByCuzkTabId(cuzkTabId, ops);

            if (!opportunityId) {
                console.log("[CRM_CUZK]: No opportunity found for CUZK tab ID:", cuzkTabId);
                console.log("[CRM_CUZK]: Current opportunities:", ops);

                return ops;
            }

            //store cuzk data in parcel
            const updatedParcels = ops[opportunityId].map((p: Parcel) => {
                if (p.cuzk?.tabId == cuzkTabId) {
                    p.cuzk = {
                        ...p?.cuzk,
                        ...msg.data,
                        tabId: sender.tab?.id, //store cuzk tabId in parcel
                    }
                    return validateParcel(p);
                }
                return p;
            }) as Parcel[];

            ops[opportunityId] = updatedParcels;
            console.log("[CRM_CUZK]: Updated parcels:", ops[opportunityId]);
            return ops
        })
        console.log("[CRM_CUZK]: CUZK tab closed");
    }

    // open CUZK parcels in new tabs
    if (msg.type === "crm-check-parcels") {
        // expect user to not be logged in to CUZK, so we need to open CUZK login page
        let isLoggedIn = await cuzkAuth()
        if (!isLoggedIn) {
            console.log("[CRM_CUZK]: User is not logged in to CUZK, opening login page");
            return;
        }

        const opportunityId = msg.id as string;
        const parcels = msg.data;
        console.log("[CRM_CUZK]: Opening parcels:", parcels);
        opportunities.update((ops) => {
            if (!ops[opportunityId]) {
                ops[opportunityId] = parcels;
            }

            // open cuzk tabs for each parcel and store tabId in parcel
            const registeredParcels = parcels.map((parcel: Parcel) => {
                // check if parcel is already registered
                if (!parcel.url) {
                    console.log("[CRM_CUZK]: Parcel has no URL:", parcel);
                    parcel.validity = Validity.NOT_FOUND;
                    return parcel;
                }
                openTab(parcel.url, false, (tab: any) => {
                    //store cuzk tabId in parcel => backreference to be able to close it later
                    if (!parcel.cuzk) parcel.cuzk = {}
                    parcel.cuzk.tabId = tab.id;
                    console.log("[CRM_CUZK]: Parcel opened in new tab:", parcel);

                })
                return parcel;
            })
            ops[opportunityId] = registeredParcels;
            console.log("[CRM_CUZK]: crm-check-parcels Updated parcels:", ops[opportunityId]);

            return ops;
        })


    }

    // close CUZK parcels tabs
    if (msg.type == "crm-close-cuzk-tabs") {
        const opportunityId = msg.id as string;
        opportunities.update((ops) => {
            const parcels = ops[opportunityId] as Parcel[];
            console.log("[CRM_CUZK]: Closing CUZK tabs for parcels:", parcels);
            parcels.forEach((parcel: Parcel) => {
                if (!parcel.cuzk || !parcel.cuzk.tabId) {
                    return;
                }
                closeTab({ id: parcel.cuzk?.tabId });
                parcel.cuzk.tabId = undefined;
            })
            ops[opportunityId] = parcels;
            console.log("[CRM_CUZK]: CUZK tabs closed");
            console.log("[CRM_CUZK]: Updated parcels:", ops[opportunityId]);

            return ops
        })

    }

    if (msg.type === "clear-storage") {
        await chrome.storage.session.clear();
        await chrome.storage.local.remove(["opportunities", "cuzkLoginStatus", "config"]);
        console.log("[CRM_CUZK_SW]: Storage opportunities cleared");
    }

    if (msg.type === "clear-alarms") {
        await chrome.alarms.clearAll();
        console.log("[CRM_CUZK_SW]: All alarms cleared");
    }
})
