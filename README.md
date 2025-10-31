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
