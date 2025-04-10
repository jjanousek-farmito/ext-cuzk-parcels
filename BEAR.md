flow: check land data and owner data
Start context: cmzf CRM
action: on button click

SW – service worker
CUZK – Czech cadastre of real estate
CRM – cmzf CRM
CRMC - CRM content script
CUZKC - CUZK content script



1) store info about the land data and owner data in session storage from CRM
2) open all cuzk links in new tabs
3) go through all the tabs and check if the land data is available
4) On each tab, scrape the land data and owner data
5) save the data into session storage
6) compare the data from the CRM and the data from the cuzk
7) if the data is the same, mark the land as checked
8) if the data is different, highlight the land as error
9) if cuzk data contains some additional data, highlight the land as warning


1) store parcels info in SW
2) open all cuzk links in new tabs
    1) Call to SW to open the links from stored parcels info

3) CUZKC parcel detail
    1) send parcel data to SW
4) SW check, if data from CRM and CUZK are valid





2157/142
2330/161
2330/228
5054/73
256/24
754/2
960/115