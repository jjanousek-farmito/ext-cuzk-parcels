export class Auth {
    isLogged: boolean;
    constructor() {
        this.isLogged = false;
    }

    // CUZK
    isLoggedIn() {
        const loginLink = document.querySelector(
            "div#header_right a#ctl00_loginView_linkLogin",
        );
        const logoutLink = document.querySelector(
            "div#header_right a#ctl00_loginView_linkLogout",
        );

        if (loginLink) return false;

        if (logoutLink) return true;

        return false;
    }

    // CUZK
    setLoginStatus(loginStatus: boolean) {
        chrome.runtime.sendMessage({
            type: "post-login-status",
            data: loginStatus,
        });

        return loginStatus;
    }

    // CRM
    async getLoginStatus() {
        // send message to background script to open new tab
        let loginStatusResponse = await chrome.runtime.sendMessage({
            type: "get-login-status",
        });
        let loginStatus = loginStatusResponse.data;
        console.log("[CRM+CUZK]: User is logged in:", loginStatus);

        return loginStatus;
    }


    async auth() {
        let loginStatus: boolean = this.isLoggedIn();
        this.isLogged = loginStatus;
        console.log("[CRM+CUZK]: User is logged in:", loginStatus);

        //prevent the function from blocking the main thread
        setTimeout(() => this.setLoginStatus(loginStatus), 0);

        return loginStatus;
    }

    msgHandler(msg: any) {
        if (msg.type === "post-login-status") {
            this.isLogged = msg.data;
            console.log("[CRM+CUZK]: User is logged in:", this.isLogged);
        }

        if (msg.type === "get-login-status") {
            this.isLogged = msg.data;
            console.log("[CRM+CUZK]: User is logged in:", this.isLogged);
        }

        if (msg.type === "cuzk-login") {
            const URL = "https://nahlizenidokn.cuzk.gov.cz/";
            chrome.tabs.create({ url: URL, active: true });
        }

        return this.isLogged;
    }

    async init() {
        let loginStatus = await this.getLoginStatus();
        this.isLogged = loginStatus;
        console.log("[CRM+CUZK]: User is logged in:", this.isLogged);

        return loginStatus;
    }


}