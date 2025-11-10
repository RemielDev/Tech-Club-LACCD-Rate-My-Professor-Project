# Changelog

## Version 1.1.1 - URL Pattern Fix (CRITICAL)

### Summary
Fixed URL pattern matching to support all SIS portal pages, including the main "Manage Classes" entry point.

### Changes Made
- **manifest.json:** Changed SIS portal URL patterns from specific paths to catch-all:
  - Old: `SSR_STUDENT_FL.*` and `*CLASS_SEARCH*` (too restrictive)
  - New: `*.GBL*` in both `/c/` and `/s/` paths (covers all PeopleSoft pages)
  - This now includes: `NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL`, `SSR_STUDENT_FL`, and all other class-related pages

### Why This Was Critical
The original patterns didn't match the actual SIS portal URLs users encounter. The "Manage Classes" page uses:
```
https://csprd.laccd.edu/psc/csprd/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL
```
This didn't match our previous patterns, so the extension never loaded!

### Action Required
**⚠️ USERS MUST RELOAD THE EXTENSION** after updating:
1. Go to `chrome://extensions/`
2. Click the refresh button on "LACCD Rate My Professor"
3. Close and reopen all SIS portal tabs

---

## Version 1.1.0 - SIS Portal Support Added

### Summary
Added support for the LACCD Student Information System (SIS) portal, allowing the extension to work on both the public guest search page and the authenticated student portal pages.

### Changes Made

#### 1. **manifest.json**
- **Added host permission:** `https://csprd.laccd.edu/*`
- **Added new content script match patterns:**
  - `https://csprd.laccd.edu/psc/csprd/EMPLOYEE/SA/c/SSR_STUDENT_FL.*`
  - `https://csprd.laccd.edu/psc/csprd/EMPLOYEE/SA/c/*CLASS_SEARCH*`

#### 2. **content.js**
Major refactoring to support both systems:

**New Functions:**
- `detectSystem()` - Detects whether user is on Guest Search or SIS Portal
- `findProfessorElementsGuestSearch()` - Original logic for guest search (unchanged)
- `findProfessorElementsSISPortal()` - New logic for SIS portal with 3 strategies:
  - Strategy 1: Look for `span[id*="INSTR"]` elements
  - Strategy 2: Search for class detail instructor fields
  - Strategy 3: Find instructors in expanded class sections

**Modified Functions:**
- `findProfessorElements()` - Now routes to appropriate function based on system
- `getCampusFromRoom()` - Enhanced to handle SIS portal DOM structure:
  - Searches in multiple container types (`.ps_box-scrollarea-row`, `.ps_grid-row`, etc.)
  - Looks for room info in various span types
  - Handles both `span[id^="MTG_ROOM$"]` and `span[id*="SSR_DRV_ROOM"]`
- `initialize()` - System-aware initialization:
  - Longer initial delay for SIS portal (3s vs 2s)
  - Different observer patterns for each system
  - Watches SIS-specific containers and elements
- Click event listener - Now handles both systems:
  - Guest: Detects search button clicks
  - SIS: Detects class detail expansion and search buttons
- Periodic interval check - System-specific container detection

#### 3. **README.md**
- Updated features list to mention dual-system support
- Added "Supported Pages" section with both systems documented
- Completely rewrote FLOW section with:
  - System detection explanation
  - Separate strategies for each system
  - Updated click listener behavior
  - Enhanced DOM observer documentation

#### 4. **New Files**
- `TESTING.md` - Comprehensive testing guide including:
  - Step-by-step testing procedures for SIS portal
  - Console debugging tips
  - Expected behavior documentation
  - Troubleshooting common issues
  - Instructions for reporting bugs

### Technical Details

#### SIS Portal DOM Structure
The SIS portal uses PeopleSoft structure with key differences from guest search:
- Instructor names may be in: `span[id*="INSTR"]`, `span[id*="INSTRNAME"]`
- Class details are in collapsible sections: `.ps_box-group.psc_collapsible`
- Room info appears in: `span[id*="SSR_DRV_ROOM"]` or `.ps_box-value`
- Container structure: `.ps_box-scrollarea-row`, `[id*="STDNT_ENRL"]`, `[id*="SSR_CLS_DTL"]`

#### Campus Detection Strategy
1. **Primary:** Extract from room column text (e.g., "City-Online" → LACC)
2. **Fallback:** Use URL parameter (guest search only)
3. **Default:** Pierce College (LAPC) if detection fails

#### Performance Considerations
- SIS portal has longer initial delay (3s) due to complex page loading
- Click detection triggers re-processing at 1s, 2s, 3s intervals
- MutationObserver is throttled to maximum once per second
- Periodic check runs every 3 seconds for unprocessed instructors

### Backward Compatibility
- ✅ All existing guest search functionality preserved
- ✅ No breaking changes to existing code
- ✅ Guest search uses original selectors and timing
- ✅ New code only activates on SIS portal URLs

### Known Limitations
1. SIS portal requires login - extension cannot work on login page
2. Some SIS pages may not display instructor info until user expands details
3. Campus detection relies on room text - if room format changes, may need updates
4. Instructor names must be in standard format (First Last or Last, First)

### Testing Status
- ✅ Manifest validation: Passed
- ✅ Linting: No errors
- ⏳ Manual testing: Requires user testing with SIS portal access
- ⏳ Cross-campus testing: Needs verification across all 9 LACCD colleges

### Next Steps for Users
1. Reload the extension in Chrome (`chrome://extensions/`)
2. Navigate to SIS portal and log in
3. Go to "View My Classes/Schedule" or "Class Search and Enroll"
4. Look for RMP buttons next to instructor names
5. Check browser console (F12) for debug logs
6. Report any issues with page URL and console logs

### Future Enhancements (Potential)
- Add support for additional SIS portal pages
- Improve instructor name detection patterns
- Add visual indicators for which system is detected
- Cache instructor data per-session to reduce API calls
- Add options page for user preferences

