
export enum Validity {
    VALID = "VALID",
    INVALID = "INVALID",
    UNKNOWN = "UNKNOWN",
    NOT_FOUND = "NOT_FOUND",
}

export type Parcel = {
    parcelNumber: string;
    area: number | string;
    share?: number;
    lv: string;
    owner: string;
    validity?: Validity;
    url?: string;
    crm: {
        tabId?: number;
        parcelNumber: string;
        area: string;
        lv: string;
        owner: string;
        [key: string]: unknown;
    }
    cuzk?: {
        tabId?: number;
        parcelNumber?: string;
        area?: string;
        lv?: string;
        owner?: string;
        duplicate?: boolean;
        [key: string]: any;
        seal?: string;
    } | null;
    records?: {
        others: string[]
        protections: string[]
        restrictions: string[]
    }
    // Additional properties
    [key: string]: any;
}

export const dummyParcels: Parcel[] = [
    {
        parcelNumber: "123456/1",
        area: 100,
        lv: "LV123456",
        owner: "John Doe",
        crm: {
            parcelNumber: "123456/1",
            area: "100",
            lv: "LV123456",
            owner: "John Doe",
        },
        cuzk: {
            parcelNumber: "123456/1",
            area: "100",
            lv: "LV123456",
            owner: "John Doe",
        },
        records: {
            others: [],
            protections: [],
            restrictions: []
        }
    },
    {
        parcelNumber: "100",
        area: 200,
        lv: "123",
        owner: "Jane Doe",
        crm: {
            parcelNumber: "100",
            area: "200",
            lv: "123",
            owner: "Jane Doe",
        },
        cuzk: {
            parcelNumber: "100",
            area: "200",
            lv: "123",
            owner: "Jane Doe",
        },
        records: {
            others: [],
            protections: [],
            restrictions: []
        }
    }
]
