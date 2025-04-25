// API base URL - adjusted to match your FastAPI backend running on port 4200 with /api prefix
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const employeesTableBody = document.getElementById('employees-table-body');
const addButton = document.getElementById('btn-add');
const editButton = document.getElementById('btn-edit');
const deleteButton = document.getElementById('btn-delete');
const searchButton = document.getElementById('btn-search');

// Modal forms
const addUserModal = document.getElementById('add-user-modal');
const editUserModal = document.getElementById('edit-user-modal');

// Track selected users for edit/delete operations
let selectedUserId = null;
let selectedUserRow = null;

// Helper functions for messages
function showMessage(message, isError = false) {
  const messageContainer = document.createElement('div');
  messageContainer.className = `message ${isError ? 'error' : 'success'}`;
  messageContainer.textContent = message;
  
  // Insert at the top of the content area
  const contentArea = document.querySelector('.content');
  contentArea.insertBefore(messageContainer, contentArea.firstChild);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageContainer.remove();
  }, 5000);
}

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
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to display users in the table
function displayUsers(users) {
  employeesTableBody.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.dataset.userId = user.numero_identificacao;
    
    // Create the status cell with appropriate styling
    const statusClass = user.status === 'Ativo' ? 'active' : 'inactive';
    
    row.innerHTML = `
      <td>${user.complete_name}</td>
      <td>${user.telephone_number}</td>
      <td>${user.role}</td>
      <td><span class="status ${statusClass}">${user.status}</span></td>
    `;
    
    // Add click event for row selection
    row.addEventListener('click', () => {
      // Remove selection from previously selected row
      if (selectedUserRow) {
        selectedUserRow.classList.remove('selected');
      }
      
      // Set this row as selected
      row.classList.add('selected');
      selectedUserRow = row;
      selectedUserId = user.numero_identificacao;
    });
    
    employeesTableBody.appendChild(row);
  });
}

// Function to create a user
async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create user');
    }
    
    const result = await response.json();
    showMessage('User created successfully');
    fetchAllUsers(); // Refresh the user list
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
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
    showMessage('User updated successfully');
    fetchAllUsers(); // Refresh the user list
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
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

// Search users function
function searchUsers(query) {
  // This is a simplified client-side search
  // For large datasets, this should be a server-side search API call
  
  const rows = employeesTableBody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(query.toLowerCase())) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Create user form HTML
