# CMZF Chrome Extension – CRM + CUZK

## Description
Rozšíření pro prohlížeč Chrome, které usnadňuje kontrolu a vyhledávání informací o pozemcích v katastru nemovitostí ČR. Rozšíření je určeno pro uživatele systému CRM CMZF, kteří chtějí mít rychlý přístup k informacím o nemovitostech přímo z jejich CRM systému.
- Rozříení eviduje parcely podle nákupních případů
- Sbírá údaje o pozemcích v session paměti prohlížeče
    - neukládá je na server,
    - data jsou k dispozici pouze v rámci aktuálního prohlížeče
    - dokud uživatel nezavře prohlížeč, nevymaže session
    - neukládá žádné osobní údaje

## Development

```bash
# install dependencies
npm i

# build files to `/dist` directory
# HMR for extension pages and content scripts
npm run dev
```

### Load unpacked extensions

[Getting Started Tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

1. Open the Extension Management page by navigating to `chrome://extensions`.
2. Enable Developer Mode by clicking the toggle switch next to `Developer mode` in the top right corner.
3. Click the `LOAD UNPACKED` button in the top left corner.
4. Select the `/dist` directory.

## Build

```bash
# build files to `/dist` directory
$ npm run build
```

## Sidenote

Dev server sometimes doesn't work properly. Some issue with HMR following the working directory. For some errors extension will not reload properly. Neither console nor dev server will show any errors. Thus why it is important to use linter and check for problem in files via IDE or linter report.

If you encounter issues with the dev server, try the following:
1. save root files linked in manifest
2. refresh the extension in the browser:
   - Open the Extension Management page by navigating to `chrome://extensions`.
   - Click the refresh icon next to the extension
3. restart the dev server