// Load data from localStorage
const films = JSON.parse(localStorage.getItem('films')) || [];
const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
const clients = JSON.parse(localStorage.getItem('clients')) || [];
const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
const reservations = JSON.parse(localStorage.getItem('reservations')) || [];

// Update stats
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filmsCount').textContent = films.length;
  document.getElementById('roomsCount').textContent = rooms.length;
  document.getElementById('clientsCount').textContent = clients.length;
  document.getElementById('reservationsCount').textContent = reservations.length;

  // Create charts
  createFilmsChart();
  createGenreChart();
  createRoomChart();
  createMonthlyChart();
  createTopFilmsChart();
});

// Chart 1: Bar Chart - Films Duration
function createFilmsChart() {
  const ctx = document.getElementById('filmsChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: films.map(f => f.title.length > 15 ? f.title.substring(0, 15) + '...' : f.title),
      datasets: [{
        label: t('duration') + ' (min)',
        data: films.map(f => f.duration),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}

// Chart 2: Pie Chart - Genre Distribution
function createGenreChart() {
  const ctx = document.getElementById('genreChart').getContext('2d');
  
  // Count genres
  const genreCounts = {};
  films.forEach(film => {
    genreCounts[film.genre] = (genreCounts[film.genre] || 0) + 1;
  });
  
  const genres = Object.keys(genreCounts);
  const counts = Object.values(genreCounts);
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: genres,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Chart 3: Doughnut Chart - Room Occupancy
function createRoomChart() {
  const ctx = document.getElementById('roomChart').getContext('2d');
  
  // Calculate room occupancy
  const roomData = rooms.map(room => {
    const roomSessions = sessions.filter(s => s.roomId === room.id);
    const totalSeats = roomSessions.reduce((acc, session) => {
      const sessionReservations = reservations.filter(r => r.sessionId === session.id);
      return acc + sessionReservations.reduce((sum, r) => sum + r.seats, 0);
    }, 0);
    
    return {
      name: room.number,
      occupancy: totalSeats,
      capacity: room.capacity * roomSessions.length
    };
  });
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: roomData.map(r => r.name),
      datasets: [{
        label: t('seats'),
        data: roomData.map(r => r.occupancy),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Chart 4: Line Chart - Monthly Reservations
function createMonthlyChart() {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  
  const monthlyData = [
    { month: 'Jan', reservations: 45 },
    { month: 'Fév', reservations: 52 },
    { month: 'Mar', reservations: 61 },
    { month: 'Avr', reservations: 48 },
    { month: 'Mai', reservations: 70 },
    { month: 'Jun', reservations: 65 }
  ];
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyData.map(d => d.month),
      datasets: [{
        label: t('reservations'),
        data: monthlyData.map(d => d.reservations),
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}

// Chart 5: Horizontal Bar Chart - Top Films
function createTopFilmsChart() {
  const ctx = document.getElementById('topFilmsChart').getContext('2d');
  
  // Calculate popularity by reservation count
  const filmPopularity = films.map(film => {
    const filmSessions = sessions.filter(s => s.filmId === film.id);
    const totalSeats = filmSessions.reduce((acc, session) => {
      const sessionReservations = reservations.filter(r => r.sessionId === session.id);
      return acc + sessionReservations.reduce((sum, r) => sum + r.seats, 0);
    }, 0);
    
    return {
      title: film.title,
      seats: totalSeats
    };
  }).sort((a, b) => b.seats - a.seats).slice(0, 5);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: filmPopularity.map(f => f.title),
      datasets: [{
        label: t('seats'),
        data: filmPopularity.map(f => f.seats),
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}