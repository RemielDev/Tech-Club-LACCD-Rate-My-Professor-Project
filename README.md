# laccd rate my professor chrome extension

shows rate my professor ratings next to instructor names on laccd course search pages

## features

* auto detects instructor names
* inline rating with link to rmp profile
* supports all 9 laccd colleges

## install

1. download or clone this repo
2. open `chrome://extensions/`
3. enable developer mode
4. click load unpacked and select the folder with `manifest.json`

works on the laccd course search page:
`https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL`

## how it works

* content script finds names and injects rating buttons
* queries rmp by name and campus
* caches results for about 24 hours

## troubleshooting

* if ratings do not appear, wait a few seconds or refresh

## privacy

* no personal data collected
* processing happens locally in your browser

## license and disclaimer

open source for educational use. not affiliated with laccd or rate my professor.


## FLOW

Plugin Flow
Page loads → script marks itself ready (window.laccdRmpExtension = true) → waits 2s → runs processAllProfessors().
processAllProfessors() → gathers instructor name spans (findProfessorElements) → for each name: createRMPButton → insert button beside name → figure out campus (room column first, URL fallback) → chrome.runtime.sendMessage with {action: 'searchProfessor', name, campus} → background replies → updateRMPButton sets final label/link based on response.

Keeping Results Fresh
DOM changes detected → MutationObserver fires → throttles and reruns processAllProfessors.
User hits “Search” button → click listener waits 2/4/6s → reruns processAllProfessors.
Every 3s → interval checks for unprocessed names → reruns processAllProfessors if needed.

Per-Professor Flow
Professor span found → button starts as “Loading…” → message sent to background → response success → button becomes RateMyProfessors link; failure → button shows fallback message.