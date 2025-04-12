/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OFFLINE_MODE: boolean
    readonly VITE_CLOSE_TAB_DELAY: number
    readonly VITE_CUZK_URL: string,
    VITE_CUZK_LOGIN_ALARM_NAME: string,
    // more env variables...
  }