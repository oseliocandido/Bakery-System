// API base URL - adjusted to match your FastAPI backend running on port 4200
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const employeeSelect = document.getElementById('employee-select');
const attendanceSelect = document.getElementById('attendance-select');
const loadAttendanceButton = document.getElementById('btn-load-attendance');
const editFormContainer = document.getElementById('edit-form-container');
const editAttendanceForm = document.getElementById('edit-attendance-form');
const messageContainer = document.getElementById('edit-message-container');
const cancelButton = document.getElementById('cancel-edit');

// Helper function for displaying messages
function showMessage(message, isError = false) {
  messageContainer.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 5000);
}

// Format date and time
function formatDateTime(isoDate) {
  if (!isoDate) return { date: '', time: '' };
  
  const date = new Date(isoDate);
  
  // Get date in YYYY-MM-DD format
  const formattedDate = date.toISOString().split('T')[0];
  
  // Get time in HH:MM format
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  
  return { date: formattedDate, time: formattedTime };
}

// Function to load all employees for the select dropdown
async function loadEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = await response.json();
    
    // Clear existing options except the first one
    employeeSelect.innerHTML = '<option value="">Select an employee</option>';
    
    // Add employees to the dropdown
    employees.forEach(employee => {
      if (employee.status === 'Ativo') {
        const option = document.createElement('option');
        option.value = employee.numero_identificacao;
        option.textContent = employee.complete_name;
        employeeSelect.appendChild(option);
      }
    });
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to load attendance records for a specific employee
async function loadAttendanceRecords(employeeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${employeeId}/attendances`);
    
    if (!response.ok) {
      if (response.status === 404) {
        attendanceSelect.innerHTML = '<option value="">No attendance records found</option>';
        return;
      }
      throw new Error('Failed to fetch attendance records');
    }
    
    const attendanceRecords = await response.json();
    
    // Clear existing options
    attendanceSelect.innerHTML = '<option value="">Select an attendance record</option>';
    
    if (attendanceRecords.length === 0) {
      attendanceSelect.innerHTML = '<option value="">No attendance records found</option>';
      return;
    }
    
    // Add attendance records to the dropdown
    attendanceRecords.forEach(record => {
      const date = new Date(record.datetime);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const option = document.createElement('option');
      option.value = record.id;
      option.textContent = `${formattedDate} - ${record.type} - ${formattedTime}`;
      attendanceSelect.appendChild(option);
    });
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to load specific attendance record for editing
async function loadAttendanceDetails(employeeId, attendanceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${employeeId}/attendances/${attendanceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance details');
    }
    
    const attendance = await response.json();
    
    // Populate form fields with attendance data
    document.getElementById('edit_id').value = attendance.id;
    document.getElementById('edit_user_id').value = attendance.user_id;
    
    const { date, time } = formatDateTime(attendance.datetime);
    document.getElementById('edit_date').value = date;
    document.getElementById('edit_time').value = time;
    document.getElementById('edit_type').value = attendance.type;
    
    // Show the form container
    editFormContainer.style.display = 'block';
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to update an attendance record
async function updateAttendance(employeeId, attendanceId, attendanceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${employeeId}/attendances/${attendanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update attendance');
    }
    
    const result = await response.json();
    showMessage('Attendance record updated successfully!');
    
    // Reset form and selections
    editAttendanceForm.reset();
    editFormContainer.style.display = 'none';
    
    // Reload attendance records to show the updated list
    await loadAttendanceRecords(employeeId);
    
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load employees on page load
  loadEmployees();
  
  // Load attendance records when employee is selected and button clicked
  loadAttendanceButton.addEventListener('click', () => {
    const employeeId = employeeSelect.value;
    if (!employeeId) {
      showMessage('Please select an employee', true);
      return;
    }
    
    loadAttendanceRecords(employeeId);
  });
  
  // Load attendance details when an attendance record is selected
  attendanceSelect.addEventListener('change', (e) => {
    const attendanceId = e.target.value;
    const employeeId = employeeSelect.value;
    
    if (attendanceId && employeeId) {
      loadAttendanceDetails(employeeId, attendanceId);
    } else {
      editFormContainer.style.display = 'none';
    }
  });
  
  // Handle form submission for updating attendance
  editAttendanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = document.getElementById('edit_user_id').value;
    const attendanceId = document.getElementById('edit_id').value;
    const date = document.getElementById('edit_date').value;
    const time = document.getElementById('edit_time').value;
    
    // Combine date and time into a datetime string
    const datetime = new Date(`${date}T${time}`).toISOString();
    
    // Create attendance data object from form
    const attendanceData = {
      user_id: parseInt(employeeId),
      datetime: datetime,
      type: document.getElementById('edit_type').value
    };
    
    await updateAttendance(employeeId, attendanceId, attendanceData);
  });
  
  // Cancel button
  cancelButton.addEventListener('click', () => {
    editFormContainer.style.display = 'none';
    editAttendanceForm.reset();
  });
});