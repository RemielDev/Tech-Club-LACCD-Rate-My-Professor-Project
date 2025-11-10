// Content script for LACCD course search pages (guest and SIS portal)

// Mark that extension is loaded
window.laccdRmpExtension = true;

// Detect which LACCD system we're on
function detectSystem() {
  const hostname = window.location.hostname;
  if (hostname.includes('mycollege-guest.laccd.edu')) {
    return 'GUEST_SEARCH';
  } else if (hostname.includes('csprd.laccd.edu')) {
    return 'SIS_PORTAL';
  }
  return 'UNKNOWN';
}

// Extract campus from URL
function getCurrentCampus() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('Campus') || 'LAPC';
}

// Extract campus from the Room column text (more accurate)
function getCampusFromRoom(professorElement) {
  // Find the row or container
  const row = professorElement.closest('tr');
  const container = professorElement.closest('.ps_box-scrollarea-row') || 
                    professorElement.closest('.ps_grid-row') ||
                    professorElement.closest('[class*="STDNT_ENRL"]');
  
  const searchContext = row || container || professorElement.closest('div');
  if (!searchContext) return null;
  
  // Look for room information in various formats
  // Guest search: span[id^="MTG_ROOM$"]
  // SIS portal: span containing room info or divs with room data
  let roomCell = searchContext.querySelector('span[id^="MTG_ROOM$"], span[id*="ROOM"], span[id*="SSR_DRV_ROOM"]');
  
  // Also check text content of nearby elements
  if (!roomCell) {
    const allSpans = searchContext.querySelectorAll('span.ps_box-value, span[id*="DERIVED_SSR"]');
    for (const span of allSpans) {
      const text = span.textContent.trim();
      if (text.match(/City-|EAST-|Harbor-|Pierce-|Valley-|West-|Mission-|Southwest-|Trade-/i)) {
        roomCell = span;
        break;
      }
    }
  }
  
  if (!roomCell) return null;
  
  const roomText = roomCell.textContent.trim();
  console.log(`[LACCD RMP] Room text: ${roomText}`);
  
  // Map room prefix to campus code
  if (roomText.includes('City-')) return 'LACC';
  if (roomText.includes('EAST-')) return 'ELAC';
  if (roomText.includes('Harbor-')) return 'LAHC';
  if (roomText.includes('Pierce-')) return 'LAPC';
  if (roomText.includes('Valley-')) return 'LAVC';
  if (roomText.includes('West-')) return 'WLAC';
  if (roomText.includes('Mission-')) return 'LAMC';
  if (roomText.includes('Southwest-')) return 'LASC';
  if (roomText.includes('Trade-')) return 'LATC';
  
  return null;
}

// Find professor name elements on the page
function findProfessorElements() {
  const system = detectSystem();
  console.log(`[LACCD RMP] System detected: ${system}`);
  
  if (system === 'GUEST_SEARCH') {
    return findProfessorElementsGuestSearch();
  } else if (system === 'SIS_PORTAL') {
    return findProfessorElementsSISPortal();
  }
  
  return [];
}

// Find professors on guest search page
function findProfessorElementsGuestSearch() {
  // The LACCD site uses PeopleSoft/Oracle structure
  // Instructor names are in spans with id="MTG_INSTR$X" and class="PSLONGEDITBOX"
  
  const professorElements = [];
  const processedIds = new Set();
  
  // Primary strategy: Look for MTG_INSTR spans (this is the correct selector!)
  const instructorSpans = document.querySelectorAll('span[id^="MTG_INSTR$"]');
  console.log(`[LACCD RMP] Found ${instructorSpans.length} MTG_INSTR spans`);
  
  instructorSpans.forEach(span => {
    const text = span.textContent.trim();
    console.log(`[LACCD RMP] Checking span ${span.id}: "${text}"`);
    
    if (text && text !== 'TBA' && text !== 'Staff' && text !== '') {
      // Avoid duplicates
      if (!processedIds.has(span.id)) {
        processedIds.add(span.id);
        professorElements.push(span);
        console.log(`[LACCD RMP] Added professor: ${text}`);
      }
    } else {
      console.log(`[LACCD RMP] Skipped (TBA/Staff/empty): ${text}`);
    }
  });
  
  // Fallback: Look for any PSLONGEDITBOX spans in instructor divs
  if (professorElements.length === 0) {
    console.log('[LACCD RMP] Primary method found 0, trying fallback...');
    const instructorDivs = document.querySelectorAll('div[id*="MTG_INSTR"]');
    instructorDivs.forEach(div => {
      const spans = div.querySelectorAll('span.PSLONGEDITBOX');
      spans.forEach(span => {
        const text = span.textContent.trim();
        if (text && text !== 'TBA' && text !== 'Staff' && text !== '') {
          if (!processedIds.has(span.id)) {
            processedIds.add(span.id);
            professorElements.push(span);
          }
        }
      });
    });
  }

  console.log(`[LACCD RMP] Total found: ${professorElements.length} professor elements`);
  return professorElements;
}

