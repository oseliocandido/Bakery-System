document.addEventListener('DOMContentLoaded', function() {
  // Department performance chart
  const departmentCtx = document.getElementById('departmentChart').getContext('2d');
  const departmentChart = new Chart(departmentCtx, {
    type: 'bar',
    data: {
      labels: ['Atendimento', 'Caixa', 'Padaria', 'Confeitaria', 'Limpeza'],
      datasets: [{
        label: 'Desempenho (%)',
        data: [87, 92, 78, 85, 89],
        backgroundColor: [
          'rgba(74, 144, 226, 0.7)',
          'rgba(74, 144, 226, 0.7)',
          'rgba(74, 144, 226, 0.7)',
          'rgba(74, 144, 226, 0.7)',
          'rgba(74, 144, 226, 0.7)'
        ],
        borderColor: [
          'rgba(74, 144, 226, 1)',
          'rgba(74, 144, 226, 1)',
          'rgba(74, 144, 226, 1)',
          'rgba(74, 144, 226, 1)',
          'rgba(74, 144, 226, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Performance trend chart
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  const trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Produtividade',
        data: [82, 80, 81, 84, 85, 87],
        borderColor: 'rgba(74, 144, 226, 1)',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          min: 70,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });

  // Period selection for department chart
  document.getElementById('period-select').addEventListener('change', function(e) {
    let newData;
    switch(e.target.value) {
      case 'month':
        newData = [87, 92, 78, 85, 89];
        break;
      case 'quarter':
        newData = [85, 90, 82, 83, 88];
        break;
      case 'year':
        newData = [83, 89, 80, 81, 85];
        break;
    }
    
    departmentChart.data.datasets[0].data = newData;
    departmentChart.update();
  });

  // Toggle between different metrics in trend chart
  const chartToggles = document.querySelectorAll('.chart-toggle');
  chartToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      // Update active state
      chartToggles.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update chart data based on selected view
      let newData, newLabel;
      switch(this.dataset.view) {
        case 'productivity':
          newData = [82, 80, 81, 84, 85, 87];
          newLabel = 'Produtividade';
          break;
        case 'attendance':
          newData = [90, 91, 89, 92, 93, 92];
          newLabel = 'Frequência';
          break;
        case 'evaluations':
          newData = [4.0, 4.1, 4.0, 4.2, 4.3, 4.2];
          newLabel = 'Avaliações';
          break;
      }
      
      trendChart.data.datasets[0].data = newData;
      trendChart.data.datasets[0].label = newLabel;
      
      // Update scale for evaluations (1-5) vs percentage metrics
      if (this.dataset.view === 'evaluations') {
        trendChart.options.scales.y.min = 3.5;
        trendChart.options.scales.y.max = 5;
        trendChart.options.scales.y.ticks.callback = function(value) {
          return value;
        };
      } else {
        trendChart.options.scales.y.min = 70;
        trendChart.options.scales.y.max = 100;
        trendChart.options.scales.y.ticks.callback = function(value) {
          return value + '%';
        };
      }
      
      trendChart.update();
    });
  });
});
