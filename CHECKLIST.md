# Installation Checklist ✓

## Before You Start
- [ ] Chrome browser installed
- [ ] Python installed (for icon generation)

## Installation Steps

### 1. Generate Icons
- [ ] Open terminal in extension folder
- [ ] Run: `python generate_icons.py`
- [ ] Verify three PNG files created in `icons/` folder
  - [ ] `icon16.png`
  - [ ] `icon48.png`
  - [ ] `icon128.png`

### 2. Load Extension
- [ ] Open Chrome
- [ ] Navigate to `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle top-right)
- [ ] Click "Load unpacked"
- [ ] Select this folder
- [ ] Extension appears in list with no errors

### 3. Verify Installation
- [ ] See "LACCD Rate My Professor" in extensions
- [ ] Extension icon visible (star icon)
- [ ] Click extension icon - popup opens
- [ ] No red error messages

## First Test

### 4. Visit LACCD
- [ ] Go to: https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL
- [ ] Page loads normally
- [ ] Select a campus (e.g., LAPC)
- [ ] Select a term

### 5. Search for Courses
- [ ] Enter "ENGLISH" in subject
- [ ] Click Search
- [ ] Results appear
- [ ] Wait 5 seconds

### 6. Check for Ratings
- [ ] See ⭐ icons next to some instructor names
- [ ] Ratings show format: "⭐ X.X/5 (Y ratings)"
- [ ] Some may show "❓ Not Found" (that's normal)
- [ ] Colors visible (green/yellow/red)

### 7. Test Clicking
- [ ] Click on a rating badge
- [ ] New tab opens
- [ ] Rate My Professor page loads
- [ ] Correct professor shown

## Debugging (If Issues)

### 8. Check Console
- [ ] Press F12 on LACCD page
- [ ] Go to Console tab
- [ ] Look for `[LACCD RMP]` messages
- [ ] Should see "Found X professor elements"
- [ ] No red errors

### 9. Check Service Worker
- [ ] Go to `chrome://extensions/`
- [ ] Find extension
- [ ] Click "Inspect views: service worker"
- [ ] Look for `[RMP API]` messages
- [ ] Check for API responses

### 10. Common Fixes
- [ ] If no ratings: Wait longer (10+ seconds)
- [ ] If still nothing: Refresh page (F5)
- [ ] If errors: Click refresh on extension
- [ ] If broken: Remove and reload extension

## Success Criteria

### Extension Working If:
- [x] Loads without errors
- [x] Detects professors automatically
- [x] Shows ratings within 5-10 seconds
- [x] Links open correct RMP pages
- [x] Handles "not found" gracefully
- [x] Works across different searches
- [x] No console errors

## Optional Enhancements

### 11. Customize
- [ ] Pin extension to toolbar
- [ ] Test different campuses
- [ ] Try various subjects
- [ ] Share with classmates

### 12. Report Issues
- [ ] Note any bugs
- [ ] Screenshot errors
- [ ] Copy console logs
- [ ] Report for fixes

## Quick Reference

### If Everything Works
🎉 **You're done!** Start using it for course selection!

### If Nothing Shows
1. Check console for errors
2. Verify correct URL
3. Wait 10 seconds
4. Refresh page

### If Some Work, Some Don't
✓ **That's normal!** Some professors aren't on Rate My Professor

### Need Help?
📖 Read: `QUICK_START.md` for fast guide
📖 Read: `INSTALLATION.md` for detailed steps
📖 Read: `TESTING.md` for troubleshooting
📖 Read: `README.md` for full documentation

---

**Target Time: 5 minutes from start to working extension!**

**Status:**
- [ ] Not started
- [ ] In progress
- [ ] Working!
- [ ] Tested and verified!

