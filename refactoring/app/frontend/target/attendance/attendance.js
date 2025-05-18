// Import utilities
import { showMessage } from '../users/utils.js';

// API base URL
const API_BASE_URL = 'http://localhost:4200/api';

// DOM Elements
const attendanceTableBody = document.getElementById('attendance-table-body');
const attendanceCountBadge = document.getElementById('attendance-count-badge');
const typeFilter = document.getElementById('type-filter');
const periodFilter = document.getElementById('period-filter');
const dateFilter = document.getElementById('date-filter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumbers = document.getElementById('page-numbers');

// State variables
let currentPage = 1;
const itemsPerPage = 10;
let allAttendanceData = [];
let filteredData = [];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  fetchAllAttendanceData();
});

// Initialize filter functionality
function initializeFilters() {
  // Date filter today's date as default
  dateFilter.valueAsDate = new Date();
  
  // Add event listeners to filters
  typeFilter.addEventListener('change', applyFilters);
  periodFilter.addEventListener('change', applyFilters);
  dateFilter.addEventListener('change', applyFilters);
  
  // Initialize search functionality
  const searchInput = document.getElementById('attendance-search');
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    applyFilters(searchTerm);
  });
  
  // Toggle filters menu
  const filtersButton = document.getElementById('filters-button');
  const filtersMenu = document.getElementById('filters-menu');
  
  filtersButton.addEventListener('click', () => {
    filtersMenu.classList.toggle('active');
  });
  
  // Close filters menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!filtersButton.contains(event.target) && !filtersMenu.contains(event.target)) {
      filtersMenu.classList.remove('active');
    }
  });
  
  // Pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderAttendanceData();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderAttendanceData();
    }
  });
}

// Fetch all attendance data from the API
async function fetchAllAttendanceData() {
  try {
    // For now, fetching from all users combined
    // In a real implementation, you'd have an endpoint for all attendance records
    const response = await fetch(`${API_BASE_URL}/attendance`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }
    
    allAttendanceData = await response.json();
    
    // Apply initial filters and render
    applyFilters();
    
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    showMessage('Erro ao carregar os registros de frequência', true);
    
    // For demo purposes - populate with sample data if API fails
    populateWithSampleData();
  }
}

// Function to populate with sample data for demonstration
function populateWithSampleData() {
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  
  const sampleUsers = [
    { id: 1001, name: 'João Silva' },
    { id: 1002, name: 'Maria Souza' },
    { id: 1003, name: 'Pedro Santos' }
  ];
  
  const attendanceTypes = ['Entrada', 'Saída Almoço', 'Entrada Almoço', 'Saída'];
  
  allAttendanceData = [];
  
  // Generate sample data for current and previous day
  for (const user of sampleUsers) {
    for (const type of attendanceTypes) {
      // Today's records
      allAttendanceData.push({
        id: Math.floor(Math.random() * 10000),
        user_id: user.id,
        user_name: user.name,
        date: formatDateToYMD(currentDate),
        time: getRandomTime(type),
        type: type
      });
      
      // Yesterday's records
      allAttendanceData.push({
        id: Math.floor(Math.random() * 10000),
        user_id: user.id,
        user_name: user.name,
        date: formatDateToYMD(yesterday),
        time: getRandomTime(type),
        type: type
      });
    }
  }
  
  applyFilters();
}

// Helper to get random time for sample data based on type
function getRandomTime(type) {
  switch (type) {
    case 'Entrada':
      return `0${Math.floor(Math.random() * 2) + 7}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    case 'Saída Almoço':
      return `12:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}`;
    case 'Entrada Almoço':
      return `13:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}`;
    case 'Saída':
      return `1${Math.floor(Math.random() * 2) + 7}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    default:
      return '00:00';
  }
}

