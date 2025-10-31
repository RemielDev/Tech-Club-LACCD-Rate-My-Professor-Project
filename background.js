// Background service worker - Alternative approach using direct RMP search URLs
// This avoids CORS issues by generating links to RMP's search page

// VERIFIED LACCD school IDs from Rate My Professor
// All IDs confirmed from official RMP school pages
const LACCD_SCHOOLS = {
  'LACC': { name: 'Los Angeles City College', schoolId: '2384' },
  'ELAC': { name: 'East Los Angeles College', schoolId: '2004' },
  'LAHC': { name: 'Los Angeles Harbor College', schoolId: '1582' },
  'LAMC': { name: 'Los Angeles Mission College', schoolId: '2385' },
  'LAPC': { name: 'Los Angeles Pierce College', schoolId: '12902' },
  'LASC': { name: 'Los Angeles Southwest College', schoolId: '2387' },
  'LATC': { name: 'Los Angeles Trade-Technical College', schoolId: '2388' },
  'LAVC': { name: 'Los Angeles Valley College', schoolId: '2389' },
  'WLAC': { name: 'West Los Angeles College', schoolId: '3020' }
};

const professorCache = new Map();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchProfessor') {
    console.log(`[RMP] Generating search URL for: ${request.name} at ${request.campus}`);
    const result = searchProfessor(request.name, request.campus);
    sendResponse({ success: true, data: result });
    return true;
  }
});

function searchProfessor(professorName, campus) {
  const cacheKey = `${campus}:${professorName}`;
  
  // Check cache first
  if (professorCache.has(cacheKey)) {
    console.log(`[RMP] Cache hit for: ${professorName}`);
    return professorCache.get(cacheKey);
  }

  // Parse professor name
  const nameParts = parseProfessorName(professorName);
  if (!nameParts) {
    console.warn(`[RMP] Invalid name format: ${professorName}`);
    const result = { found: false, reason: 'Invalid name format' };
    professorCache.set(cacheKey, result);
    return result;
  }

  // Get school info
  const school = LACCD_SCHOOLS[campus] || LACCD_SCHOOLS['LAPC'];
  
  // Generate RMP search URL with correct format
  const fullName = `${nameParts.firstName} ${nameParts.lastName}`;
  const searchQuery = encodeURIComponent(fullName);
  
  // Correct URL format: /search/professors/<SCHOOL_ID>?q=<QUERY>
  const searchUrl = `https://www.ratemyprofessors.com/search/professors/${school.schoolId}?q=${searchQuery}`;
  
  console.log(`[RMP] Generated URL for ${school.name}: ${searchUrl}`);
  
  // Return result with search URL
  const result = {
    found: true,
    isSearchLink: true,
    professorName: fullName,
    schoolName: school.name,
    url: searchUrl
  };
  
  professorCache.set(cacheKey, result);
  return result;
}

function parseProfessorName(fullName) {
  if (!fullName || fullName.trim() === '' || fullName.toLowerCase() === 'staff') {
    return null;
  }

  // Remove titles and clean up
  const cleaned = fullName.trim()
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
    .replace(/\s+/g, ' ');

  const parts = cleaned.split(' ');
  
  if (parts.length < 2) {
    return null;
  }

  // Handle "LastName, FirstName" format
  if (cleaned.includes(',')) {
    const [lastName, firstName] = cleaned.split(',').map(s => s.trim());
    return { firstName, lastName };
  }

  // Handle "FirstName LastName" format
  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1]
  };
}

// Clear cache periodically (every 24 hours)
setInterval(() => {
  professorCache.clear();
  console.log('[RMP] Cache cleared');
}, 24 * 60 * 60 * 1000);

console.log('[RMP] Background service worker initialized');
