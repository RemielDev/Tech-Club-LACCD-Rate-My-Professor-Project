# LACCD Rate My Professor Chrome Extension

A Chrome extension that automatically displays Rate My Professor ratings next to instructor names on Los Angeles Community College District (LACCD) course search pages.

## Features

-  **Automatic Detection**: Identifies professor names on LACCD course search pages
-  **Direct Links**: Click ratings to view full professor profiles on Rate My Professor
-  **All LACCD Campuses**: Supports all 9 LACCD colleges:
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

1. **download/Clone repo**

2. **open chrome extensions page**
   - Navigate to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

3. **enable developer mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **load the Eextension**
   - click "Load unpacked"
   - select the extension folder (containing manifest.json)

5. **verify Installation**
   - you should see "LACCD Rate My Professor" in your extensions list
   - the extension icon should appear in your toolbar

## only working for [LACCD Course Search](https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL)
(FOR NOW)

## How It Works

### Architecture

1. **Content Script** (`content.js`)
   - Runs on LACCD course search pages
   - Detects and extracts professor names from the page
   - Injects rating buttons next to each name

2. **Rate My Professor Integration**
   - Uses RMP's GraphQL API for professor searches
   - Matches professors by name and school

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

### Caching
- Professor searches are cached for 24 hours
- Reduces API calls and improves performance
- Cache is stored in memory (clears on extension restart)
- 
### Ratings Not Appearing?

1. **be patient, like 5-seconds typa patient or refresh**

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

**Made by Tech Club ❤️**

