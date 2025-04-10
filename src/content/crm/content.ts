import { mount } from "svelte";
import "@/global.css";
import "./styles.css";

import Controls from "@/components/Controls.svelte";
import { parseRowData, validationDetailReport } from "./utils";
import { getOpportunityId, getTableRows, setRowsId } from "./utils";

import type { Parcel } from "@/model/parcel";
import { opportunities } from "@/storage";
import { get } from "svelte/store";

let id: number;

let controls: any;

init();

function init() {
    id = getOpportunityId();

    if (!id) {
        console.log("[CRM_CUZK]: Invalid opportunity ID", id);
        return;
    }

    // get the table rows
    const rows = getTableRows();
    const parcels: Parcel[] = rows.map(parseRowData);

    // render the controls
    console.log("[CRM_CUZK]: Rendering controls with parcels:", parcels);

    render(parcels);

    // add row id to each row
    setRowsId(rows);

    opportunities.subscribe((ops) => {
        const parcels = ops[id]
        if (!parcels) {
            console.log("[CRM_CUZK]: No parcels found for opportunity ID:", id);
            return;
        }

        // add click listener to each row
        addClickListenerToFirstCell(parcels);
    });
}


function render(parcels: Parcel[] = []) {
    const target = document.body.querySelector("#home");
    if (target && target.firstChild) {
        // Mount the Svelte component to the target element
        controls = mount(Controls, {
            target: target,
            anchor: target.firstChild,
            props: {
                parcels
            },
        });
    }
}

function addClickListenerToFirstCell(parcels: Parcel[]) {
    parcels.forEach((parcel) => {
        const row = document.getElementById(parcel.parcelNumber);
        if (!row) {
            console.log("[CRM_CUZK]: Row not found for parcel:", parcel);
            return;
        }

        const firstCell = row.querySelector("td");
        if (!firstCell) {
            console.log("[CRM_CUZK]: First cell not found for row:", row);
            return;
        }

        firstCell.addEventListener("click", (e) => {
            //dirty: directly access the mounted component from global scope
            console.log("[CRM_CUZK]: Clicked on row:", parcel);

            controls.showDialog({
                title: parcel.parcelNumber,
                message: validationDetailReport(parcel),
            });

            e.stopPropagation();
        });
    })
}