// Find professors on SIS portal pages
function findProfessorElementsSISPortal() {
  const professorElements = [];
  const processedIds = new Set();
  
  // Strategy 1: Look for instructor names in class detail sections
  // These appear when you expand class details in "View My Classes/Schedule"
  const instructorSpans = document.querySelectorAll('span[id*="INSTR"], span[id*="INSTRNAME"]');
  console.log(`[LACCD RMP] [SIS] Found ${instructorSpans.length} potential instructor spans`);
  
  instructorSpans.forEach(span => {
    const text = span.textContent.trim();
    console.log(`[LACCD RMP] [SIS] Checking span ${span.id}: "${text}"`);
    
    if (text && text !== 'TBA' && text !== 'Staff' && text !== '' && text !== 'Instructor') {
      // Avoid duplicates
      if (!processedIds.has(span.id)) {
        processedIds.add(span.id);
        professorElements.push(span);
        console.log(`[LACCD RMP] [SIS] Added professor: ${text}`);
      }
    }
  });
  
  // Strategy 2: Look for SSR_CLS_DTL instructor fields (class search results)
  const detailInstructors = document.querySelectorAll('span[id^="SSR_CLS_DTL_WRK_INSTRNAME"], span[id^="MTG_INSTR"]');
  console.log(`[LACCD RMP] [SIS] Found ${detailInstructors.length} class detail instructor spans`);
  
  detailInstructors.forEach(span => {
    const text = span.textContent.trim();
    if (text && text !== 'TBA' && text !== 'Staff' && text !== '') {
      if (!processedIds.has(span.id)) {
        processedIds.add(span.id);
        professorElements.push(span);
        console.log(`[LACCD RMP] [SIS] Added professor from details: ${text}`);
      }
    }
  });
  
  // Strategy 3: Look in expanded class details (after clicking "More" or class links)
  const expandedSections = document.querySelectorAll('.ps_box-value, .ps-text');
  expandedSections.forEach(element => {
    // Look for elements that might contain instructor info
    const text = element.textContent.trim();
    const parent = element.parentElement;
    
    // Check if this looks like an instructor field
    if (parent && (
      parent.id.includes('INSTR') || 
      element.previousElementSibling?.textContent?.includes('Instructor')
    )) {
      if (text && text !== 'TBA' && text !== 'Staff' && text !== '' && text.length > 3) {
        const elemId = element.id || `generated-${professorElements.length}`;
        if (!processedIds.has(elemId)) {
          processedIds.add(elemId);
          element.id = elemId; // Assign ID if it doesn't have one
          professorElements.push(element);
          console.log(`[LACCD RMP] [SIS] Added professor from expanded: ${text}`);
        }
      }
    }
  });
  
  console.log(`[LACCD RMP] [SIS] Total found: ${professorElements.length} professor elements`);
  return professorElements;
}

// Create RMP button element
function createRMPButton(professorName, status = 'loading') {
  const button = document.createElement('a');
  button.className = 'rmp-button';
  button.setAttribute('data-professor', professorName);
  button.style.marginLeft = '8px';
  button.style.display = 'inline-block';
  
  if (status === 'loading') {
    button.innerHTML = '⏳ Loading...';
    button.style.pointerEvents = 'none';
    button.style.color = '#999';
  }
  
  return button;
}

