// Import necessary functions from our modules
import { showMessage } from './utils.js';
import { resetSearch, updateUserCount } from './search.js';

// API base URL - adjusted to match your FastAPI backend running on port 4200 with /api prefix
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const employeesTableBody = document.getElementById('employees-table-body');

// Format date from ISO to local display format
function formatDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString();
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
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to display users in the table with the required field order
function displayUsers(users) {
  employeesTableBody.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.dataset.userId = user.numero_identificacao;
    
    // Create the status class
    const statusClass = user.status === 'Ativo' ? 'active' : 'inactive';
    const statusText = user.status === 'Ativo' ? 'Active' : 'Inactive';
    
    // Format dates
    const joinDate = formatDate(user.date_admissao);
    const birthDate = formatDate(user.date_nascimento);
    
    // Create row HTML with data in the required order
    row.innerHTML = `
      <td>${user.numero_identificacao}</td>
      <td>
        <div class="user-name-info">
          <span class="user-name">${user.complete_name}</span>
          <span class="user-email">${user.telephone_number}</span>
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
            <h4>Date of Birth</h4>
            <p>${birthDate}</p>
          </div>
          
          <div class="detail-section">
            <h4>Email/Phone</h4>
            <p>${user.telephone_number}</p>
          </div>
          
          <div class="detail-section">
            <h4>Observation</h4>
            <p>${user.observation || 'No notes available'}</p>
          </div>
        </div>
      </td>
      <td>${joinDate}</td>
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
export { fetchAllUsers };
