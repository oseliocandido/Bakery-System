// Import utils
import { showMessage } from './utils.js';

// Constants
const API_BASE_URL = 'http://localhost:4200/api';

// Search users function - Using startsWith instead of contains
function searchUsers(query) {
  // This is a client-side search that uses startsWith instead of contains
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
    
    // Check if the userName starts with the search query (startsWith instead of contains)
    if (userName.toLowerCase().startsWith(searchTermLower)) {
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

// Function to update the user count badge
function updateUserCount() {
  const totalRows = document.querySelectorAll('#employees-table-body tr').length;
  const countBadge = document.getElementById('user-count-badge');
  if (countBadge) {
    countBadge.textContent = totalRows;
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
    filter?.addEventListener('change', applyAllFilters);
  });
}

// Function to apply all selected filters
function applyAllFilters() {
  const statusFilter = document.getElementById('status-filter');
  const roleFilter = document.getElementById('role-filter');
  const dateFilter = document.getElementById('date-filter');
  
  const statusValue = statusFilter?.value || 'all';
  const roleValue = roleFilter?.value || 'all';
  const dateValue = dateFilter?.value || 'all';
  
  const rows = document.querySelectorAll('#employees-table-body tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    // Check if row was hidden by search
    if (row.style.display === 'none') return;
    
    let showRow = true;
    
    // Status filter
    if (statusValue !== 'all') {
      const statusCell = row.querySelector('td:nth-child(5)'); // Status is in 5th column now
      const statusBadge = statusCell?.querySelector('.status');
      const isActive = statusBadge?.classList.contains('active');
      
      if ((statusValue === 'active' && !isActive) || (statusValue === 'inactive' && isActive)) {
        showRow = false;
      }
    }
    
    // Role filter
    if (showRow && roleValue !== 'all') {
      const roleCell = row.querySelector('td:nth-child(4)'); // Role is in 4th column now
      const roleText = roleCell?.textContent.toLowerCase() || '';
      
      if (!roleText.includes(roleValue)) {
        showRow = false;
      }
    }
    
    // Date filter (simplifying for date_admissao)
    if (showRow && dateValue !== 'all') {
      const dateCell = row.querySelector('td:nth-child(3)'); // Admission date is in 3rd column
      const dateText = dateCell?.textContent || '';
      const today = new Date();
      
      // Simplified date filtering
      switch (dateValue) {
        case 'today':
          showRow = dateText.includes(today.toLocaleDateString());
          break;
        case 'week':
          // Simplified, would need proper date parsing in real implementation
          showRow = true;
          break;
        case 'month':
          // Simplified, would need proper date parsing in real implementation
          showRow = true;
          break;
        case 'year':
          showRow = dateText.includes(today.getFullYear());
          break;
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
      }, 300); // 300ms debounce
    });
  }
  
  // Initialize filters
  initializeFilters();
}

// Export functions for use in other modules
export {
  initializeSearch,
  searchUsers,
  resetSearch,
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