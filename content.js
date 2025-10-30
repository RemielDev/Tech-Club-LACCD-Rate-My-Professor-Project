// Content script for LACCD course search page

// Mark that extension is loaded
window.laccdRmpExtension = true;

// Extract campus from URL
function getCurrentCampus() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('Campus') || 'LAPC';
}

// Find professor name elements on the page
function findProfessorElements() {
  // The LACCD site uses PeopleSoft/Oracle structure
  // Professor names are typically in specific table cells or span elements
  
  const professorElements = [];
  const processedIds = new Set();
  
  // Strategy 1: Look for instructor name spans (most common pattern in PeopleSoft)
  const instructorSpans = document.querySelectorAll('span[id*="DERIVED_SSR_FC_SSR_INSTR_LONG"], span[id*="MTG_INSTR"]');
  instructorSpans.forEach(span => {
    const text = span.textContent.trim();
    if (text && text !== 'TBA' && text !== 'Staff' && text !== '') {
      // Avoid duplicates
      if (!processedIds.has(span.id)) {
        processedIds.add(span.id);
        professorElements.push(span);
      }
    }
  });
  
  // Strategy 2: Look for table cells with instructor information
  const instructorCells = document.querySelectorAll('td.PAGROUPDIVIDER, td.PSLEVEL1GRIDROW, td[id*="win0divSSR_CLSRCH_MTG"]');
  instructorCells.forEach(cell => {
    // Look for cells that contain "Instructor:" label or instructor names
    if (cell.textContent.includes('Instructor:') || cell.textContent.includes('Instr:')) {
      const nameSpans = cell.querySelectorAll('span');
      nameSpans.forEach(nameSpan => {
        const text = nameSpan.textContent.trim();
        if (text && text !== 'TBA' && text !== 'Staff' && text !== 'Instructor:' && text !== 'Instr:') {
          if (!processedIds.has(nameSpan.id)) {
            processedIds.add(nameSpan.id);
            professorElements.push(nameSpan);
          }
        }
      });
    }
  });
  
  // Strategy 3: Look for specific instructor div structures
  const instructorDivs = document.querySelectorAll('div[id*="win0divSSR_CLSRCH_MTG"]');
  instructorDivs.forEach(div => {
    const spans = div.querySelectorAll('span.PSLONGEDITBOX');
    spans.forEach(span => {
      const text = span.textContent.trim();
      if (text && text !== 'TBA' && text !== 'Staff') {
        if (!processedIds.has(span.id)) {
          processedIds.add(span.id);
          professorElements.push(span);
        }
      }
    });
  });

  console.log(`[LACCD RMP] Found ${professorElements.length} professor elements`);
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
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.textDecoration = 'underline';
    });
    button.addEventListener('mouseleave', () => {
      button.style.textDecoration = 'none';
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
  
  // Get campus
  const campus = getCurrentCampus();
  
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
  // Wait a bit for the page to fully render
  setTimeout(() => {
    processAllProfessors();
    
    // Set up observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;
      
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldReprocess = true;
          break;
        }
      }
      
      if (shouldReprocess) {
        processAllProfessors();
      }
    });
    
    // Observe the main content area
    const mainContent = document.querySelector('#win0divPSPAGECONTAINER') || document.body;
    observer.observe(mainContent, {
      childList: true,
      subtree: true
    });
  }, 2000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Re-process when user performs a search (listen for URL changes)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(processAllProfessors, 2000);
  }
}).observe(document, { subtree: true, childList: true });

