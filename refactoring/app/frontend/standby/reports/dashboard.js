// API base URL - adjusted to match your FastAPI backend running on port 4200
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const dashboardDateInput = document.getElementById('dashboard-date');
const loadButton = document.getElementById('btn-load');
const summaryTableBody = document.getElementById('summary-table-body');
const totalEmployeesElement = document.getElementById('total-employees');
const presentTodayElement = document.getElementById('present-today');
const absentTodayElement = document.getElementById('absent-today');
const lateCheckinsElement = document.getElementById('late-checkins');

// Default to today's date
dashboardDateInput.value = new Date().toISOString().split('T')[0];

// Store employee and attendance data
let employees = [];
let attendanceData = {};

// Helper function to show messages
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

// Fetch all active employees
async function fetchEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    employees = await response.json();
    // Filter to only active employees
    employees = employees.filter(emp => emp.status === 'Ativo');
    
    // Update the total employees count
    totalEmployeesElement.textContent = employees.length;
    
    return employees;
  } catch (error) {
    showMessage(`Error fetching employees: ${error.message}`, true);
    return [];
  }
}

// Fetch attendance data for all employees on a specific date
async function fetchAttendanceForDate(date) {
  // Reset the attendance data object
  attendanceData = {};
  
  // Initialize with empty data for all employees
  employees.forEach(emp => {
    attendanceData[emp.numero_identificacao] = {
      employee: emp,
      checkIn: null,
      lunchStart: null,
      lunchEnd: null,
      checkOut: null
    };
  });
  
  let presentCount = 0;
  let lateCount = 0;
  
  // For each employee, fetch their attendance records for the selected date
  const fetchPromises = employees.map(async (emp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${emp.numero_identificacao}/attendances?date=${date}`);
      
      // If no attendance records found, just continue
      if (response.status === 404) {
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance for employee ${emp.complete_name}`);
      }
      
      const records = await response.json();
      
      // Process each attendance record and update the attendance data object
      records.forEach(record => {
        // Check if this employee is marked as present for this date
        if (record.type === 'check-in') {
          presentCount++;
          
          // Check if they were late (assuming 9:00 AM is the cutoff)
          const checkInTime = new Date(`2000-01-01T${record.time}`);
          const cutoffTime = new Date(`2000-01-01T09:00:00`);
          if (checkInTime > cutoffTime) {
            lateCount++;
          }
        }
        
        // Populate the attendance data based on type
        switch (record.type) {
          case 'check-in':
            attendanceData[emp.numero_identificacao].checkIn = record.time;
            break;
          case 'lunch-start':
            attendanceData[emp.numero_identificacao].lunchStart = record.time;
            break;
          case 'lunch-end':
            attendanceData[emp.numero_identificacao].lunchEnd = record.time;
            break;
          case 'check-out':
            attendanceData[emp.numero_identificacao].checkOut = record.time;
            break;
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
  
  // Wait for all fetch operations to complete
  await Promise.all(fetchPromises);
  
  // Update dashboard statistics
  presentTodayElement.textContent = presentCount;
  absentTodayElement.textContent = employees.length - presentCount;
  lateCheckinsElement.textContent = lateCount;
  
  // Render the summary table
  renderSummaryTable();
}

// Render the attendance summary table
function renderSummaryTable() {
  summaryTableBody.innerHTML = '';
  
  Object.values(attendanceData).forEach(data => {
    const row = document.createElement('tr');
    
    // Determine status
    let status;
    if (data.checkIn && data.checkOut) {
      status = 'Complete';
      row.classList.add('status-complete');
    } else if (data.checkIn) {
      status = 'Partial';
      row.classList.add('status-partial');
    } else {
      status = 'Absent';
      row.classList.add('status-absent');
    }
    
    row.innerHTML = `
      <td>${data.employee.complete_name}</td>
      <td>${data.checkIn || '-'}</td>
      <td>${data.lunchStart || '-'}</td>
      <td>${data.lunchEnd || '-'}</td>
      <td>${data.checkOut || '-'}</td>
      <td>${status}</td>
    `;
    
    summaryTableBody.appendChild(row);
  });
}

// Load dashboard data
async function loadDashboard() {
  const selectedDate = dashboardDateInput.value;
  
  if (!selectedDate) {
    showMessage('Please select a date first', true);
    return;
  }
  
  // Fetch employees if not already loaded
  if (employees.length === 0) {
    await fetchEmployees();
  }
  
  // Fetch attendance data for the selected date
  await fetchAttendanceForDate(selectedDate);
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  // Initial load of employees
  await fetchEmployees();
  
  // Load dashboard with today's data
  await loadDashboard();
  
  // Load button click
  loadButton.addEventListener('click', loadDashboard);
  
  // Date input change
  dashboardDateInput.addEventListener('change', loadDashboard);
});

// Add custom styles for the dashboard
const style = document.createElement('style');
style.textContent = `
  .stats-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 20px;
    flex: 1;
    min-width: 200px;
    text-align: center;
  }
  
  .stat-card h3 {
    margin-top: 0;
    color: #555;
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 36px;
    font-weight: bold;
    color: #333;
  }
  
  .status-complete td {
    color: #155724;
  }
  
  .status-partial td {
    color: #856404;
  }
  
  .status-absent td {
    color: #721c24;
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
`;
document.head.appendChild(style);