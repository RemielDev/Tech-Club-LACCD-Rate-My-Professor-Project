# laccd rate my professor chrome extension

shows rate my professor ratings next to instructor names on laccd course search pages

## features

* auto detects instructor names on both public and student portal pages
* inline rating with link to rmp profile
* supports all 9 laccd colleges
* works on both guest search and authenticated SIS portal

## install

1. download or clone this repo
2. open `chrome://extensions/`
3. enable developer mode
4. click load unpacked and select the folder with `manifest.json`

## supported pages

**Public Guest Search:**
* `https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL`

**Student SIS Portal (requires login):**
* `https://csprd.laccd.edu/psc/csprd/EMPLOYEE/SA/c/SSR_STUDENT_FL.*` (View My Classes, Class Search, etc.)
* All class search and enrollment pages within the SIS portal

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

**Plugin Flow**
1. Page loads → detects system (Guest Search or SIS Portal)
2. Script marks itself ready (`window.laccdRmpExtension = true`)
3. Waits 2-3s (longer for SIS due to complex page load)
4. Runs `processAllProfessors()`

**Finding Professors**
- **Guest Search:** Looks for `span[id^="MTG_INSTR$"]` elements
- **SIS Portal:** Searches for:
  - `span[id*="INSTR"]` elements
  - `span[id*="SSR_CLS_DTL_WRK_INSTRNAME"]` elements  
  - Expanded class detail sections
  - Elements near "Instructor" labels

**Processing Flow**
`processAllProfessors()` → `findProfessorElements()` → for each professor:
1. Create RMP button showing "Loading..."
2. Insert button next to professor name
3. Determine campus (room column first, URL fallback)
4. Send message to background: `{action: 'searchProfessor', name, campus}`
5. Background replies with RMP search link
6. `updateRMPButton()` sets final label/link

**Keeping Results Fresh**
- **DOM Observer:** Watches for new content, throttled to once per second
- **Click Listeners:**
  - Guest Search: Detects search button clicks → waits 2/4/6s → reruns
  - SIS Portal: Detects class detail clicks or search → waits 1-4s → reruns
- **Interval Check:** Every 3s, checks for unprocessed instructor names

**Per-Professor Flow**
Professor span found → button starts as "⏳ Loading..." → message to background → response received → button becomes "🔍 Search RMP" link to RateMyProfessors search; on error → button shows "❓ Not Found"