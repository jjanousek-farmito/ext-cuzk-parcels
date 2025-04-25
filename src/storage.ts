
import { writable, type Writable } from "svelte/store";
import type { Parcel } from "./model/parcel";

/**
 * Creates a persistent Svelte store backed by Chrome's sync storage.
 * @template T The type of the store's value
 * @param key The key to use in Chrome's storage
 * @param initialValue The initial value of the store
 * @param chromeStorageType The type of Chrome storage to use (default: "sync")
 * @returns A writable Svelte store
 */
export function persistentStore<T>(key: string, initialValue: T, chromeStorageType?: chrome.storage.AreaName): Writable<T> {
    const store = writable(initialValue);
    chromeStorageType = chromeStorageType || "sync";
    const chromeStorage = chrome.storage[chromeStorageType] as chrome.storage.StorageArea;
    // Ensure each value is updated exactly once in store and in chrome storage
    let storeValueQueue: T[] = [];
    let chromeValueQueue: T[] = [];

    function watchStore() {
        store.subscribe((value) => {
            if (chromeValueQueue.length > 0 && value === chromeValueQueue[0]) {
                chromeValueQueue.shift();
                return;
            }

            storeValueQueue.push(value);
            chromeStorage.set({ [key]: value });
        });
    }

    function watchChrome() {
        chromeStorage.onChanged.addListener((changes) => {
            if (!Object.hasOwn(changes, key)) return;

            const value = changes[key].newValue as T;
            if (storeValueQueue.length > 0 && value === storeValueQueue[0]) {
                storeValueQueue.shift();
                return;
            }

            chromeValueQueue.push(value);
            store.set(value);
        });
    }

    // Initialize the store with the value from Chrome storage
    chromeStorage.get(key).then((result) => {
        const value = Object.hasOwn(result, key) ? result[key] : initialValue;
        chromeValueQueue.push(value);
        store.set(value);
        watchStore();
        watchChrome();
    });

    return store;
}

export const cuzkLoginStatus = persistentStore("cuzkLogin", false);

if (import.meta.env.VITE_CUZK_AUTH_BYPASS) {
    console.log("[CRM_CUZK]: CUZK auth bypass enabled");
    cuzkLoginStatus.set(true);
}

type Opportunities = {
    [opportunityId: string]: Parcel[];
};

export const opportunities = persistentStore("opportunities", {} as Opportunities, "local");

export const assets = persistentStore("assets", {} as Opportunities, "local");

const defaultConfig = {
    cuzkAutoSessionAlarmName: String(import.meta.env.VITE_CUZK_AUTO_SESSION_NAME),
    cuzkAutoSession: Boolean(import.meta.env.VITE_CUZK_AUTO_SESSION),
    autoCloseDelay: Number(import.meta.env.VITE_CLOSE_TAB_DELAY),
    autoSessionDelay: Number(import.meta.env.VITE_CUZK_AUTO_SESSION_DELAY),
};

export const config = persistentStore("config", defaultConfig, "local");