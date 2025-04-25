// API base URL - adjusted to match your FastAPI backend running on port 4200 with /api prefix
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const createUserForm = document.getElementById('create-user-form');
const messageContainer = document.getElementById('create-message-container');

// Helper function for displaying messages
function showMessage(message, isError = false) {
  messageContainer.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 5000);
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
    showMessage('User created successfully!');
    createUserForm.reset();
    
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
  // Create user form submission
  createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Create user data object from form
    const userData = {
      numero_identificacao: parseInt(document.getElementById('numero_identificacao').value),
      complete_name: document.getElementById('complete_name').value,
      date_nascimento: document.getElementById('date_nascimento').value,
      date_admissao: document.getElementById('date_admissao').value,
      role: document.getElementById('role').value,
      telephone_number: document.getElementById('telephone_number').value,
      observation: document.getElementById('observation').value,
      status: 'Ativo' // New users are active by default
    };
    
    await createUser(userData);
  });
});