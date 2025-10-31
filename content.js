// Content script for LACCD course search page

// Mark that extension is loaded
window.laccdRmpExtension = true;

// Extract campus from URL
function getCurrentCampus() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('Campus') || 'LAPC';
}

// Extract campus from the Room column text (more accurate)
function getCampusFromRoom(professorElement) {
  // Find the row containing this professor
  const row = professorElement.closest('tr');
  if (!row) return null;
  
  // Look for the Room cell in this row
  const roomCell = row.querySelector('span[id^="MTG_ROOM$"]');
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
  console.log('[LACCD RMP] Initializing extension...');
  
  // Initial check
  setTimeout(() => {
    console.log('[LACCD RMP] Running initial professor search...');
    processAllProfessors();
  }, 2000);
  
  // Set up observer for dynamic content and page changes
  const observer = new MutationObserver((mutations) => {
    // Check if search results appeared
    const hasResults = document.querySelector('span[id^="MTG_INSTR$"]');
    const resultsContainer = document.querySelector('#win0divSSR_CLSRSLT_WRK_GROUPBOX1');
    
    if (hasResults || resultsContainer) {
      // Debounce: only process if we haven't processed recently
      if (!window.lastProcessTime || (Date.now() - window.lastProcessTime > 1000)) {
        console.log('[LACCD RMP] Detected new content, processing professors...');
        window.lastProcessTime = Date.now();
        setTimeout(processAllProfessors, 500);
      }
    }
  });
  
  // Observe the main content area for any changes
  const mainContent = document.querySelector('#win0divPSPAGECONTAINER') || document.body;
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

// Listen for search button clicks (PeopleSoft uses submitAction_win0)
document.addEventListener('click', (e) => {
  const target = e.target;
  
  // Check if search button was clicked
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
}, true);

// Periodically check for professors on results page (fallback)
setInterval(() => {
  // Only run if we see the results container but haven't processed yet
  const resultsContainer = document.querySelector('#win0divSSR_CLSRSLT_WRK_GROUPBOX1');
  const hasUnprocessedProfs = document.querySelector('span[id^="MTG_INSTR$"]:not([data-rmp-processed])');
  
  if (resultsContainer && hasUnprocessedProfs) {
    console.log('[LACCD RMP] Periodic check found unprocessed professors');
    processAllProfessors();
  }
}, 3000);

