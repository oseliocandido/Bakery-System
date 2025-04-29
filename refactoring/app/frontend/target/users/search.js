// Import utils
import { showMessage } from './utils.js';

// Constants
const API_BASE_URL = 'http://localhost:4200/api';

// Search users function - Using contains instead of startsWith
function searchUsers(query) {
  // This is a client-side search that uses contains
  const rows = document.querySelectorAll('#employees-table-body tr');
  
  if (rows.length === 0) {
    console.log('No rows found to search');
    return 0;
  }
  
  let matchCount = 0;
  const searchTermLower = query.toLowerCase();
  
  rows.forEach(row => {
    // Get name cell (second column)
    const nameCell = row.querySelector('td:nth-child(2)');
    if (!nameCell) return;
    
    // Extract user name
    const userName = nameCell.querySelector('.user-name')?.textContent || '';
    
    // Check if the userName contains the search query
    if (userName.toLowerCase().includes(searchTermLower)) {
      row.style.display = '';
      matchCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  // Update the count badge to show filtered results
  if (query && query.length > 0) {
    document.getElementById('user-count-badge').textContent = matchCount;
  } else {
    updateUserCount();
  }
  
  return matchCount;
}

// Function to apply search filter
function applySearchFilter(searchTerm) {
  const matchCount = searchUsers(searchTerm);
  console.log(`Found ${matchCount} matching results for "${searchTerm}"`);
}

// Reset search and show all results
function resetSearch() {
  const searchInput = document.getElementById('user-search');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Show all rows
  const rows = document.querySelectorAll('#employees-table-body tr');
  rows.forEach(row => {
    row.style.display = '';
  });
  
  // Update the count badge with total users
  updateUserCount();
  
  // Dispatch custom event to notify other components
  document.dispatchEvent(new CustomEvent('resetSearch'));
}

// Reset filters to default values
function resetFilters() {
  const statusFilter = document.getElementById('status-filter');
  const roleFilter = document.getElementById('role-filter');
  const dateFilter = document.getElementById('date-filter');
  
  // Reset each filter to "Todos" option
  if (statusFilter) statusFilter.value = '';
  if (roleFilter) roleFilter.value = '';
  if (dateFilter) dateFilter.value = '';
  
  // Show all rows that weren't hidden by search
  const searchInput = document.getElementById('user-search');
  const searchTerm = searchInput?.value?.trim() || '';
  
  if (searchTerm.length > 0) {
    // Re-apply just the search filter
    applySearchFilter(searchTerm);
  } else {
    // Show all rows
    const rows = document.querySelectorAll('#employees-table-body tr');
    rows.forEach(row => {
      row.style.display = '';
    });
    updateUserCount();
  }
  
}

// Function to update the user count badge
function updateUserCount() {
  const totalRows = document.querySelectorAll('#employees-table-body tr').length;
  const visibleRows = document.querySelectorAll('#employees-table-body tr[style=""]').length;
  const countBadge = document.getElementById('user-count-badge');
  
  if (countBadge) {
    countBadge.textContent = visibleRows || totalRows;
  }
}

// Filter dropdown functionality
function initializeFilters() {
  const filtersButton = document.getElementById('filters-button');
  const filtersMenu = document.getElementById('filters-menu');
  
  // Toggle the filters menu when clicking the button
  filtersButton?.addEventListener('click', () => {
    filtersMenu.classList.toggle('active');
  });
  
  // Close the filters menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!filtersButton?.contains(event.target) && !filtersMenu?.contains(event.target)) {
      filtersMenu?.classList.remove('active');
    }
  });
  
  // Set up filter handlers
  const statusFilter = document.getElementById('status-filter');
  const roleFilter = document.getElementById('role-filter');
  const dateFilter = document.getElementById('date-filter');
  
  // Apply filters when changed
  [statusFilter, roleFilter, dateFilter].forEach(filter => {
    filter?.addEventListener('change', () => {
      // Apply all filters
      applyAllFilters();
    });
  });
  
  // Add reset button to filters menu
  if (filtersMenu && !document.getElementById('reset-filters-btn')) {
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-filters-btn';
    resetButton.className = 'reset-filters-btn';
    resetButton.textContent = 'Reset Filters';
    resetButton.addEventListener('click', resetFilters);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'filter-option filter-buttons';
    buttonContainer.appendChild(resetButton);
    
    filtersMenu.appendChild(buttonContainer);
  }
}

