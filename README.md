# LACCD Rate My Professor Chrome Extension

A Chrome extension that automatically displays Rate My Professor ratings next to instructor names on Los Angeles Community College District (LACCD) course search pages.

## Features

- 🎯 **Automatic Detection**: Identifies professor names on LACCD course search pages
- ⭐ **Live Ratings**: Shows current Rate My Professor ratings and number of reviews
- 🎨 **Color-Coded**: Visual indicators (green for high ratings, yellow for medium, red for low)
- 🔗 **Direct Links**: Click ratings to view full professor profiles on Rate My Professor
- 🏫 **All LACCD Campuses**: Supports all 9 LACCD colleges:
  - Los Angeles Pierce College (LAPC)
  - Los Angeles City College (LACC)
  - Los Angeles Harbor College (LAHC)
  - Los Angeles Mission College (LAMC)
  - Los Angeles Southwest College (LASC)
  - Los Angeles Trade Technical College (LATC)
  - Los Angeles Valley College (LAVC)
  - West Los Angeles College (WLAC)
  - East Los Angeles College (ELAC)

## Installation

### Load as Unpacked Extension (For Development/Testing)

1. **Download/Clone this repository**
   ```bash
   git clone <repository-url>
   cd laccd-rmp-extension
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the extension folder (containing manifest.json)

5. **Verify Installation**
   - You should see "LACCD Rate My Professor" in your extensions list
   - The extension icon should appear in your toolbar

## Usage

1. **Visit LACCD Course Search**
   - Go to [LACCD Course Search](https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL)
   - Select your campus and search for courses

2. **Click for Details**
   - Click any rating to open the professor's full Rate My Professor profile
   - View detailed reviews, difficulty ratings, and more

## How It Works

### Architecture

1. **Content Script** (`content.js`)
   - Runs on LACCD course search pages
   - Detects and extracts professor names from the page
   - Injects rating buttons next to each name

2. **Background Service Worker** (`background.js`)
   - Handles Rate My Professor API requests
   - Caches results to minimize API calls
   - Maps LACCD campuses to RMP school IDs

3. **Rate My Professor Integration**
   - Uses RMP's GraphQL API for professor searches
   - Matches professors by name and school
   - Retrieves ratings, review counts, and would-take-again percentages

### Campus Mapping

The extension maintains accurate mappings between LACCD campuses and their Rate My Professor school IDs:

```javascript
const LACCD_SCHOOLS = {
  'LAPC': 'Los Angeles Pierce College',
  'LACC': 'Los Angeles City College',
  // ... and 7 more campuses
};
```

## Technical Details

### Manifest Version
- Uses Manifest V3 (latest Chrome extension standard)

### Permissions
- `storage`: Cache professor search results
- `host_permissions`: Access LACCD and RMP websites

### Technologies
- Vanilla JavaScript (no external dependencies)
- Chrome Extension APIs
- GraphQL for RMP data

### Caching
- Professor searches are cached for 24 hours
- Reduces API calls and improves performance
- Cache is stored in memory (clears on extension restart)

## Edge Cases Handled

- ✅ Professors listed as "Staff" or "TBA" are ignored
- ✅ New professors without RMP profiles show "Not Found"
- ✅ Name variations (FirstName LastName, LastName FirstName)
- ✅ Titles removed (Dr., Prof., Mr., Ms., Mrs.)
- ✅ Dynamic content loading on page navigation
- ✅ Multiple professors with similar names (best match algorithm)

## Troubleshooting

### Ratings Not Appearing?

1. **Wait a Few Seconds**: Extension needs time to load after page renders
2. **Refresh the Page**: Try reloading the course search results
3. **Check Console**: Open DevTools (F12) → Console for error messages
4. **Verify URL**: Make sure you're on the correct LACCD course search page

### "Not Found" for Known Professors?

- Professor might be new and not yet on Rate My Professor
- Name might be formatted differently on RMP (check manually)
- Professor might teach at a different campus on RMP

### Extension Not Loading?

1. Check that Developer Mode is enabled
2. Look for errors on `chrome://extensions/` page
3. Try removing and re-adding the extension
4. Ensure all files are present (manifest.json, content.js, background.js, etc.)

## Development

### File Structure
```
laccd-rmp-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Content script for page injection
├── styles.css            # Styling for rating buttons
├── popup.html            # Extension popup interface
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the LACCD page to see changes

### Debugging

- **Content Script**: Check the page's DevTools console
- **Background Script**: Go to `chrome://extensions/` → Details → Inspect views: service worker
- **Network Requests**: Monitor Network tab in DevTools

## Privacy & Data

- No personal data is collected or transmitted
- Only professor names (public information) are sent to Rate My Professor
- No tracking or analytics
- All data processing happens locally in your browser

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Ideas for Enhancement

- [ ] Add difficulty ratings
- [ ] Show "would take again" percentage
- [ ] Add popular tags from reviews
- [ ] Support for other college systems
- [ ] Options page for customization
- [ ] Dark mode support

## License

This project is open source and available for educational purposes.

## Disclaimer

This extension is not affiliated with, endorsed by, or officially connected with:
- Los Angeles Community College District (LACCD)
- Rate My Professor / Rate My Professors, LLC
- Any LACCD colleges

This is an independent project created to help students make informed decisions about their education.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Made with ❤️ for LACCD students**

