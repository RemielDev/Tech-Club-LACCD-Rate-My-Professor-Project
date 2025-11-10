# Testing Guide for SIS Portal Support

## Overview
The extension now supports both the public guest search page and the authenticated SIS portal. This guide will help you test the new functionality.

## Prerequisites
- LACCD student account with login credentials
- Chrome browser with extension loaded in developer mode

## Testing on Guest Search (Existing Functionality)
1. Navigate to: https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL
2. Select a term and campus
3. Search for a class
4. Look for instructor names in search results
5. RMP buttons should appear next to instructor names (not "TBA" or "Staff")

## Testing on SIS Portal (New Functionality)

### Test 1: View My Classes/Schedule Page
1. Log into your LACCD student portal
2. Navigate to: **Manage Classes** → **View My Classes/Schedule**
3. Open browser console (F12) to see debug logs
4. Look for classes you're enrolled in
5. Click on class names/headers to expand details
6. **Expected:** RMP buttons should appear next to instructor names once details are expanded
7. Check console for `[LACCD RMP] [SIS]` log messages

### Test 2: Class Search and Enroll
1. From student portal, go to: **Manage Classes** → **Class Search and Enroll**
2. Search for classes for a specific term
3. View class details that show instructor information
4. **Expected:** RMP buttons should appear next to instructor names in search results
5. Click into class details to see more instructor info
6. **Expected:** Additional RMP buttons should appear when details expand

### Test 3: Shopping Cart
1. Navigate to: **Manage Classes** → **Shopping Cart**
2. If you have classes in your cart, view their details
3. **Expected:** RMP buttons appear for instructors of classes in cart

## What to Look For

### Success Indicators ✅
- "⏳ Loading..." appears briefly next to instructor names
- Changes to "🔍 Search RMP" with a blue link
- Clicking the link opens RateMyProfessors search for that instructor
- Console shows: `[LACCD RMP] [SIS] System detected: SIS_PORTAL`
- Console shows: `[LACCD RMP] [SIS] Found X professor elements`

### Common Issues ⚠️
- **No buttons appear:**
  - Check console for error messages
  - Verify extension is enabled
  - Try refreshing the page after 5 seconds
  - Click on class details to expand them

- **Campus detection issues:**
  - The extension looks for room information (e.g., "City-Online", "Southwest-Online")
  - If campus can't be detected from room, it defaults to Pierce College
  - Check console: `[LACCD RMP] Using campus from Room column: XXXX`

- **Instructor names not detected:**
  - Some pages may not show instructor info until you click into details
  - Make sure the class section actually has an assigned instructor (not "TBA")
  - Check if the instructor name appears in a format the extension doesn't recognize yet

## Console Debugging

Open browser console (F12) and look for these log messages:

```
[LACCD RMP] System detected: SIS_PORTAL
[LACCD RMP] Initializing extension for SIS_PORTAL...
[LACCD RMP] Running initial professor search...
[LACCD RMP] [SIS] Found X potential instructor spans
[LACCD RMP] [SIS] Added professor: FirstName LastName
[LACCD RMP] Using campus from Room column: LACC
[RMP] Generated URL for Los Angeles City College: https://www.ratemyprofessors.com/search/professors/...
```

## Reporting Issues

If you encounter issues, please note:
1. Which page you were on (exact URL)
2. What you were doing (searching, expanding details, etc.)
3. Console error messages (screenshot or copy/paste)
4. Whether the issue occurs consistently or intermittently
5. The instructor name that wasn't detected (if applicable)

## Advanced Testing

### Testing Different Campuses
The extension should correctly identify campus from room information:
- "City-" → Los Angeles City College (LACC)
- "Southwest-" → Los Angeles Southwest College (LASC)
- "Pierce-" → Los Angeles Pierce College (LAPC)
- etc.

### Testing Dynamic Content Loading
1. Leave the page open
2. Perform a search or expand class details
3. The extension should automatically detect new instructor names
4. Check that buttons appear within 1-3 seconds of content loading

### Testing Click Detection
1. Click on various class detail links
2. Observe console logs showing detection of clicks
3. Verify that `processAllProfessors()` runs after clicks

