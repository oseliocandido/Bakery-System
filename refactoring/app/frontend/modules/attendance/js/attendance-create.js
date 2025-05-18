// API base URL - adjusted to match your FastAPI backend running on port 4200 with /api prefix
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const employeeSelect = document.getElementById('funcionario');
const attendanceButtons = document.querySelectorAll('.attendance-button');
const registerButton = document.getElementById('register-attendance');
const messageContainer = document.getElementById('create-attendance-message-container');

// Store the selected attendance type
let selectedAttendanceType = null;

// Helper function for displaying messages
function showMessage(message, isError = false) {
  messageContainer.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 5000);
}

// Function to load all active employees for the dropdown
async function loadEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = await response.json();
    
    // Clear existing options except the first one
    employeeSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
    
    // Add only active employees to the dropdown
    employees
      .filter(user => user.status === 'Ativo')
      .forEach(user => {
        const option = document.createElement('option');
        option.value = user.numero_identificacao;
        option.textContent = user.complete_name;
        employeeSelect.appendChild(option);
      });
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to create attendance record
async function createAttendance(userId, type) {
  try {
    // Map the friendly type names to API values
    const typeMapping = {
      'entrada': 'check-in',
      'saida': 'check-out',
      'entrada-almoco': 'lunch-start',
      'saida-almoco': 'lunch-end'
    };
    
    const apiType = typeMapping[type];
    if (!apiType) {
      throw new Error('Invalid attendance type');
    }
    
    // Get current datetime for the record
    const now = new Date();
    const datetime = now.toISOString();
    
    const attendanceData = {
      user_id: parseInt(userId),
      datetime: datetime,
      type: apiType
    };
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/attendances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create attendance record');
    }
    
    const result = await response.json();
    showMessage('Ponto registrado com sucesso!');
    
    // Reset form
    resetForm();
    
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Reset the form after submission
function resetForm() {
  employeeSelect.value = '';
  
  // Deselect all attendance buttons
  attendanceButtons.forEach(button => {
    button.classList.remove('selected');
  });
  
  selectedAttendanceType = null;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load employees for the dropdown
  loadEmployees();
  
  // Add click event for attendance type buttons
  attendanceButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove selected class from all buttons
      attendanceButtons.forEach(btn => {
        btn.classList.remove('selected');
      });
      
      // Add selected class to clicked button
      button.classList.add('selected');
      
      // Store the selected type
      selectedAttendanceType = button.dataset.type;
    });
  });
  
  // Register button click handler
  registerButton.addEventListener('click', async () => {
    const employeeId = employeeSelect.value;
    
    // Validate form inputs
    if (!employeeId) {
      showMessage('Por favor, selecione um funcionário.', true);
      return;
    }
    
    if (!selectedAttendanceType) {
      showMessage('Por favor, selecione um tipo de registro.', true);
      return;
    }
    
    // Create the attendance record
    await createAttendance(employeeId, selectedAttendanceType);
  });
});