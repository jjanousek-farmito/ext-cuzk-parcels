import { cuzkLoginStatus } from "@/storage";

console.log("[CRM_CUZK]: CUZK auth script loaded");

//DOMContentLoaded event is not fired
setTimeout(() => {
    auth();
}, 500);

function auth() {
    let loginStatus: boolean = isLoggedIn();
    console.log("[CRM_CUZK]: CUZK login status:", loginStatus);

    cuzkLoginStatus.update((status) => {
        if (status !== loginStatus) {
            console.log("[CRM_CUZK]: Login status changed:", loginStatus);
            return loginStatus;
        }
        return status;
    });
}

// CUZK
function isLoggedIn() {
    const loginLink = document.querySelector(
        "div#header_right a#ctl00_loginView_linkLogin",
    );
    const logoutLink = document.querySelector(
        "div#header_right a#ctl00_loginView_linkLogout",
    );

    if (loginLink) return false

    if (logoutLink) return true;

    // If neither link is found, try to find them again
    if (!loginLink && !logoutLink) setTimeout(() => {
        auth();
    }, 500);

    return false;
}