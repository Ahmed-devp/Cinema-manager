// Initialize data from localStorage or use default
let reservations = JSON.parse(localStorage.getItem('reservations')) || [
  { id: 1, clientId: 1, sessionId: 1, seats: 2, status: "confirmed", bookingDate: "2024-01-10" },
  { id: 2, clientId: 2, sessionId: 2, seats: 1, status: "confirmed", bookingDate: "2024-01-11" },
  { id: 3, clientId: 3, sessionId: 3, seats: 4, status: "pending", bookingDate: "2024-01-12" },
  { id: 4, clientId: 4, sessionId: 4, seats: 2, status: "confirmed", bookingDate: "2024-01-12" },
  { id: 5, clientId: 5, sessionId: 5, seats: 3, status: "completed", bookingDate: "2024-01-13" },
  { id: 6, clientId: 6, sessionId: 6, seats: 2, status: "cancelled", bookingDate: "2024-01-13" },
  { id: 7, clientId: 7, sessionId: 7, seats: 5, status: "confirmed", bookingDate: "2024-01-14" }
];

let clients = JSON.parse(localStorage.getItem('clients')) || [];
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let films = JSON.parse(localStorage.getItem('films')) || [];
let rooms = JSON.parse(localStorage.getItem('rooms')) || [];

let currentPage = 1;
const itemsPerPage = 5;
let filteredReservations = [...reservations];
let editingId = null;

// Helper functions
function getClientName(clientId) {
  const client = clients.find(c => c.id === clientId);
  return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
}

function getSessionInfo(sessionId) {
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return { filmTitle: 'Inconnu', roomNumber: 'Inconnu', date: '', time: '', price: 0 };
  
  const film = films.find(f => f.id === session.filmId);
  const room = rooms.find(r => r.id === session.roomId);
  
  return {
    filmTitle: film ? film.title : 'Film inconnu',
    roomNumber: room ? room.number : 'Salle inconnue',
    date: session.date,
    time: session.time,
    price: session.price
  };
}

function getAvailableSeats(sessionId) {
  const sessionReservations = reservations.filter(r => 
    r.sessionId === sessionId && 
    r.status !== 'cancelled'
  );
  const reservedSeats = sessionReservations.reduce((total, r) => total + r.seats, 0);
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return 0;
  
  const room = rooms.find(r => r.id === session.roomId);
  const roomCapacity = room ? room.capacity : 0;
  
  return roomCapacity - reservedSeats;
}

function getStatusBadge(status) {
  const statusMap = {
    'confirmed': { text: 'Confirmée', class: 'badge-success' },
    'pending': { text: 'En attente', class: 'badge-warning' },
    'cancelled': { text: 'Annulée', class: 'badge-danger' },
    'completed': { text: 'Terminée', class: 'badge-info' }
  };
  
  const statusInfo = statusMap[status] || { text: status, class: '' };
  return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// Update stats
function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  
  const totalReservations = reservations.length;
  const totalSeats = reservations.reduce((total, r) => total + r.seats, 0);
  const totalRevenue = reservations.reduce((total, r) => {
    if (r.status === 'cancelled') return total;
    const session = sessions.find(s => s.id === r.sessionId);
    return total + (session ? session.price * r.seats : 0);
  }, 0);
  const todayReservations = reservations.filter(r => r.bookingDate === today).length;
  
  document.getElementById('totalReservations').textContent = totalReservations;
  document.getElementById('totalSeats').textContent = totalSeats;
  document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2) + ' €';
  document.getElementById('todayReservations').textContent = todayReservations;
}

