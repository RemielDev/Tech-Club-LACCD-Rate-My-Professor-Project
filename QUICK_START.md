# Quick Start Guide - LACCD Rate My Professor Extension

## Installation (2 Minutes)

### Step 1: Verify Files
Make sure you have these files:
```
✓ manifest.json
✓ background.js
✓ content.js
✓ styles.css
✓ popup.html
✓ icons/icon16.png
✓ icons/icon48.png
✓ icons/icon128.png
```

### Step 2: Load in Chrome

1. Open Chrome and go to: `chrome://extensions/`

2. Enable **Developer mode** (toggle in top-right)

3. Click **"Load unpacked"**

4. Select the extension folder (the one with `manifest.json`)

5. Done! You should see "LACCD Rate My Professor" in your extensions list

## Usage (30 Seconds)

1. **Visit LACCD Course Search:**
   https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL

2. **Search for classes** (any subject, any term)

3. **Wait 3-5 seconds** after results appear

4. **See ratings** next to instructor names: ⭐ 4.5/5 (123 ratings)

5. **Click ratings** to view full professor profile on Rate My Professor

## What You'll See

### ✅ Good Rating (4.0+)
```
Professor Name ⭐ 4.8/5 (45 ratings) [Green]
```

### ⚠️ Medium Rating (3.0-3.9)
```
Professor Name ⭐ 3.5/5 (32 ratings) [Yellow/Orange]
```

### ❌ Low Rating (Below 3.0)
```
Professor Name ⭐ 2.3/5 (18 ratings) [Red]
```

### ❓ Not Found
```
Professor Name ❓ Not Found [Gray]
```
*(New professors or not on Rate My Professor)*

## Troubleshooting

### Ratings Not Showing?

**Try this:**
1. Wait 5-10 seconds (page needs to load first)
2. Refresh the page (F5)
3. Open Console (F12) and check for errors
4. Make sure you're on the correct URL

**Check Console:**
```javascript
// Should see these messages:
[LACCD RMP] Found X professor elements
[RMP API] Searching for: Professor Name at LAPC
[RMP API] Match found: Name (4.5/5)
```

### Extension Not Loading?

1. Go to `chrome://extensions/`
2. Look for errors on the extension card
3. Click "Errors" if you see any
4. Try clicking the refresh icon (↻)
5. Remove and re-add if needed

### Icons Not Showing?

Make sure these files exist:
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`

If missing, run: `python generate_icons.py`

## Testing

### Quick Test
1. Go to LACCD search
2. Search for "ENGLISH"
3. English professors usually have many ratings
4. Should see several ⭐ ratings appear

### All Campuses Work?
Try different campus codes in URL:
- `Campus=LAPC` (Pierce)
- `Campus=LACC` (City)
- `Campus=ELAC` (East LA)

## Debug Mode

### Check Extension Status
```javascript
// In page console (F12):
window.laccdRmpExtension // Should be true
```

### View Background Logs
1. Go to `chrome://extensions/`
2. Find "LACCD Rate My Professor"
3. Click "Inspect views: service worker"
4. See detailed API logs

### Test API Manually
```javascript
// In service worker console:
chrome.runtime.sendMessage({
  action: 'searchProfessor',
  name: 'John Smith',
  campus: 'LAPC'
}, response => console.log(response));
```

## Common Issues

### "Not Found" for Everyone
- **Cause:** API might be rate-limited or down
- **Fix:** Wait 1 minute and refresh

### Duplicate Buttons
- **Cause:** Page loaded twice
- **Fix:** Refresh page

### Wrong Professor
- **Cause:** Common names might match incorrectly
- **Fix:** Click link to verify on RMP site

### Slow Loading
- **Cause:** Many professors on one page
- **Fix:** Normal - API calls take time

## Tips

💡 **Pin the extension** to toolbar for quick access to popup

💡 **Check before enrolling** - View ratings during registration

💡 **Read reviews** - Click through to RMP for detailed feedback

💡 **Multiple sections** - Compare ratings for different instructors

💡 **Plan ahead** - Check ratings when browsing future terms

## Support

**Working?** ✓ You're all set! Happy course hunting!

**Not working?** Check:
1. README.md - Full documentation
2. INSTALLATION.md - Detailed setup
3. TESTING.md - Comprehensive testing guide
4. Console logs - Look for error messages

## Next Steps

- [ ] Test with different subjects
- [ ] Try all LACCD campuses
- [ ] Share with fellow students
- [ ] Report any bugs or issues
- [ ] Suggest improvements

---

**Enjoy easier course selection! 🎓**

