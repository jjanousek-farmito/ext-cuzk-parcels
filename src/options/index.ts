import { mount } from "svelte";
import "../tailwind.css";
import Options from "@/components/Options.svelte";
import { config } from "@/storage";


// Options
// https://developer.chrome.com/docs/extensions/mv3/options/

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(Options, { target, props: { config } });
    }
}

document.addEventListener("DOMContentLoaded", render);
