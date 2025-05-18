// Import necessary functions from our modules
import { showMessage } from '../../../target/js/utils/utils.js';
import { resetSearch, updateUserCount, applyAllFilters } from '../../../target/js/utils/search.js';

// API base URL - adjusted to match your FastAPI backend running on port 4200 with /api prefix
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const employeesTableBody = document.getElementById('employees-table-body');

// Format date from ISO to local display format
function formatDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString();
}

// Format telephone number to (XX) X XXXX XXXX format
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Clean the number of any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length === 11) {
    // Format: (XX) X XXXX XXXX
    return `(${cleanNumber.substring(0, 2)}) ${cleanNumber.substring(2, 3)} ${cleanNumber.substring(3, 7)} ${cleanNumber.substring(7, 11)}`;
  } else if (cleanNumber.length === 10) {
    // Format: (XX) XXXX XXXX (for numbers without the 9 prefix)
    return `(${cleanNumber.substring(0, 2)}) ${cleanNumber.substring(2, 6)} ${cleanNumber.substring(6, 10)}`;
  }
  
  // Return original if it doesn't match expected formats
  return phoneNumber;
}

// API function to fetch all users
async function fetchAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const users = await response.json();
    displayUsers(users);
    updateUserCount(); // Update the user count badge
    
    // After loading users, populate role dropdown with unique roles
    populateRoleDropdown(users);
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to get distinct roles from users data
function populateRoleDropdown(users) {
  const roleFilter = document.getElementById('role-filter');
  if (!roleFilter) return;
  
  // Extract all roles and keep only unique values
  const roles = [...new Set(users.map(user => user.role))].filter(role => role);
  
  // Save current selection if any
  const currentSelection = roleFilter.value;
  
  // Clear dropdown except the "All" option
  while (roleFilter.options.length > 1) {
    roleFilter.remove(1);
  }
  
  // Add roles to dropdown
  roles.sort().forEach(role => {
    const option = document.createElement('option');
    option.value = role.toLowerCase();
    option.textContent = role;
    roleFilter.appendChild(option);
  });
  
  // Restore selected value if it still exists in the new options
  if (currentSelection && currentSelection !== 'all') {
    const exists = Array.from(roleFilter.options).some(opt => opt.value === currentSelection);
    if (exists) {
      roleFilter.value = currentSelection;
    } else {
      roleFilter.value = 'all';
    }
  }
  
  // Re-apply filters in case the role options changed
  applyAllFilters();
}

// Function to display users in the table with the required field order
function displayUsers(users) {
  employeesTableBody.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.dataset.userId = user.numero_identificacao;
    
    // Create the status class
    const statusClass = user.status === 'Ativo' ? 'active' : 'inactive';
    const statusText = user.status === 'Ativo' ? 'Ativo' : 'Inativo';
    
    // Format dates
    const joinDate = formatDate(user.date_admissao);
    const birthDate = formatDate(user.date_nascimento);
    
    // Format telephone number
    const formattedPhone = formatPhoneNumber(user.telephone_number);
    
    // Create row HTML with data in the required order
    row.innerHTML = `
      <td>${user.numero_identificacao}</td>
      <td>
        <div class="user-name-info">
          <span class="user-name">${user.complete_name}</span>
          <span class="user-email">${joinDate}</span>
        </div>
        
        <!-- Hover detail panel with additional information -->
        <div class="user-detail-panel">
          <div class="detail-header">
            <h3>${user.complete_name}</h3>
          </div>
          
          <div class="detail-section">
            <h4>ID</h4>
            <p>${user.numero_identificacao}</p>
          </div>
          
          <div class="detail-section">
            <h4>Data de Nascimento</h4>
            <p>${birthDate}</p>
          </div>
          
          <div class="detail-section">
            <h4>Observação</h4>
            <p>${user.observation || 'No notes available'}</p>
          </div>
        </div>
      </td>
      <td>${formattedPhone}</td>
      <td>${user.role}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
    `;
    
    employeesTableBody.appendChild(row);
  });
}

// Function to delete a user
async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete user');
    }
    
    showMessage('User deleted successfully');
    fetchAllUsers(); // Refresh the user list
    return true;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return false;
  }
}

// Function to get user by ID
async function getUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    return await response.json();
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load users on page load
  fetchAllUsers();

  // Listen for reset search event
  document.addEventListener('resetSearch', fetchAllUsers);
});

// Export functions that might be needed by other modules
export { fetchAllUsers, populateRoleDropdown };
