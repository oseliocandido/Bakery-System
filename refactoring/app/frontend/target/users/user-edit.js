// API base URL - adjusted to match your FastAPI backend running on port 4200 with /api prefix
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const userSelect = document.getElementById('user-select');
const editFormContainer = document.getElementById('edit-form-container');
const editUserForm = document.getElementById('edit-user-form');
const messageContainer = document.getElementById('edit-message-container');

// Helper function for displaying messages
function showMessage(message, isError = false) {
  messageContainer.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 5000);
}

// Function to load all users for the select dropdown
async function loadUsersForSelect() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    
    // Clear existing options except the first one
    userSelect.innerHTML = '<option value="">Select a user</option>';
    
    // Add users to the dropdown
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.numero_identificacao;
      option.textContent = `${user.complete_name} (ID: ${user.numero_identificacao})`;
      userSelect.appendChild(option);
    });
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to load user details for editing
async function loadUserDetails(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    
    const user = await response.json();
    
    // Populate form fields with user data
    document.getElementById('edit_id').value = user.numero_identificacao;
    document.getElementById('edit_complete_name').value = user.complete_name;
    document.getElementById('edit_date_nascimento').value = user.date_nascimento.split('T')[0];
    document.getElementById('edit_date_admissao').value = user.date_admissao.split('T')[0];
    document.getElementById('edit_role').value = user.role;
    document.getElementById('edit_telephone_number').value = user.telephone_number;
    document.getElementById('edit_status').value = user.status;
    document.getElementById('edit_observation').value = user.observation || '';
    
    // Show the form container
    editFormContainer.style.display = 'block';
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to update a user
async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update user');
    }
    
    const result = await response.json();
    showMessage('User updated successfully!');
    
    // Redirect to the users list after a short delay
    setTimeout(() => {
      window.location.href = 'user.html';
    }, 2000);
    
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load users for the select dropdown when the page loads
  loadUsersForSelect();
  
  // Listen for changes on the user select dropdown
  userSelect.addEventListener('change', (e) => {
    const userId = e.target.value;
    if (userId) {
      loadUserDetails(userId);
    } else {
      editFormContainer.style.display = 'none';
    }
  });
  
  // Submit handler for the edit form
  editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('edit_id').value;
    
    // Create user data object from form
    const userData = {
      numero_identificacao: parseInt(userId),
      complete_name: document.getElementById('edit_complete_name').value,
      date_nascimento: document.getElementById('edit_date_nascimento').value,
      date_admissao: document.getElementById('edit_date_admissao').value,
      role: document.getElementById('edit_role').value,
      telephone_number: document.getElementById('edit_telephone_number').value,
      status: document.getElementById('edit_status').value,
      observation: document.getElementById('edit_observation').value
    };
    
    await updateUser(userId, userData);
  });
});