function buildAddUserForm() {
  return `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Add New User</h2>
        <form id="create-user-form">
          <div class="form-group">
            <label for="numero_identificacao">ID Number</label>
            <input type="number" id="numero_identificacao" name="numero_identificacao" required>
          </div>
          
          <div class="form-group">
            <label for="complete_name">Full Name</label>
            <input type="text" id="complete_name" name="complete_name" required>
          </div>
          
          <div class="form-group">
            <label for="date_nascimento">Date of Birth</label>
            <input type="date" id="date_nascimento" name="date_nascimento" required>
          </div>
          
          <div class="form-group">
            <label for="date_admissao">Admission Date</label>
            <input type="date" id="date_admissao" name="date_admissao" required>
          </div>
          
          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" name="role" required>
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="telephone_number">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="observation">Notes</label>
            <textarea id="observation" name="observation"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" id="cancel-add">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Edit user form HTML
function buildEditUserForm(user) {
  return `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Edit User</h2>
        <form id="edit-user-form">
          <input type="hidden" id="edit_id" value="${user.numero_identificacao}">
          
          <div class="form-group">
            <label for="edit_complete_name">Full Name</label>
            <input type="text" id="edit_complete_name" name="complete_name" value="${user.complete_name}" required>
          </div>
          
          <div class="form-group">
            <label for="edit_date_nascimento">Date of Birth</label>
            <input type="date" id="edit_date_nascimento" name="date_nascimento" value="${user.date_nascimento.split('T')[0]}" required>
          </div>
          
          <div class="form-group">
            <label for="edit_date_admissao">Admission Date</label>
            <input type="date" id="edit_date_admissao" name="date_admissao" value="${user.date_admissao.split('T')[0]}" required>
          </div>
          
          <div class="form-group">
            <label for="edit_role">Role</label>
            <select id="edit_role" name="role" required>
              <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit_email">Email</label>
            <input type="email" id="edit_email" name="email" value="${user.telephone_number}" required>
          </div>
          
          <div class="form-group">
            <label for="edit_status">Status</label>
            <select id="edit_status" name="status" required>
              <option value="Active" ${user.status === 'Ativo' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${user.status === 'Inativo' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit_observation">Notes</label>
            <textarea id="edit_observation" name="observation">${user.observation || ''}</textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" id="cancel-edit">Cancel</button>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load users on page load
  fetchAllUsers();
  
  // Add user button
  addButton.addEventListener('click', () => {
    addUserModal.innerHTML = buildAddUserForm();
    addUserModal.style.display = 'block';
    
    // Add event listener for form submission
    document.getElementById('create-user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userData = {
        numero_identificacao: parseInt(document.getElementById('numero_identificacao').value),
        complete_name: document.getElementById('complete_name').value,
        date_nascimento: document.getElementById('date_nascimento').value,
        date_admissao: document.getElementById('date_admissao').value,
        role: document.getElementById('role').value,
        telephone_number: document.getElementById('email').value, // Using telephone_number field for email in this UI
        observation: document.getElementById('observation').value,
        status: 'Ativo' // New users are active by default
      };
      
      await createUser(userData);
      addUserModal.style.display = 'none';
    });
    
    // Cancel button
    document.getElementById('cancel-add').addEventListener('click', () => {
      addUserModal.style.display = 'none';
    });
  });
  
  // Edit user button
  editButton.addEventListener('click', async () => {
    if (!selectedUserId) {
      showMessage('Please select a user to edit', true);
      return;
    }
    
    const user = await getUser(selectedUserId);
    if (!user) return;
    
    editUserModal.innerHTML = buildEditUserForm(user);
    editUserModal.style.display = 'block';
    
    // Add event listener for form submission
    document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userData = {
        numero_identificacao: parseInt(document.getElementById('edit_id').value),
        complete_name: document.getElementById('edit_complete_name').value,
        date_nascimento: document.getElementById('edit_date_nascimento').value,
        date_admissao: document.getElementById('edit_date_admissao').value,
        role: document.getElementById('edit_role').value,
        telephone_number: document.getElementById('edit_email').value,
        observation: document.getElementById('edit_observation').value,
        status: document.getElementById('edit_status').value === 'Active' ? 'Ativo' : 'Inativo'
      };
      
      await updateUser(selectedUserId, userData);
      editUserModal.style.display = 'none';
      
      // Reset selection
      selectedUserId = null;
      selectedUserRow = null;
    });
    
    // Cancel button
    document.getElementById('cancel-edit').addEventListener('click', () => {
      editUserModal.style.display = 'none';
    });
  });
  
  // Delete user button
  deleteButton.addEventListener('click', async () => {
    if (!selectedUserId) {
      showMessage('Please select a user to delete', true);
      return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(selectedUserId);
      
      // Reset selection
      selectedUserId = null;
      selectedUserRow = null;
    }
  });
  
  // Search button
  searchButton.addEventListener('click', () => {
    const searchTerm = prompt('Enter search term:');
    if (searchTerm) {
      searchUsers(searchTerm);
    }
  });
});

// Add CSS for the modal and row selection
const style = document.createElement('style');
style.textContent = `
  .selected {
    background-color: #e6f7ff !important;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .form-actions button {
    padding: 8px 15px;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .form-actions button[type="submit"] {
    background-color: #4a90e2;
    color: white;
    border: none;
  }
  
  .form-actions button[type="button"] {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
  }
`;
document.head.appendChild(style);