// Format date to YYYY-MM-DD
function formatDateToYMD(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Apply filters to the attendance data
function applyFilters(searchTerm = '') {
  // Get filter values
  const selectedType = typeFilter.value;
  const selectedPeriod = periodFilter.value;
  const selectedDate = dateFilter.value;
  
  // Apply filters to all attendance data
  filteredData = allAttendanceData.filter(record => {
    // Type filter
    if (selectedType !== 'all' && record.type !== selectedType) {
      return false;
    }
    
    // Period filter
    if (selectedPeriod !== 'all') {
      const recordDate = new Date(record.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedPeriod === 'today' && formatDateToYMD(recordDate) !== formatDateToYMD(today)) {
        return false;
      }
      
      if (selectedPeriod === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        if (recordDate < startOfWeek) {
          return false;
        }
      }
      
      if (selectedPeriod === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (recordDate < startOfMonth) {
          return false;
        }
      }
    }
    
    // Date filter (overrides period filter if both are set)
    if (selectedDate && record.date !== selectedDate) {
      return false;
    }
    
    // Search term filter (if provided)
    if (searchTerm && !record.user_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Reset to first page and render the filtered data
  currentPage = 1;
  renderAttendanceData();
}

// Render the attendance data table with pagination
function renderAttendanceData() {
  // Clear the table
  attendanceTableBody.innerHTML = '';
  
  // Update count badge
  attendanceCountBadge.textContent = filteredData.length;
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  
  // Update pagination buttons state
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  
  // Render page numbers
  renderPageNumbers(totalPages);
  
  // If no data after filtering
  if (filteredData.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="6" class="empty-table-message">
        Nenhum registro encontrado para os filtros selecionados.
      </td>
    `;
    attendanceTableBody.appendChild(emptyRow);
    return;
  }
  
  // Render the current page of data
  for (let i = startIndex; i < endIndex; i++) {
    const record = filteredData[i];
    const row = document.createElement('tr');
    
    // Format date to display format (DD/MM/YYYY)
    const displayDate = formatDateToDMY(record.date);
    
    row.innerHTML = `
      <td>${record.user_id}</td>
      <td>${record.user_name}</td>
      <td>${displayDate}</td>
      <td>${record.time}</td>
      <td>${record.type}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit-btn" data-id="${record.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${record.id}" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    attendanceTableBody.appendChild(row);
  }
  
  // Add event listeners to action buttons
  addActionButtonListeners();
}

// Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDateToDMY(dateString) {
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Render pagination page numbers
function renderPageNumbers(totalPages) {
  pageNumbers.innerHTML = '';
  
  // If very few pages, show all
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      addPageNumberButton(i);
    }
    return;
  }
  
  // Otherwise, show a window around the current page
  // Always show first page
  addPageNumberButton(1);
  
  // Add ellipsis if needed
  if (currentPage > 3) {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    pageNumbers.appendChild(ellipsis);
  }
  
  // Pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  
  for (let i = start; i <= end; i++) {
    addPageNumberButton(i);
  }
  
  // Add ellipsis if needed
  if (currentPage < totalPages - 2) {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    pageNumbers.appendChild(ellipsis);
  }
  
  // Always show last page if there is more than one page
  if (totalPages > 1) {
    addPageNumberButton(totalPages);
  }
}

// Add a page number button to the pagination
function addPageNumberButton(pageNum) {
  const pageButton = document.createElement('div');
  pageButton.className = `page-number ${currentPage === pageNum ? 'active' : ''}`;
  pageButton.textContent = pageNum;
  
  pageButton.addEventListener('click', () => {
    if (currentPage !== pageNum) {
      currentPage = pageNum;
      renderAttendanceData();
    }
  });
  
  pageNumbers.appendChild(pageButton);
}

// Add event listeners to edit and delete buttons
function addActionButtonListeners() {
  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
      const recordId = button.getAttribute('data-id');
      window.location.href = `attendance-edit.html?id=${recordId}`;
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const recordId = button.getAttribute('data-id');
      
      if (confirm('Tem certeza que deseja excluir este registro?')) {
        try {
          // In a real implementation, you would call the API to delete the record
          // const response = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
          //   method: 'DELETE'
          // });
          
          // For demo purposes, just remove from our local array
          allAttendanceData = allAttendanceData.filter(record => record.id !== parseInt(recordId));
          
          showMessage('Registro excluído com sucesso');
          applyFilters(); // Re-apply filters to refresh the table
          
        } catch (error) {
          console.error('Error deleting attendance record:', error);
          showMessage('Erro ao excluir o registro', true);
        }
      }
    });
  });
}

// Function to update sidebar clocks
function updateSidebarClocks() {
    // Get current date in different time zones
    const nowUTC = new Date();
    
    // Portugal (Europe/Lisbon)
    const portugalOptions = { timeZone: 'Europe/Lisbon' };
    const portugalDate = new Date(nowUTC.toLocaleString('en-US', portugalOptions));
    
    // Brazil (America/Sao_Paulo)
    const brazilOptions = { timeZone: 'America/Sao_Paulo' };
    const brazilDate = new Date(nowUTC.toLocaleString('en-US', brazilOptions));
    
    // Update Portugal time display in sidebar
    if(document.getElementById('portugal-time-sidebar')) {
        document.getElementById('portugal-time-sidebar').textContent = portugalDate.toLocaleTimeString('pt-PT', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // Update Brazil time display in sidebar
    if(document.getElementById('brazil-time-sidebar')) {
        document.getElementById('brazil-time-sidebar').textContent = brazilDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // Update every second
    setTimeout(updateSidebarClocks, 1000);
}

// Initialize the clock when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start the clocks
    updateSidebarClocks();
    
    // ...existing code...
});

// Export functions for use in other modules
export {
  fetchAllAttendanceData,
  applyFilters
};