// Render reservations table
function renderReservations() {
  const tbody = document.getElementById('reservationsBody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedReservations = filteredReservations.slice(start, end);

  paginatedReservations.forEach(reservation => {
    const sessionInfo = getSessionInfo(reservation.sessionId);
    const totalPrice = sessionInfo.price * reservation.seats;
    
    tbody.innerHTML += `
      <tr>
        <td>${reservation.id}</td>
        <td><strong>${getClientName(reservation.clientId)}</strong></td>
        <td>#${reservation.sessionId}</td>
        <td>${sessionInfo.filmTitle}</td>
        <td>${sessionInfo.roomNumber}</td>
        <td>${sessionInfo.date}<br><small>${sessionInfo.time}</small></td>
        <td>${reservation.seats}</td>
        <td><strong>${totalPrice.toFixed(2)} €</strong></td>
        <td>${getStatusBadge(reservation.status)}</td>
        <td>${reservation.bookingDate}</td>
        <td>
          <button onclick="editReservation(${reservation.id})" class="action-btn btn-edit">✏️ ${t('edit')}</button>
          <button onclick="deleteReservation(${reservation.id})" class="action-btn btn-delete">🗑️ ${t('delete')}</button>
        </td>
      </tr>
    `;
  });

  updateStats();
  updatePagination();
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  document.getElementById('paginationInfo').textContent = `${filteredReservations.length} ${t('reservations')}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Populate dropdowns
function populateDropdowns() {
  const clientSelect = document.getElementById('clientId');
  const sessionSelect = document.getElementById('sessionId');
  
  clientSelect.innerHTML = '<option value="">Sélectionner un client...</option>';
  sessionSelect.innerHTML = '<option value="">Sélectionner une séance...</option>';
  
  clients.forEach(client => {
    clientSelect.innerHTML += `<option value="${client.id}">${client.firstName} ${client.lastName}</option>`;
  });
  
  sessions.forEach(session => {
    const film = films.find(f => f.id === session.filmId);
    const room = rooms.find(r => r.id === session.roomId);
    const filmTitle = film ? film.title : 'Film inconnu';
    const roomNumber = room ? room.number : 'Salle inconnue';
    const availableSeats = getAvailableSeats(session.id);
    
    if (availableSeats > 0) {
      sessionSelect.innerHTML += `<option value="${session.id}" data-price="${session.price}">
        ${filmTitle} - ${session.date} ${session.time} - ${roomNumber} (${availableSeats} places dispo)
      </option>`;
    }
  });
}

// Update price and available seats
function updatePriceAndSeats() {
  const sessionId = document.getElementById('sessionId').value;
  const seats = parseInt(document.getElementById('seats').value) || 1;
  
  if (sessionId) {
    const session = sessions.find(s => s.id === parseInt(sessionId));
    const availableSeats = getAvailableSeats(parseInt(sessionId));
    
    document.getElementById('availableSeatsInfo').textContent = 
      `${t('availableSeats')}: ${availableSeats}`;
    
    // Update seats max
    document.getElementById('seats').max = availableSeats;
    
    if (seats > availableSeats) {
      document.getElementById('seats').value = availableSeats;
    }
    
    // Calculate total price
    const totalPrice = session.price * (document.getElementById('seats').value || 1);
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
  } else {
    document.getElementById('availableSeatsInfo').textContent = `${t('availableSeats')}: 0`;
    document.getElementById('totalPrice').textContent = '0.00';
  }
}

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredReservations = reservations.filter(reservation => {
    const clientName = getClientName(reservation.clientId).toLowerCase();
    const sessionInfo = getSessionInfo(reservation.sessionId);
    const filmTitle = sessionInfo.filmTitle.toLowerCase();
    const roomNumber = sessionInfo.roomNumber.toLowerCase();
    
    return (
      clientName.includes(searchTerm) ||
      filmTitle.includes(searchTerm) ||
      roomNumber.includes(searchTerm) ||
      reservation.status.toLowerCase().includes(searchTerm) ||
      reservation.bookingDate.includes(searchTerm) ||
      reservation.seats.toString().includes(searchTerm) ||
      reservation.id.toString().includes(searchTerm)
    );
  });
  currentPage = 1;
  renderReservations();
});

// Pagination functions
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderReservations();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderReservations();
  }
}

// Open add modal
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = t('add') + ' ' + t('reservation');
  document.getElementById('reservationForm').reset();
  populateDropdowns();
  updatePriceAndSeats();
  document.getElementById('modal').classList.add('active');
}

// Edit reservation
function editReservation(id) {
  editingId = id;
  const reservation = reservations.find(r => r.id === id);
  
  document.getElementById('modalTitle').textContent = t('edit') + ' ' + t('reservation');
  
  // Populate dropdowns first
  populateDropdowns();
  
  // Set values
  document.getElementById('clientId').value = reservation.clientId;
  document.getElementById('sessionId').value = reservation.sessionId;
  document.getElementById('seats').value = reservation.seats;
  document.getElementById('status').value = reservation.status;
  
  // Update price and seats info
  updatePriceAndSeats();
  
  document.getElementById('modal').classList.add('active');
}

// Delete reservation
function deleteReservation(id) {
  if (confirm(t('confirmDelete'))) {
    reservations = reservations.filter(r => r.id !== id);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    filteredReservations = [...reservations];
    
    // Adjust current page if needed
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      currentPage--;
    }
    
    renderReservations();
    alert(t('deleteSuccess'));
  }
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingId = null;
}

// Form submit


document.getElementById('reservationForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    clientId: parseInt(document.getElementById('clientId').value),
    sessionId: parseInt(document.getElementById('sessionId').value),
    seats: parseInt(document.getElementById('seats').value),
    status: document.getElementById('status').value,
    bookingDate: new Date().toISOString().split('T')[0]
  };
  
  // Validate available seats
  const availableSeats = getAvailableSeats(formData.sessionId);
  const sessionReservations = reservations.filter(r => 
    r.sessionId === formData.sessionId && 
    r.status !== 'cancelled' &&
    (!editingId || r.id !== editingId)
  );
  
  const currentlyReservedSeats = sessionReservations.reduce((total, r) => total + r.seats, 0);
  const session = sessions.find(s => s.id === formData.sessionId);
  const room = rooms.find(r => r.id === session.roomId);
  const roomCapacity = room ? room.capacity : 0;
  
  const totalAfterReservation = currentlyReservedSeats + formData.seats;
  
  if (totalAfterReservation > roomCapacity) {
    alert(t('notEnoughSeats'));
    return;
  }
  
  if (editingId) {
    // Update existing reservation
    const index = reservations.findIndex(r => r.id === editingId);
    // Keep original booking date
    formData.bookingDate = reservations[index].bookingDate;
    reservations[index] = { ...reservations[index], ...formData };
    alert(t('updateSuccess'));
  } else {
    // Add new reservation
    const maxId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) : 0;
    reservations.push({ id: maxId + 1, ...formData });
    alert(t('addSuccess'));
  }
  
  localStorage.setItem('reservations', JSON.stringify(reservations));
  filteredReservations = [...reservations];
  renderReservations();
  closeModal();
});

// Export to CSV
function exportCSV() {
  const headers = ['ID', t('client'), t('session'), t('film'), t('room'), t('date'), t('time'), t('seats'), t('price'), t('status'), t('bookingDate')];
  const rows = reservations.map(r => {
    const sessionInfo = getSessionInfo(r.sessionId);
    const totalPrice = sessionInfo.price * r.seats;
    
    return [
      r.id,
      getClientName(r.clientId),
      r.sessionId,
      sessionInfo.filmTitle,
      sessionInfo.roomNumber,
      sessionInfo.date,
      sessionInfo.time,
      r.seats,
      totalPrice.toFixed(2),
      r.status,
      r.bookingDate
    ];
  });
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

// Export to PDF (demo)
function exportPDF() {
  alert('Export PDF - Fonctionnalité de démonstration\nPour une vraie implémentation, utilisez jsPDF ou html2pdf.js');
}

// Event listeners for dynamic updates
document.getElementById('sessionId').addEventListener('change', updatePriceAndSeats);
document.getElementById('seats').addEventListener('input', updatePriceAndSeats);

// Close modal when clicking outside
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') {
    closeModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderReservations();
  updateStats();
});