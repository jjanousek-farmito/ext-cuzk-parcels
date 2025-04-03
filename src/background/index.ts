import { count } from "../storage";

import { Auth } from "@/utils/auth";

const auth = new Auth();

let isLoggedIn: boolean = false;
let crmTabId: number | null = null;


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const authMessages = ["init", "cuzk-login", "post-login-status", "get-login-status"];
    const parcelMessages = ["parcel-data", "parcel-data-response"];
    if (authMessages.includes(msg.type)) {
        isLoggedIn = auth.msgHandler(msg);
    }

    if (parcelMessages.includes(msg.type)) {
        console.log("Parcel message received:", msg);
        //send message to content script
        chrome.tabs.sendMessage(crmTabId!, msg);
    }

    if (msg.type === "init") {
        crmTabId = sender.tab.id;
        console.log("Tab ID set:", crmTabId);
    }

    if (msg.type == "close-cuzk-tabs") {
        console.log("Closing all tabs");
        for (const tabId in parcelsQueue) {
            closeLandCheckTab(parseInt(tabId));
        }
    }

    if (msg.type == "close-cuzk-tab") {
        //find tab id by parcel number
        console.log("Closing tab with parcel:", msg.parcelNumber);

        let tabId = Object.keys(parcelsQueue).find(key => parcelsQueue[key] == msg.parcelNumber);
        console.log("Tab ID to close", tabId);

        setTimeout(function () {
            closeLandCheckTab(parseInt(tabId));
        }, 3000);
    }




});