/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OFFLINE_MODE: boolean
    readonly VITE_CLOSE_TAB_DELAY: number
    readonly VITE_CUZK_URL: string,
    readonly VITE_CUZK_AUTO_SESSION_NAME: string,
    // more env variables...
  }