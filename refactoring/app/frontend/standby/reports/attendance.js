// API base URL - adjusted to match your FastAPI backend running on port 4200
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const attendanceTableBody = document.getElementById('attendance-table-body');
const employeeSelect = document.getElementById('employee-select');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');
const typeSelect = document.getElementById('type-select');
const filterButton = document.getElementById('btn-filter');
const resetButton = document.getElementById('btn-reset');
const addButton = document.getElementById('btn-add');
const editButton = document.getElementById('btn-edit');
const deleteButton = document.getElementById('btn-delete');

// Modal elements
const addAttendanceModal = document.getElementById('add-attendance-modal');
const editAttendanceModal = document.getElementById('edit-attendance-modal');

// Track selected attendance for edit/delete operations
let selectedAttendanceId = null;
let selectedAttendanceRow = null;
let selectedEmployeeId = null;
let employees = [];

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

// Format time from ISO to local display format
function formatTime(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Get employee name by ID
function getEmployeeName(employeeId) {
  const employee = employees.find(emp => emp.numero_identificacao === employeeId);
  return employee ? employee.complete_name : 'Unknown';
}

// API function to fetch all employees (for the dropdown)
async function fetchEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    employees = await response.json();
    populateEmployeeSelect();
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Populate employee dropdown
function populateEmployeeSelect() {
  employeeSelect.innerHTML = '<option value="">All Employees</option>';
  
  employees.forEach(employee => {
    if (employee.status === 'Ativo') {
      const option = document.createElement('option');
      option.value = employee.numero_identificacao;
      option.textContent = employee.complete_name;
      employeeSelect.appendChild(option);
    }
  });
}

// API function to fetch attendances with filters
async function fetchAttendances() {
  try {
    let url;
    const employeeId = employeeSelect.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    const type = typeSelect.value;
    
    // If no employee is selected, fetch all attendances (this would require a different endpoint in your API)
    if (!employeeId) {
      showMessage("Please select an employee to view attendances", true);
      return;
    }
    
    // Base URL for a specific employee's attendances
    url = `${API_BASE_URL}/users/${employeeId}/attendances`;
    
    // If date range is specified, use the by-period endpoint
    if (dateFrom && dateTo) {
      url = `${url}/by-period?start_date=${dateFrom}&end_date=${dateTo}`;
    } else if (dateFrom || dateTo) {
      showMessage("Please specify both From and To dates for date range filtering", true);
      return;
    }
    
    // Add type filter if specified
    if (type && !dateFrom && !dateTo) {
      url = `${url}?type=${type}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        // No attendances found is not an error, just an empty list
        displayAttendances([]);
        return;
      }
      throw new Error('Failed to fetch attendances');
    }
    
    const attendances = await response.json();
    displayAttendances(attendances);
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  }
}

// Function to display attendances in the table
function displayAttendances(attendances) {
  attendanceTableBody.innerHTML = '';
  
  if (attendances.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="no-records">No attendance records found</td>';
    attendanceTableBody.appendChild(row);
    return;
  }
  
  attendances.forEach(attendance => {
    const row = document.createElement('tr');
    // Store attendance data in dataset for easy access
    row.dataset.attendanceId = attendance.id;
    row.dataset.employeeId = attendance.user_id;
    
    const dateObj = new Date(attendance.datetime);
    
    row.innerHTML = `
      <td>${getEmployeeName(attendance.user_id)}</td>
      <td>${formatDate(attendance.datetime)}</td>
      <td>${attendance.type}</td>
      <td>${formatTime(attendance.datetime)}</td>
    `;
    
    // Add click event for row selection
    row.addEventListener('click', () => {
      // Remove selection from previously selected row
      if (selectedAttendanceRow) {
        selectedAttendanceRow.classList.remove('selected');
      }
      
      // Set this row as selected
      row.classList.add('selected');
      selectedAttendanceRow = row;
      selectedAttendanceId = attendance.id;
      selectedEmployeeId = attendance.user_id;
    });
    
    attendanceTableBody.appendChild(row);
  });
}

// Function to create a new attendance
async function createAttendance(attendanceData) {
  try {
    const employeeId = attendanceData.user_id;
    const response = await fetch(`${API_BASE_URL}/users/${employeeId}/attendances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create attendance');
    }
    
    const result = await response.json();
    showMessage('Attendance created successfully');
    fetchAttendances(); // Refresh the attendance list
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Function to update an attendance
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
    showMessage('Attendance updated successfully');
    fetchAttendances(); // Refresh the attendance list
    return result;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Function to delete an attendance
async function deleteAttendance(employeeId, attendanceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${employeeId}/attendances/${attendanceId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete attendance');
    }
    
    showMessage('Attendance deleted successfully');
    fetchAttendances(); // Refresh the attendance list
    return true;
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return false;
  }
}

// Create attendance form HTML
function buildAddAttendanceForm() {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  const timeString = now.toTimeString().slice(0, 5);
  
  return `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Register New Attendance</h2>
        <form id="create-attendance-form">
          <div class="form-group">
            <label for="add_employee">Employee</label>
            <select id="add_employee" name="user_id" required>
              <option value="">Select Employee</option>
              ${employees
                .filter(emp => emp.status === 'Ativo')
                .map(emp => `<option value="${emp.numero_identificacao}">${emp.complete_name}</option>`)
                .join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="add_date">Date</label>
            <input type="date" id="add_date" name="date" required value="${dateString}">
          </div>
          
          <div class="form-group">
            <label for="add_time">Time</label>
            <input type="time" id="add_time" name="time" required value="${timeString}">
          </div>
          
          <div class="form-group">
            <label for="add_type">Type</label>
            <select id="add_type" name="type" required>
              <option value="">Select Type</option>
              <option value="check-in">Check In</option>
              <option value="check-out">Check Out</option>
              <option value="lunch-start">Lunch Start</option>
              <option value="lunch-end">Lunch End</option>
            </select>
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

// Edit attendance form HTML
function buildEditAttendanceForm(attendance, employeeId) {
  const datetimeObj = new Date(attendance.datetime);
  const dateString = datetimeObj.toISOString().split('T')[0];
  const timeString = datetimeObj.toTimeString().slice(0, 5);
  
  return `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Edit Attendance</h2>
        <form id="edit-attendance-form">
          <input type="hidden" id="edit_id" value="${attendance.id}">
          <input type="hidden" id="edit_employee_id" value="${employeeId}">
          
          <div class="form-group">
            <label for="edit_employee">Employee</label>
            <select id="edit_employee" name="user_id" required disabled>
              ${employees
                .map(emp => `<option value="${emp.numero_identificacao}" ${emp.numero_identificacao === employeeId ? 'selected' : ''}>${emp.complete_name}</option>`)
                .join('')}
            </select>
            <small>Employee cannot be changed</small>
          </div>
          
          <div class="form-group">
            <label for="edit_date">Date</label>
            <input type="date" id="edit_date" name="date" required value="${dateString}">
          </div>
          
          <div class="form-group">
            <label for="edit_time">Time</label>
            <input type="time" id="edit_time" name="time" required value="${timeString}">
          </div>
          
          <div class="form-group">
            <label for="edit_type">Type</label>
            <select id="edit_type" name="type" required>
              <option value="check-in" ${attendance.type === 'check-in' ? 'selected' : ''}>Check In</option>
              <option value="check-out" ${attendance.type === 'check-out' ? 'selected' : ''}>Check Out</option>
              <option value="lunch-start" ${attendance.type === 'lunch-start' ? 'selected' : ''}>Lunch Start</option>
              <option value="lunch-end" ${attendance.type === 'lunch-end' ? 'selected' : ''}>Lunch End</option>
            </select>
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

// Function to get attendance by ID from a specific employee
async function getAttendance(employeeId, attendanceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${employeeId}/attendances/${attendanceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance details');
    }
    return await response.json();
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    return null;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load employees dropdown on page load
  fetchEmployees();
  
  // Filter button
  filterButton.addEventListener('click', fetchAttendances);
  
  // Reset filters
  resetButton.addEventListener('click', () => {
    employeeSelect.value = '';
    dateFromInput.value = '';
    dateToInput.value = '';
    typeSelect.value = '';
    attendanceTableBody.innerHTML = '';
  });
  
  // Add attendance button
  addButton.addEventListener('click', () => {
    // Pre-select employee if one is already selected in the filter
    const preSelectedEmployee = employeeSelect.value;
    
    addAttendanceModal.innerHTML = buildAddAttendanceForm();
    addAttendanceModal.style.display = 'block';
    
    // Pre-fill the employee if selected in the filter
    if (preSelectedEmployee) {
      document.getElementById('add_employee').value = preSelectedEmployee;
    }
    
    // Add event listener for form submission
    document.getElementById('create-attendance-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userId = parseInt(document.getElementById('add_employee').value);
      const date = document.getElementById('add_date').value;
      const time = document.getElementById('add_time').value;
      
      // Combine date and time into a single datetime string
      const datetime = new Date(`${date}T${time}`).toISOString();
      
      const attendanceData = {
        user_id: userId,
        datetime: datetime,
        type: document.getElementById('add_type').value
      };
      
      await createAttendance(attendanceData);
      addAttendanceModal.style.display = 'none';
    });
    
    // Cancel button
    document.getElementById('cancel-add').addEventListener('click', () => {
      addAttendanceModal.style.display = 'none';
    });
  });
  
  // Edit attendance button
  editButton.addEventListener('click', async () => {
    if (!selectedAttendanceId || !selectedEmployeeId) {
      showMessage('Please select an attendance record to edit', true);
      return;
    }
    
    try {
      // Fetch the attendance record
      const attendance = await getAttendance(selectedEmployeeId, selectedAttendanceId);
      
      if (!attendance) {
        throw new Error('Could not retrieve attendance details');
      }
      
      editAttendanceModal.innerHTML = buildEditAttendanceForm(attendance, selectedEmployeeId);
      editAttendanceModal.style.display = 'block';
      
      // Add event listener for form submission
      document.getElementById('edit-attendance-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = parseInt(document.getElementById('edit_employee_id').value);
        const date = document.getElementById('edit_date').value;
        const time = document.getElementById('edit_time').value;
        
        // Combine date and time into a single datetime string
        const datetime = new Date(`${date}T${time}`).toISOString();
        
        const attendanceData = {
          user_id: userId,
          datetime: datetime,
          type: document.getElementById('edit_type').value
        };
        
        await updateAttendance(selectedEmployeeId, selectedAttendanceId, attendanceData);
        editAttendanceModal.style.display = 'none';
        
        // Reset selection
        selectedAttendanceId = null;
        selectedAttendanceRow = null;
        selectedEmployeeId = null;
      });
      
      // Cancel button
      document.getElementById('cancel-edit').addEventListener('click', () => {
        editAttendanceModal.style.display = 'none';
      });
    } catch (error) {
      showMessage(`Error: ${error.message}`, true);
    }
  });
  
  // Delete attendance button
  deleteButton.addEventListener('click', async () => {
    if (!selectedAttendanceId || !selectedEmployeeId) {
      showMessage('Please select an attendance record to delete', true);
      return;
    }
    
    if (confirm('Are you sure you want to delete this attendance record?')) {
      await deleteAttendance(selectedEmployeeId, selectedAttendanceId);
      
      // Reset selection
      selectedAttendanceId = null;
      selectedAttendanceRow = null;
      selectedEmployeeId = null;
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
  
  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }
  
  .filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .no-records {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .message {
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
  }
  
  .message.success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .message.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .action-buttons {
    margin-bottom: 15px;
  }
`;
document.head.appendChild(style);