// Update button with professor data
function updateRMPButton(button, data) {
  if (data.found) {
    button.href = data.url;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.style.pointerEvents = 'auto';
    
    if (data.isSearchLink) {
      // This is a search link (no API data available)
      button.innerHTML = `🔍 Search RMP`;
      button.style.color = '#2196F3'; // Blue
      button.style.fontWeight = 'bold';
      button.title = `Search for ${data.professorName} at ${data.schoolName} on Rate My Professor`;
    } else {
      // This would be API data (if we had it)
      const rating = data.rating ? data.rating.toFixed(1) : 'N/A';
      const numRatings = data.numRatings || 0;
      
      // Color code based on rating
      let color = '#999';
      if (data.rating >= 4.0) {
        color = '#4CAF50'; // Green
      } else if (data.rating >= 3.0) {
        color = '#FFC107'; // Yellow/Orange
      } else if (data.rating > 0) {
        color = '#F44336'; // Red
      }
      
      button.innerHTML = `⭐ ${rating}/5 (${numRatings} ratings)`;
      button.style.color = color;
      button.style.fontWeight = 'bold';
      button.title = `View ${button.getAttribute('data-professor')} on Rate My Professor`;
    }
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.textDecoration = 'underline';
      button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.textDecoration = 'none';
      button.style.transform = 'scale(1)';
    });
  } else {
    button.innerHTML = '❓ Not Found';
    button.style.color = '#999';
    button.style.pointerEvents = 'none';
    button.title = data.reason || 'Professor not found on Rate My Professor';
  }
}

// Process a single professor element
async function processProfessor(element) {
  const professorName = element.textContent.trim();
  
  // Skip if already processed
  if (element.querySelector('.rmp-button') || element.hasAttribute('data-rmp-processed')) {
    return;
  }
  
  // Mark as processed
  element.setAttribute('data-rmp-processed', 'true');
  
  // Skip common non-professor values
  if (professorName === 'TBA' || professorName === 'Staff' || professorName === '' || professorName === 'Instructor:') {
    return;
  }
  
  console.log(`[LACCD RMP] Processing professor: ${professorName}`);
  
  // Create and add loading button
  const button = createRMPButton(professorName, 'loading');
  
  // Insert button next to the name
  // Try to append to parent container if possible for better layout
  const parent = element.parentElement;
  if (parent && (parent.style.display === 'flex' || parent.classList.contains('instructor-container'))) {
    parent.appendChild(button);
  } else {
    element.appendChild(button);
  }
  
  // Get campus - try from Room column first, fallback to URL
  let campus = getCampusFromRoom(element);
  if (!campus) {
    campus = getCurrentCampus();
    console.log(`[LACCD RMP] Using campus from URL: ${campus}`);
  } else {
    console.log(`[LACCD RMP] Using campus from Room column: ${campus}`);
  }
  
  // Search for professor
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'searchProfessor',
      name: professorName,
      campus: campus
    });
    
    if (response && response.success) {
      updateRMPButton(button, response.data);
    } else {
      console.warn(`[LACCD RMP] Search failed for ${professorName}:`, response?.error);
      updateRMPButton(button, { found: false, reason: response?.error || 'Search failed' });
    }
  } catch (error) {
    console.error(`[LACCD RMP] Error processing professor ${professorName}:`, error);
    updateRMPButton(button, { found: false, reason: 'Error occurred' });
  }
}

