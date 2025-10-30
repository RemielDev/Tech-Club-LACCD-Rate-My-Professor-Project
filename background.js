// Background service worker for handling Rate My Professor API requests

const RMP_GRAPHQL_URL = 'https://www.ratemyprofessors.com/graphql';

// LACCD schools mapping to Rate My Professor school IDs
const LACCD_SCHOOLS = {
  'LAPC': { name: 'Los Angeles Pierce College', rmpId: 'U2Nob29sLTQ0Ng==' },
  'LACC': { name: 'Los Angeles City College', rmpId: 'U2Nob29sLTQ0Mw==' },
  'LAHC': { name: 'Los Angeles Harbor College', rmpId: 'U2Nob29sLTQ0NA==' },
  'LAMC': { name: 'Los Angeles Mission College', rmpId: 'U2Nob29sLTQ0NQ==' },
  'LASC': { name: 'Los Angeles Southwest College', rmpId: 'U2Nob29sLTQ0Nw==' },
  'LATC': { name: 'Los Angeles Trade Technical College', rmpId: 'U2Nob29sLTQ0OA==' },
  'LAVC': { name: 'Los Angeles Valley College', rmpId: 'U2Nob29sLTQ0OQ==' },
  'WLAC': { name: 'West Los Angeles College', rmpId: 'U2Nob29sLTQ1MA==' },
  'ELAC': { name: 'East Los Angeles College', rmpId: 'U2Nob29sLTQ0Mg==' }
};

// Cache for professor searches (to avoid repeated API calls)
const professorCache = new Map();

// GraphQL query to search for professors
const SEARCH_PROFESSOR_QUERY = `
query NewSearchTeachersQuery($text: String!, $schoolID: ID!) {
  newSearch {
    teachers(query: {text: $text, schoolID: $schoolID}) {
      edges {
        node {
          id
          legacyId
          firstName
          lastName
          avgRating
          numRatings
          wouldTakeAgainPercent
          department
        }
      }
    }
  }
}
`;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchProfessor') {
    console.log(`[RMP API] Searching for: ${request.name} at ${request.campus}`);
    searchProfessor(request.name, request.campus)
      .then(result => {
        console.log(`[RMP API] Result for ${request.name}:`, result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error(`[RMP API] Error for ${request.name}:`, error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

async function searchProfessor(professorName, campus) {
  // Create cache key
  const cacheKey = `${campus}:${professorName}`;
  
  // Check cache first
  if (professorCache.has(cacheKey)) {
    console.log(`[RMP API] Cache hit for: ${professorName}`);
    return professorCache.get(cacheKey);
  }

  // Get school ID for the campus
  const school = LACCD_SCHOOLS[campus];
  if (!school) {
    console.error(`[RMP API] Unknown campus: ${campus}`);
    throw new Error(`Unknown campus: ${campus}`);
  }

  // Parse professor name
  const nameParts = parseProfessorName(professorName);
  if (!nameParts) {
    console.warn(`[RMP API] Invalid name format: ${professorName}`);
    const result = { found: false, reason: 'Invalid name format' };
    professorCache.set(cacheKey, result);
    return result;
  }

  console.log(`[RMP API] Searching RMP for: ${nameParts.firstName} ${nameParts.lastName} at ${school.name}`);

  try {
    // Search for professor using GraphQL API
    const response = await fetch(RMP_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic dGVzdDp0ZXN0'
      },
      body: JSON.stringify({
        query: SEARCH_PROFESSOR_QUERY,
        variables: {
          text: `${nameParts.firstName} ${nameParts.lastName}`,
          schoolID: school.rmpId
        }
      })
    });

    if (!response.ok) {
      console.error(`[RMP API] HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`RMP API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error('[RMP API] GraphQL errors:', data.errors);
      throw new Error('RMP API returned errors');
    }
    
    const teachers = data?.data?.newSearch?.teachers?.edges || [];
    console.log(`[RMP API] Found ${teachers.length} potential matches`);

    // Try to find the best match
    const match = findBestMatch(teachers, nameParts);

    if (match) {
      const result = {
        found: true,
        legacyId: match.legacyId,
        rating: match.avgRating,
        numRatings: match.numRatings,
        wouldTakeAgainPercent: match.wouldTakeAgainPercent,
        url: `https://www.ratemyprofessors.com/professor/${match.legacyId}`
      };
      console.log(`[RMP API] Match found: ${match.firstName} ${match.lastName} (${match.avgRating}/5)`);
      professorCache.set(cacheKey, result);
      return result;
    } else {
      console.log(`[RMP API] No suitable match found for: ${professorName}`);
      const result = { found: false, reason: 'Professor not found on RMP' };
      professorCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error('[RMP API] Error searching for professor:', error);
    // Don't cache errors - allow retry
    throw error;
  }
}

function parseProfessorName(fullName) {
  if (!fullName || fullName.trim() === '' || fullName.toLowerCase() === 'staff') {
    return null;
  }

  // Remove any titles or extra whitespace
  const cleaned = fullName.trim()
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
    .replace(/\s+/g, ' ');

  // Split into parts
  const parts = cleaned.split(' ');
  
  if (parts.length < 2) {
    return null;
  }

  // Handle various name formats
  // "LastName, FirstName" format
  if (cleaned.includes(',')) {
    const [lastName, firstName] = cleaned.split(',').map(s => s.trim());
    return { firstName, lastName };
  }

  // "FirstName LastName" format
  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1]
  };
}

function findBestMatch(teachers, nameParts) {
  if (teachers.length === 0) {
    return null;
  }

  // Score each teacher based on name similarity
  const scored = teachers.map(edge => {
    const teacher = edge.node;
    let score = 0;

    // Exact first name match
    if (teacher.firstName.toLowerCase() === nameParts.firstName.toLowerCase()) {
      score += 10;
    } else if (teacher.firstName.toLowerCase().startsWith(nameParts.firstName.toLowerCase())) {
      score += 5;
    }

    // Exact last name match
    if (teacher.lastName.toLowerCase() === nameParts.lastName.toLowerCase()) {
      score += 10;
    } else if (teacher.lastName.toLowerCase().startsWith(nameParts.lastName.toLowerCase())) {
      score += 5;
    }

    return { teacher, score };
  });

  // Sort by score and return the best match if score is high enough
  scored.sort((a, b) => b.score - a.score);
  
  if (scored[0].score >= 15) { // At least one exact match and one partial
    return scored[0].teacher;
  }

  return null;
}

// Clear cache periodically (every 24 hours)
setInterval(() => {
  professorCache.clear();
}, 24 * 60 * 60 * 1000);

