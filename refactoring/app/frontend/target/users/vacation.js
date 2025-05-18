document.addEventListener('DOMContentLoaded', function() {
  // Initialize date picker for vacation request
  const dateRangePicker = flatpickr('#vacation-dates', {
    mode: 'range',
    dateFormat: 'd/m/Y',
    minDate: 'today',
    locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        longhand: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      },
      months: {
        shorthand: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        longhand: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      }
    },
    onChange: function(selectedDates, dateStr) {
      if (selectedDates.length === 2) {
        // Calculate days difference
        const startDate = selectedDates[0];
        const endDate = selectedDates[1];
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Update UI with days requested and remaining
        document.getElementById('days-requested').textContent = diffDays + ' dias';
        
        const currentBalance = 30; // This would come from the server
        const remaining = currentBalance - diffDays;
        document.getElementById('days-remaining').textContent = remaining + ' dias';
      }
    }
  });
  
  // Initialize vacation calendar
  const calendarEl = document.getElementById('vacation-calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    locale: 'pt-br',
    events: [
      {
        title: 'Ana Luiza - Férias',
        start: '2023-02-20',
        end: '2023-03-11',
        color: '#1e88e5'
      },
      {
        title: 'Roberto Alves - Férias',
        start: '2023-02-25',
        end: '2023-03-06',
        color: '#1e88e5'
      },
      {
        title: 'Carla Sousa - Férias',
        start: '2023-03-01',
        end: '2023-03-16',
        color: '#1e88e5'
      },
      {
        title: 'João Silva - Férias (Pendente)',
        start: '2023-03-15',
        end: '2023-03-31',
        color: '#ffa000'
      },
      {
        title: 'Maria Oliveira - Férias (Pendente)',
        start: '2023-04-10',
        end: '2023-04-21',
        color: '#ffa000'
      }
    ],
    eventDidMount: function(info) {
      // Add tooltips
      const tooltip = document.createElement('div');
      tooltip.className = 'calendar-tooltip';
      tooltip.innerHTML = `
        <div class="tooltip-title">${info.event.title}</div>
        <div class="tooltip-dates">${formatDateRange(info.event.start, info.event.end)}</div>
      `;
      document.body.appendChild(tooltip);
      
      info.el.addEventListener('mouseover', function() {
        const rect = info.el.getBoundingClientRect();
        tooltip.style.display = 'block';
        tooltip.style.top = rect.bottom + 'px';
        tooltip.style.left = rect.left + 'px';
      });
      
      info.el.addEventListener('mouseout', function() {
        tooltip.style.display = 'none';
      });
    }
  });
  
  calendar.render();
  
  // Handle calendar view toggle
  document.querySelectorAll('.view-toggle').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      if (this.dataset.view === 'month') {
        calendar.changeView('dayGridMonth');
      } else if (this.dataset.view === 'list') {
        calendar.changeView('listMonth');
      }
    });
  });
  
  // Handle vacation form submission
  document.getElementById('vacation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Here you would send the data to the server
    // For this example, just show a success message
    alert('Solicitação de férias enviada com sucesso!');
    
    // Reset form
    this.reset();
    dateRangePicker.clear();
    document.getElementById('days-requested').textContent = '0 dias';
    document.getElementById('days-remaining').textContent = '30 dias';
  });
  
  // Handle details button in vacation requests table
  document.querySelectorAll('.details-btn').forEach(button => {
    button.addEventListener('click', function() {
      document.getElementById('request-details-modal').style.display = 'flex';
    });
  });
  
  // Close modal when clicking on close button or outside the modal
  document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('request-details-modal').style.display = 'none';
  });
  
  document.getElementById('request-details-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
  
  // Approval and rejection buttons in the modal
  document.querySelectorAll('.modal-footer .btn').forEach(button => {
    button.addEventListener('click', function() {
      const action = this.dataset.action;
      const message = action === 'approve' ? 'Solicitação aprovada com sucesso!' : 'Solicitação rejeitada!';
      alert(message);
      document.getElementById('request-details-modal').style.display = 'none';
    });
  });
  
  // Helper function to format date range
  function formatDateRange(start, end) {
    if (!end) return formatDate(start);
    
    const startDate = formatDate(start);
    const endDate = formatDate(new Date(end.getTime() - 86400000)); // Subtract one day
    
    return `${startDate} - ${endDate}`;
  }
  
  function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }
});
