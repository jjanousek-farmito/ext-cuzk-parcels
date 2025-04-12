# CMZF Chrome Extension – CRM + CUZK

## Description
Rozšíření pro prohlížeč Chrome, které usnadňuje kontrolu a vyhledávání informací o pozemcích v katastru nemovitostí ČR. Rozšíření je určeno pro uživatele systému CRM CMZF, kteří chtějí mít rychlý přístup k informacím o nemovitostech přímo z jejich CRM systému.
- Rozříení eviduje parcely podle nákupních případů
- Sbírá údaje o pozemcích v session paměti prohlížeče
    - neukládá je na server,
    - data jsou k dispozici pouze v rámci aktuálního prohlížeče
    - dokud uživatel nezavře prohlížeč, nevymaže session
    - neukládá žádné osobní údaje

## Load unpacked extensions

[Getting Started Tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)


1. Stáhněte si poslední verzi rozšíření z repozitáře na GitHubu [zde](https://github.com/jjanousek-farmito/ext-cuzk-parcels/releases)
    1. Vyberte nejnovější verzi rozšíření podle čísla verze
    2. Stáhněte si soubor `vX.X.X.zip` kde `X.X.X` je číslo verze
2. Rozbalte stažený soubor do libovolného adresáře na vašem počítači.
    1. Složku si uložte na bezpečné místo, abyste ji mohli později použít.
3. Otevřete stránku správy rozšíření na adrese `chrome://extensions`.
4. Povolte režim pro vývojáře kliknutím na přepínač vedle položky `Režim pro vývojáře` v pravém horním rohu.
5. Klepněte na tlačítko `Load Unpacked` v levém horním rohu.
6. Vyberte adresář `ext-cuzk-pv` (nebo jiný název, který jste použili při rozbalení) a klikněte na `Select Folder`.
7. Rozšíření by se mělo nyní načíst a zobrazit na stránce správy rozšíření.
8.  Pokud chcete rozšíření aktualizovat, stačí stáhnout novou verzi a opakovat kroky 3-9.
9.  Složku `ext-cuzk-pv` musíte mít stále na disku, jinak rozšíření nebude fungovat. Pokud ji odstraníte, rozšíření se odinstaluje

## Development

```bash
# install dependencies
npm i

# build files to `/dist` directory
# HMR for extension pages and content scripts
npm run dev
```

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

## Extension structure

- service worker
- content
- options


### Service Worker
Handles the background tasks and events. It is responsible for managing the extension's lifecycle, handling network requests, and performing background operations.

### Content
Handles the interaction with the web pages. It can modify the content of the pages, listen for events, and communicate with the background script.

### Options
Provides a user interface for the extension's options. It allows users to configure the extension's settings and preferences.

## Extension lifecycle

1. **Installation**: The extension is loaded unpacked.
2. **Activation**:
    1. CRM: The extension is activated when the user navigates to `/purchase/opportunity/<opportunityId>`
    2. CUZK.auth:
        - The extension is activated on any page of the CUZK domain (`nahlizenidokn.cuzk.gov.cz/*`).
    1. CUZK.parcel:
        - The extension is activated on any parcel detail page. (Url contains hash, so it is triggered by all /* pages)

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.