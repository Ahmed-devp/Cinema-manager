// Initialize data from localStorage or use default
let sessions = JSON.parse(localStorage.getItem('sessions')) || [
  { id: 1, filmId: 1, roomId: 1, date: "2024-01-15", time: "18:30", price: 12.50 },
  { id: 2, filmId: 2, roomId: 2, date: "2024-01-15", time: "21:00", price: 15.00 },
  { id: 3, filmId: 3, roomId: 3, date: "2024-01-16", time: "19:00", price: 10.00 },
  { id: 4, filmId: 4, roomId: 1, date: "2024-01-16", time: "21:30", price: 12.00 },
  { id: 5, filmId: 5, roomId: 2, date: "2024-01-17", time: "17:00", price: 14.50 },
  { id: 6, filmId: 6, roomId: 3, date: "2024-01-17", time: "20:00", price: 11.00 },
  { id: 7, filmId: 7, roomId: 1, date: "2024-01-18", time: "18:00", price: 9.50 }
];

let films = JSON.parse(localStorage.getItem('films')) || [];
let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

let currentPage = 1;
const itemsPerPage = 5;
let filteredSessions = [...sessions];
let editingId = null;

// Helper functions
function getFilmTitle(filmId) {
  const film = films.find(f => f.id === filmId);
  return film ? film.title : 'Film inconnu';
}

function getRoomNumber(roomId) {
  const room = rooms.find(r => r.id === roomId);
  return room ? room.number : 'Salle inconnue';
}

function getRoomCapacity(roomId) {
  const room = rooms.find(r => r.id === roomId);
  return room ? room.capacity : 0;
}

function getAvailableSeats(sessionId) {
  const sessionReservations = reservations.filter(r => r.sessionId === sessionId);
  const reservedSeats = sessionReservations.reduce((total, r) => total + r.seats, 0);
  const session = sessions.find(s => s.id === sessionId);
  const roomCapacity = getRoomCapacity(session.roomId);
  return roomCapacity - reservedSeats;
}

// Render sessions table
function renderSessions() {
  const tbody = document.getElementById('sessionsBody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(start, end);

  paginatedSessions.forEach(session => {
    const availableSeats = getAvailableSeats(session.id);
    const totalSeats = getRoomCapacity(session.roomId);
    const percentage = Math.round((availableSeats / totalSeats) * 100);
    
    tbody.innerHTML += `
      <tr>
        <td>${session.id}</td>
        <td><strong>${getFilmTitle(session.filmId)}</strong></td>
        <td>${getRoomNumber(session.roomId)}</td>
        <td>${session.date}</td>
        <td>${session.time}</td>
        <td>${session.price.toFixed(2)} €</td>
        <td>
          <div class="seats-info">
            <span class="seats-count">${availableSeats} / ${totalSeats}</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        </td>
        <td>
          <button onclick="editSession(${session.id})" class="action-btn btn-edit">✏️ ${t('edit')}</button>
          <button onclick="deleteSession(${session.id})" class="action-btn btn-delete">🗑️ ${t('delete')}</button>
        </td>
      </tr>
    `;
  });

  updatePagination();
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  document.getElementById('paginationInfo').textContent = `${filteredSessions.length} ${t('sessions')}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Populate dropdowns
function populateDropdowns() {
  const filmSelect = document.getElementById('filmId');
  const roomSelect = document.getElementById('roomId');
  
  filmSelect.innerHTML = '<option value="">Sélectionner un film...</option>';
  roomSelect.innerHTML = '<option value="">Sélectionner une salle...</option>';
  
  films.forEach(film => {
    filmSelect.innerHTML += `<option value="${film.id}">${film.title}</option>`;
  });
  
  rooms.forEach(room => {
    roomSelect.innerHTML += `<option value="${room.id}">${room.number} (${room.capacity} places)</option>`;
  });
}

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredSessions = sessions.filter(session => {
    const filmTitle = getFilmTitle(session.filmId).toLowerCase();
    const roomNumber = getRoomNumber(session.roomId).toLowerCase();
    
    return (
      filmTitle.includes(searchTerm) ||
      roomNumber.includes(searchTerm) ||
      session.date.includes(searchTerm) ||
      session.time.includes(searchTerm) ||
      session.price.toString().includes(searchTerm)
    );
  });
  currentPage = 1;
  renderSessions();
});

// Pagination functions
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderSessions();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderSessions();
  }
}

// Open add modal
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = t('add') + ' ' + t('session');
  document.getElementById('sessionForm').reset();
  document.getElementById('modal').classList.add('active');
}

// Edit session
function editSession(id) {
  editingId = id;
  const session = sessions.find(s => s.id === id);
  
  document.getElementById('modalTitle').textContent = t('edit') + ' ' + t('session');
  document.getElementById('filmId').value = session.filmId;
  document.getElementById('roomId').value = session.roomId;
  document.getElementById('date').value = session.date;
  document.getElementById('time').value = session.time;
  document.getElementById('price').value = session.price;
  
  document.getElementById('modal').classList.add('active');
}

// Delete session
function deleteSession(id) {
  if (confirm(t('confirmDelete'))) {
    // Check if session has reservations
    const sessionReservations = reservations.filter(r => r.sessionId === id);
    
    if (sessionReservations.length > 0) {
      alert(t('sessionHasReservations'));
      return;
    }
    
    sessions = sessions.filter(s => s.id !== id);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    filteredSessions = [...sessions];
    
    // Adjust current page if needed
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      currentPage--;
    }
    
    renderSessions();
    alert(t('deleteSuccess'));
  }
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingId = null;
}

// Form submit
document.getElementById('sessionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    filmId: parseInt(document.getElementById('filmId').value),
    roomId: parseInt(document.getElementById('roomId').value),
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    price: parseFloat(document.getElementById('price').value)
  };
  
  // Check for conflicts
  const conflictingSession = sessions.find(s => 
    s.id !== editingId &&
    s.roomId === formData.roomId &&
    s.date === formData.date &&
    s.time === formData.time
  );
  
  if (conflictingSession) {
    alert(t('roomConflict'));
    return;
  }
  
  if (editingId) {
    // Update existing session
    const index = sessions.findIndex(s => s.id === editingId);
    sessions[index] = { ...sessions[index], ...formData };
    alert(t('updateSuccess'));
  } else {
    // Add new session
    const maxId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) : 0;
    sessions.push({ id: maxId + 1, ...formData });
    alert(t('addSuccess'));
  }
  
  localStorage.setItem('sessions', JSON.stringify(sessions));
  filteredSessions = [...sessions];
  renderSessions();
  closeModal();
});

// Export to CSV
function exportCSV() {
  const headers = ['ID', t('film'), t('room'), t('date'), t('time'), t('price'), t('availableSeats')];
  const rows = sessions.map(s => {
    const availableSeats = getAvailableSeats(s.id);
    const totalSeats = getRoomCapacity(s.roomId);
    return [s.id, getFilmTitle(s.filmId), getRoomNumber(s.roomId), s.date, s.time, s.price.toFixed(2), `${availableSeats}/${totalSeats}`];
  });
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sessions_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

// Export to PDF (demo)
function exportPDF() {
  alert('Export PDF - Fonctionnalité de démonstration\nPour une vraie implémentation, utilisez jsPDF ou html2pdf.js');
}

// Close modal when clicking outside
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') {
    closeModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();
  renderSessions();
});