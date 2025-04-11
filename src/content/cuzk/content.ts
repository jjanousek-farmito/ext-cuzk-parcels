console.log("[CRM_CUZK]: CUZK Content script loaded");

function getLandInfo(): { parcelNumber: string, area: string, cadastralArea: string, lv: string } | null {
    const table = document.querySelector('table.atributySMapou');
    if (!table) return null;

    const rows = table.querySelectorAll('tr');

    const parcelNumber = (rows[0].querySelector('td:nth-child(2)') as HTMLTableCellElement)?.innerText
    const cadastralArea = (rows[2].querySelector('td:nth-child(2)') as HTMLTableCellElement)?.innerText;
    const lv = (rows[3].querySelector('td:nth-child(2)') as HTMLTableCellElement)?.innerText;
    const area = (rows[4].querySelector('td:nth-child(2)') as HTMLTableCellElement)?.innerText;

    return {
        parcelNumber,
        area,
        cadastralArea,
        lv
    }
}

function getOwners(): Array<{ owner: string, share: string }> | null {

    const table = document.querySelector('table.vlastnici');
    if (!table) return null;

    const rows = table.querySelectorAll('tr');

    const owners = [] as Array<{ owner: string, share: string }>;
    rows.forEach(row => {
        const owner = (row.querySelector('td:nth-child(1)') as HTMLTableCellElement)?.innerText.split(',')[0];
        const share = (row.querySelector('td:nth-child(2)') as HTMLTableCellElement)?.innerText;
        owners.push({ owner, share });
    });

    return owners;
}

function getOwnerDuplicate(): boolean {
    //Record has duplicate record if table .vlastnici having in first th row "Duplicitní zápis vlastnictví"
    const table = document.querySelector('table.vlastnici');
    if (!table) return false;

    const tableHeader = table.querySelector('th');
    if (tableHeader && tableHeader.innerText == "Duplicitní zápis vlastnictví") {
        return true;
    }
    return false
}

function getProtection(): string[] | null {
    // summary="Způsob ochrany nemovitosti"
    const table = document.querySelector('table[summary="Způsob ochrany nemovitosti"]');
    if (!table) return null;

    const rows = table.querySelectorAll('tr');

    const protections: string[] = []

    rows.forEach(row => {
        const protection = row.querySelector('td')?.innerText;
        if (protection) protections.push(protection);
    });

    return protections;
}

function getBPEJ() {
    // summary="Seznam BPEJ"
    const table = document.querySelector('table[summary="Seznam BPEJ"]');
    if (!table) return null;

    const rows = table.querySelectorAll('tr');

    const bpej = [] as Array<{ code: string, area: string }>;
    rows.forEach(row => {
        const code = (row.querySelector('td:nth-child(1) a') as HTMLAnchorElement)?.innerText;
        const area = (row.querySelector('td:nth-child(2)') as HTMLTableCellElement)?.innerText;
        bpej.push({ code, area });
    });

    return bpej;
}

function getRestrictions() {
    // summary="Omezení vlastnického práva"
    const table = document.querySelector('table[summary="Omezení vlastnického práva"]');
    if (!table) return null;

    const rows = table.querySelectorAll('tr');

    const restrictions: string[] = [];

    rows.forEach(row => {
        const restriction = row.querySelector('td')?.innerText;
        if (restriction) restrictions.push(restriction);
    })

    return restrictions;
}

function getOtherRecords() {
    // summary="Jiné zápisy"
    const table = document.querySelector('table[summary="Jiné zápisy"]');
    if (!table) return null;

    const rows = table.querySelectorAll('tr');

    const records: string[] = [];
    rows.forEach(row => {
        const type = row.querySelector('td')?.innerText;
        if (type) records.push(type);
    });

    return records;
}

function getSeal(): string {
    // summary="Otisk úředního razítka"
    const sealElement = document.querySelector('p.plomba');
    if (!sealElement) return null;

    // seal is paragraph with class "plomba" conaining text and link. Link is without domain, so we need to add it
    const domain = "https://nahlizenidokn.cuzk.cz";
    const sealLink = sealElement.querySelector('a');
    const sealUrl = sealLink ? domain + sealLink.getAttribute('href') : null;

    // return seal as is with corrected link
    const seal = sealElement.innerHTML.replace(/href="([^"]+)"/, `href="${sealUrl}" target="_blank"`);

    return seal;
}

function gatherParcelData() {
    const landInfo = getLandInfo();
    const owners = getOwners();
    const protection = getProtection();
    const bpej = getBPEJ();
    const restrictions = getRestrictions();
    const otherRecords = getOtherRecords();
    const seal = getSeal();
    const duplicate = getOwnerDuplicate();

    return {
        ...landInfo,
        owners,
        duplicate,
        protection,
        bpej,
        restrictions,
        otherRecords,
        seal,
    }
}

function sendParcelData() {
    const landData = gatherParcelData();
    console.log("Send parcel data:", landData);

    chrome.runtime.sendMessage({
        type: "cuzk-parcel-data",
        data: landData
    });
}

setTimeout(() => {
    sendParcelData();
}, 500);