// Function to apply all selected filters
function applyAllFilters() {
  const statusFilter = document.getElementById('status-filter');
  const roleFilter = document.getElementById('role-filter');
  const dateFilter = document.getElementById('date-filter');
  
  const statusValue = statusFilter?.value || 'all';
  const roleValue = roleFilter?.value || 'all';
  const dateValue = dateFilter?.value || 'all';
  
  console.log(`Applying filters - Status: ${statusValue}, Role: ${roleValue}, Date: ${dateValue}`);
  
  // First, reset display of all rows (to handle case when switching from one filter to another)
  const allRows = document.querySelectorAll('#employees-table-body tr');
  allRows.forEach(row => {
    row.style.display = '';
  });
  
  // Re-apply search filter first
  const searchInput = document.getElementById('user-search');
  const searchTerm = searchInput?.value?.trim() || '';
  if (searchTerm.length > 0) {
    searchUsers(searchTerm);
  }
  
  // Now apply the dropdown filters
  const rows = document.querySelectorAll('#employees-table-body tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    // Skip if already hidden by search
    if (row.style.display === 'none') return;
    
    let showRow = true;
    
    // Status filter
    if (statusValue !== 'all') {
      const statusCell = row.querySelector('td:nth-child(5)'); // Status is in 5th column 
      const statusBadge = statusCell?.querySelector('.status');
      const isActive = statusBadge?.classList.contains('active');
      
      if ((statusValue === 'active' && !isActive) || (statusValue === 'inactive' && isActive)) {
        showRow = false;
      }
    }
    
    // Role filter
    if (showRow && roleValue !== 'all') {
      const roleCell = row.querySelector('td:nth-child(4)'); // Role is in 4th column
      const roleText = roleCell?.textContent.toLowerCase().trim() || '';
      
      // Compare exactly with the selected role value
      if (roleText !== roleValue.toLowerCase()) {
        showRow = false;
      }
    }
    
    
    // Show or hide the row based on filter results
    if (showRow) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  // Update the count badge with filtered results
  document.getElementById('user-count-badge').textContent = visibleCount;
}

// Initialize search functionality
function initializeSearch() {
  // Search input functionality
  const searchInput = document.getElementById('user-search');
  
  if (searchInput) {
    // Search as user types (with debounce for performance)
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim();
        applySearchFilter(searchTerm);
        
        // After applying search, re-apply any active filters
        applyAllFilters();
      }, 300); // 300ms debounce
    });
    
    // Clear button for search
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !document.querySelector('.search-clear')) {
      const clearButton = document.createElement('button');
      clearButton.className = 'search-clear';
      clearButton.innerHTML = '<i class="fas fa-times"></i>';
      clearButton.style.display = 'none';
      
      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.style.display = 'none';
        resetSearch();
        applyAllFilters(); // Re-apply filters after clearing search
      });
      
      searchInput.addEventListener('input', () => {
        clearButton.style.display = searchInput.value ? 'block' : 'none';
      });
      
      searchContainer.appendChild(clearButton);
    }
  }
  
  // Initialize filters
  initializeFilters();
}

// Export functions for use in other modules
export {
  initializeSearch,
  searchUsers,
  resetSearch,
  resetFilters,
  applySearchFilter,
  updateUserCount,
  applyAllFilters,
  showMessage
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeSearch();
  
  // Initialize user count after users are loaded
  setTimeout(updateUserCount, 500);
});