// Main function to process all professors
async function processAllProfessors() {
  const professorElements = findProfessorElements();
  
  if (professorElements.length === 0) {
    console.log('[LACCD RMP] No professor elements found on this page');
    return;
  }
  
  // Process each professor with a small delay to avoid overwhelming the API
  for (const element of professorElements) {
    processProfessor(element); // Don't await - process in parallel
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
}

// Initialize when page is ready
function initialize() {
  const system = detectSystem();
  console.log(`[LACCD RMP] Initializing extension for ${system}...`);
  
  // Initial check - longer delay for SIS portal due to complex page load
  const initialDelay = system === 'SIS_PORTAL' ? 3000 : 2000;
  setTimeout(() => {
    console.log('[LACCD RMP] Running initial professor search...');
    processAllProfessors();
  }, initialDelay);
  
  // Set up observer for dynamic content and page changes
  const observer = new MutationObserver((mutations) => {
    // Check if content with instructors appeared
    let hasResults = false;
    
    if (system === 'GUEST_SEARCH') {
      hasResults = document.querySelector('span[id^="MTG_INSTR$"]') || 
                   document.querySelector('#win0divSSR_CLSRSLT_WRK_GROUPBOX1');
    } else if (system === 'SIS_PORTAL') {
      // Check for various SIS portal instructor containers
      hasResults = document.querySelector('span[id*="INSTR"]') ||
                   document.querySelector('span[id*="SSR_CLS_DTL"]') ||
                   document.querySelector('.ps_box-scrollarea[id*="DETAILS"]') ||
                   document.querySelector('[id*="STDNT_ENRL"]');
    }
    
    if (hasResults) {
      // Debounce: only process if we haven't processed recently
      if (!window.lastProcessTime || (Date.now() - window.lastProcessTime > 1000)) {
        console.log('[LACCD RMP] Detected new content, processing professors...');
        window.lastProcessTime = Date.now();
        setTimeout(processAllProfessors, 500);
      }
    }
  });
  
  // Observe the main content area for any changes
  const mainContent = document.querySelector('#win0divPSPAGECONTAINER') || 
                      document.querySelector('#PT_CONTENT') ||
                      document.body;
  observer.observe(mainContent, {
    childList: true,
    subtree: true
  });
  
  console.log('[LACCD RMP] Observer set up, watching for changes...');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for clicks that might reveal instructor information
document.addEventListener('click', (e) => {
  const target = e.target;
  const system = detectSystem();
  
  if (system === 'GUEST_SEARCH') {
    // Check if search button was clicked on guest search
    if (target && (
      target.id === 'CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH' || 
      target.name === 'CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH'
    )) {
      console.log('[LACCD RMP] Search button clicked! Waiting for results...');
      
      // Check multiple times as results load
      setTimeout(() => processAllProfessors(), 2000);
      setTimeout(() => processAllProfessors(), 4000);
      setTimeout(() => processAllProfessors(), 6000);
    }
  } else if (system === 'SIS_PORTAL') {
    // Check if class detail link was clicked (reveals instructor info)
    const targetElement = target.closest('a, .ps-link');
    if (targetElement && (
      targetElement.id?.includes('SSR_SBJ_CAT_NBR') ||
      targetElement.id?.includes('SCRTAB_DTLS') ||
      targetElement.classList.contains('ps_header-group') ||
      targetElement.textContent?.includes('Class#')
    )) {
      console.log('[LACCD RMP] Class detail link clicked! Waiting for details...');
      
      // Check multiple times as details expand
      setTimeout(() => processAllProfessors(), 1000);
      setTimeout(() => processAllProfessors(), 2000);
      setTimeout(() => processAllProfessors(), 3000);
    }
    
    // Check for search or filter buttons in SIS portal
    if (target && (
      target.id?.includes('SEARCH') ||
      target.id?.includes('SSR_PB_GO') ||
      target.textContent?.trim() === 'Search'
    )) {
      console.log('[LACCD RMP] SIS search button clicked! Waiting for results...');
      setTimeout(() => processAllProfessors(), 2000);
      setTimeout(() => processAllProfessors(), 4000);
    }
  }
}, true);

// Periodically check for professors on results page (fallback)
setInterval(() => {
  const system = detectSystem();
  let resultsContainer, hasUnprocessedProfs;
  
  if (system === 'GUEST_SEARCH') {
    // Only run if we see the results container but haven't processed yet
    resultsContainer = document.querySelector('#win0divSSR_CLSRSLT_WRK_GROUPBOX1');
    hasUnprocessedProfs = document.querySelector('span[id^="MTG_INSTR$"]:not([data-rmp-processed])');
  } else if (system === 'SIS_PORTAL') {
    // Check for SIS portal containers with unprocessed instructors
    resultsContainer = document.querySelector('[id*="STDNT_ENRL"], [id*="SSR_CLS_DTL"], .ps_box-scrollarea');
    hasUnprocessedProfs = document.querySelector('span[id*="INSTR"]:not([data-rmp-processed])') ||
                          document.querySelector('.ps_box-value:not([data-rmp-processed])');
  }
  
  if (resultsContainer && hasUnprocessedProfs) {
    console.log('[LACCD RMP] Periodic check found unprocessed professors');
    processAllProfessors();
  }
}, 3000);

