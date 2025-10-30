# Testing Guide for LACCD Rate My Professor Extension

## Pre-Testing Checklist

- [ ] Extension loaded in Chrome (`chrome://extensions/`)
- [ ] Developer mode enabled
- [ ] All icon files present in `icons/` folder
- [ ] No errors shown on extensions page

## Test Scenarios

### 1. Basic Functionality Test

**Objective**: Verify ratings appear for professors

**Steps**:
1. Navigate to [LACCD Course Search](https://mycollege-guest.laccd.edu/psc/classsearchguest/EMPLOYEE/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?Campus=LAPC&strm=2258)
2. Select "Los Angeles Pierce College" campus
3. Select current or upcoming term
4. Search for "ENGLISH" in the subject field
5. Click "Search"

**Expected Results**:
- Course results load normally
- After 2-5 seconds, ratings appear next to instructor names
- Format: ⭐ X.X/5 (Y ratings)
- Ratings are color-coded (green/yellow/red based on score)

**Debug Steps if Failed**:
```javascript
// In browser console (F12):
console.log('Checking for professor elements...');
document.querySelectorAll('span[id*="DERIVED_SSR_FC_SSR_INSTR_LONG"]').length;
```

---

### 2. Click-Through Test

**Objective**: Verify links to Rate My Professor work

**Steps**:
1. Find a course with a rating displayed
2. Click on the rating badge (e.g., "⭐ 4.5/5")
3. Observe behavior

**Expected Results**:
- New tab opens
- URL is `https://www.ratemyprofessors.com/professor/[ID]`
- Correct professor profile loads
- Profile matches the instructor name from LACCD

---

### 3. Edge Case: No Rating Available

**Objective**: Handle professors not on Rate My Professor

**Steps**:
1. Search for classes with new or adjunct professors
2. Look for instructors marked as "Staff" or "TBA"
3. Check recently hired professors

**Expected Results**:
- "Staff" and "TBA" instructors: No button appears
- New professors: Shows "❓ Not Found"
- No errors in console

---

### 4. Multiple Campus Test

**Objective**: Verify correct school mapping

**Steps**:
1. Test with LAPC (Pierce College)
2. Change URL to `Campus=LACC` (City College)
3. Search for same subject
4. Compare results

**Expected Results**:
- Different professors appear
- Ratings correspond to correct campus
- No cross-campus confusion

**Campus URLs to Test**:
```
LAPC: Campus=LAPC
LACC: Campus=LACC
LAHC: Campus=LAHC
LAMC: Campus=LAMC
ELAC: Campus=ELAC
```

---

### 5. Dynamic Content Test

**Objective**: Handle AJAX-loaded content

**Steps**:
1. Load initial search results
2. Use pagination (Next/Previous)
3. Apply filters
4. Expand/collapse course sections

**Expected Results**:
- Ratings appear on dynamically loaded content
- No duplicate buttons
- MutationObserver working correctly

**Debug**:
```javascript
// Check observer is running
console.log('Extension loaded:', !!window.laccdRmpExtension);
```

---

### 6. Performance Test

**Objective**: Ensure extension doesn't slow down page

**Steps**:
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Load LACCD search page
4. Perform search
5. Stop recording

**Expected Results**:
- Page load time increase < 500ms
- No long-running scripts
- API calls complete within 2-3 seconds
- No memory leaks

---

### 7. Cache Test

**Objective**: Verify professor data is cached

**Steps**:
1. Search for courses
2. Note which professors have ratings
3. Navigate away and back
4. Search for same courses

**Expected Results**:
- Ratings appear faster on second load
- No unnecessary API calls
- Check in background service worker console:
  ```javascript
  // Should see cache hits
  console.log('Cache size:', professorCache.size);
  ```

---

### 8. Error Handling Test

**Objective**: Handle API failures gracefully

**Steps**:
1. Open background service worker console
2. Temporarily break the API URL in `background.js`:
   ```javascript
   const RMP_GRAPHQL_URL = 'https://invalid-url.com';
   ```
3. Reload extension
4. Try searching for courses

**Expected Results**:
- Buttons show "❓ Not Found"
- User-friendly error messages
- No uncaught exceptions
- Page remains functional

**Remember to restore correct URL!**

---

### 9. Name Parsing Test

**Objective**: Handle various name formats

**Test Names**:
- "Smith, John" (LastName, FirstName)
- "John Smith" (FirstName LastName)
- "Dr. John Smith" (With title)
- "Mary Anne Wilson" (Middle name)
- "O'Connor, Patrick" (Apostrophe)
- "María García" (Accented characters)

**Expected Results**:
- All formats parsed correctly
- Titles removed
- Accents handled appropriately
- Best match found on RMP

---

### 10. Console Debugging Test

**Objective**: Verify logging and debugging

**Steps**:
1. Open page console (F12)
2. Look for extension logs
3. Open service worker console
4. Trigger a search

**Expected Logs**:
```
Content Script:
- "Found X professor elements"
- "Processing professor: [name]"

Background Script:
- "Searching for professor: [name] at [campus]"
- "Cache hit/miss"
- API responses
```

---

## Automated Testing Checklist

### Content Script
- [ ] Finds professor elements
- [ ] Extracts names correctly
- [ ] Creates buttons
- [ ] Handles duplicates
- [ ] Responds to dynamic content

### Background Script
- [ ] Makes API requests
- [ ] Parses responses
- [ ] Caches results
- [ ] Matches names correctly
- [ ] Returns proper format

### UI
- [ ] Buttons render correctly
- [ ] Colors apply properly
- [ ] Links work
- [ ] Hover effects
- [ ] Responsive layout

---

## Manual Inspection Points

### Visual
- [ ] Icons load correctly
- [ ] Rating badges look professional
- [ ] Colors are distinguishable
- [ ] No layout breaking
- [ ] Works on different screen sizes

### Functional
- [ ] All clicks work
- [ ] No broken links
- [ ] Tooltips appear
- [ ] Loading states show
- [ ] Error states display

### Performance
- [ ] Page loads normally
- [ ] No lag or stuttering
- [ ] API calls are reasonable
- [ ] Memory usage is normal

---

## Known Issues to Test

### Issue 1: PeopleSoft Page Structure
- LACCD uses Oracle PeopleSoft
- Structure may vary by campus
- Element IDs might be inconsistent

**Test**: Try multiple subjects and terms

### Issue 2: Rate My Professor API
- No official public API
- Using GraphQL endpoint (may change)
- Rate limiting possible

**Test**: Make many rapid searches

### Issue 3: Name Matching
- Same names across campuses
- Similar names (John Smith vs Jon Smith)
- Nicknames (Robert vs Bob)

**Test**: Search for common names

---

## Reporting Issues

When reporting bugs, include:

1. **Environment**
   - Chrome version: `chrome://version/`
   - Extension version: `1.0.0`
   - Operating system

2. **Steps to Reproduce**
   - Exact URL
   - Campus selected
   - Search terms used
   - Screenshots

3. **Console Logs**
   - Page console errors
   - Service worker console
   - Network tab (if API issue)

4. **Expected vs Actual**
   - What should happen
   - What actually happened

---

## Success Criteria

Extension is ready when:

- [x] Basic functionality works
- [x] Handles edge cases
- [x] Performance is acceptable
- [x] No console errors
- [x] Works on all LACCD campuses
- [x] API integration stable
- [x] UI is polished
- [x] Documentation complete

---

## Next Steps After Testing

1. **Gather Feedback**
   - Share with fellow students
   - Collect usability feedback
   - Note feature requests

2. **Optimize**
   - Improve name matching
   - Reduce API calls
   - Enhance UI

3. **Publish** (optional)
   - Prepare Chrome Web Store listing
   - Create promotional images
   - Write store description

4. **Maintain**
   - Monitor for API changes
   - Update school IDs if needed
   - Fix reported bugs

---

**Happy Testing! 🧪**

