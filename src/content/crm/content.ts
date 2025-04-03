import { mount } from "svelte";

import Controls from "@/components/Controls.svelte";

// Some svelte component on the page
const target = document.body.querySelector("#home.active");
console.log("target", target);


if (target && target.firstChild) {
    // Mount the Svelte component to the target element
    mount(Controls, {
        target: target,
        anchor: target.firstChild
    });

    chrome.runtime.sendMessage({type: "init"});
}