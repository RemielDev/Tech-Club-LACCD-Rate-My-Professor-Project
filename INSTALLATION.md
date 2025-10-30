# Installation Guide

## Quick Start

### Step 1: Create Icon Files

Since this is a development build, you need to create simple icon files. You have two options:

#### Option A: Use Placeholder Icons (Quickest)
1. Create three simple text files and rename them:
   - Create `icons/icon16.png` (any small PNG image, 16x16 pixels)
   - Create `icons/icon48.png` (any PNG image, 48x48 pixels)  
   - Create `icons/icon128.png` (any PNG image, 128x128 pixels)

You can use any star emoji screenshot or download free icons from:
- https://www.flaticon.com/free-icon/star_1828884
- Or use the icon generator HTML file included

#### Option B: Generate Icons with the Included Tool
1. Open `icons/create-icons.html` in your browser
2. Click "Download All Icons" button
3. Save the three PNG files in the `icons/` folder
4. Make sure they're named: `icon16.png`, `icon48.png`, `icon128.png`

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```
   Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to and select this extension folder
   - Make sure you select the folder containing `manifest.json`

4. **Verify Installation**
   - You should see "LACCD Rate My Professor" in your extensions list
   - Pin the extension to your toolbar (optional)

### Step 3: Test the Extension

1. **Visit LACCD Course Search**
   ```
   https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL
   ```

2. **Select a Campus**
   - Choose any LACCD campus (e.g., LAPC)
   - Select a term (e.g., Fall 2025)

3. **Search for Classes**
   - Search by subject or keywords
   - Click "Search" button

4. **View Results**
   - Wait a few seconds after results load
   - You should see Rate My Professor ratings appear next to instructor names
   - Format: ⭐ X.X/5 (Y ratings)

5. **Click Ratings**
   - Click any rating to open the professor's RMP profile
   - Opens in a new tab

## Troubleshooting

### Icons Not Loading?
If you see a generic puzzle piece icon:
1. Make sure you have PNG files in the `icons/` folder
2. Files must be named exactly: `icon16.png`, `icon48.png`, `icon128.png`
3. Try reloading the extension (click refresh icon on chrome://extensions/)

### Ratings Not Appearing?
1. **Check Console for Errors**
   - Right-click on page → Inspect → Console tab
   - Look for any red error messages

2. **Verify Service Worker**
   - Go to `chrome://extensions/`
   - Find "LACCD Rate My Professor"
   - Click "Inspect views: service worker"
   - Check for errors in the console

3. **Wait Longer**
   - The page needs to fully load first
   - Extension then takes 2-5 seconds to fetch ratings
   - Refresh the page if needed

4. **Check URL**
   - Extension only works on LACCD course search pages
   - URL should match: `https://mycollege-guest.laccd.edu/psc/classsearchguest/...`

### "Not Found" for All Professors?
1. **API Rate Limiting**: Wait a minute and refresh
2. **Network Issue**: Check your internet connection
3. **RMP API Changes**: The API structure may have changed (check console for errors)

## Testing Different Scenarios

### Test Case 1: Well-Known Professor
- Search for popular general education classes (English, Math)
- These typically have professors with many ratings

### Test Case 2: New Professor
- Some professors won't have RMP profiles
- Should display "❓ Not Found"

### Test Case 3: Different Campuses
- Try searching different LACCD campuses
- Each campus has its own RMP school ID

### Test Case 4: Dynamic Loading
- Navigate between search results
- Use filters or pagination
- Ratings should appear on newly loaded content

## Development Tips

### Making Changes

1. Edit any file (content.js, background.js, etc.)
2. Go to `chrome://extensions/`
3. Click refresh icon (↻) on the extension card
4. Reload the LACCD page to see changes

### Debugging Content Script
```javascript
// Add console.logs in content.js
console.log('Found professors:', professorElements.length);
```
- View in page's DevTools console (F12)

### Debugging Background Script
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker"
3. View console logs from background.js

### Testing API Calls
```javascript
// In background.js console:
chrome.runtime.sendMessage({
  action: 'searchProfessor',
  name: 'John Smith',
  campus: 'LAPC'
}, response => console.log(response));
```

## Updating the Extension

After making changes:
1. Click refresh icon on `chrome://extensions/`
2. No need to reload unless manifest.json changed
3. For manifest changes, remove and re-add extension

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "LACCD Rate My Professor"
3. Click "Remove"
4. Confirm deletion

## Next Steps

Once you've verified the extension works:
- [ ] Customize the icons with your own design
- [ ] Test on different LACCD campuses
- [ ] Report any bugs or issues
- [ ] Suggest features or improvements

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review the README.md for technical details
3. Open an issue with:
   - Chrome version
   - LACCD campus
   - Console error messages
   - Screenshots if applicable

---

**Happy course hunting! 📚**

