// Initialize data from localStorage or use default
let rooms = JSON.parse(localStorage.getItem('rooms')) || [
  { id: 1, number: "SAL-001", capacity: 120, type: "Standard", equipment: "3D, Dolby Digital" },
  { id: 2, number: "SAL-002", capacity: 80, type: "VIP", equipment: "Recliners, Service" },
  { id: 3, number: "SAL-003", capacity: 200, type: "IMAX", equipment: "IMAX, 4K" },
  { id: 4, number: "SAL-004", capacity: 150, type: "Standard", equipment: "Dolby Atmos" },
  { id: 5, number: "SAL-005", capacity: 60, type: "4DX", equipment: "Mouvement, Effets" }
];

let currentPage = 1;
const itemsPerPage = 5;
let filteredRooms = [...rooms];
let editingId = null;

// Render rooms table
function renderRooms() {
  const tbody = document.getElementById('roomsBody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedRooms = filteredRooms.slice(start, end);

  paginatedRooms.forEach(room => {
    tbody.innerHTML += `
      <tr>
        <td>${room.id}</td>
        <td><strong>${room.number}</strong></td>
        <td>${room.capacity} ${t('seats')}</td>
        <td><span class="badge">${room.type}</span></td>
        <td>${room.equipment || '-'}</td>
        <td>
          <button onclick="editRoom(${room.id})" class="action-btn btn-edit">✏️ ${t('edit')}</button>
          <button onclick="deleteRoom(${room.id})" class="action-btn btn-delete">🗑️ ${t('delete')}</button>
        </td>
      </tr>
    `;
  });

  updatePagination();
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  document.getElementById('paginationInfo').textContent = `${filteredRooms.length} ${t('rooms')}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredRooms = rooms.filter(room => 
    room.number.toLowerCase().includes(searchTerm) ||
    room.type.toLowerCase().includes(searchTerm) ||
    room.capacity.toString().includes(searchTerm) ||
    (room.equipment && room.equipment.toLowerCase().includes(searchTerm))
  );
  currentPage = 1;
  renderRooms();
});

// Pagination functions
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderRooms();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderRooms();
  }
}

// Open add modal
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = t('add') + ' ' + t('room');
  document.getElementById('roomForm').reset();
  document.getElementById('modal').classList.add('active');
}

// Edit room
function editRoom(id) {
  editingId = id;
  const room = rooms.find(r => r.id === id);
  
  document.getElementById('modalTitle').textContent = t('edit') + ' ' + t('room');
  document.getElementById('number').value = room.number;
  document.getElementById('capacity').value = room.capacity;
  document.getElementById('type').value = room.type;
  document.getElementById('equipment').value = room.equipment || '';
  
  document.getElementById('modal').classList.add('active');
}

// Delete room
function deleteRoom(id) {
  if (confirm(t('confirmDelete'))) {
    // Check if room has sessions
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    const roomSessions = sessions.filter(s => s.roomId === id);
    
    if (roomSessions.length > 0) {
      alert(t('roomHasSessions'));
      return;
    }
    
    rooms = rooms.filter(r => r.id !== id);
    localStorage.setItem('rooms', JSON.stringify(rooms));
    filteredRooms = [...rooms];
    
    // Adjust current page if needed
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      currentPage--;
    }
    
    renderRooms();
    alert(t('deleteSuccess'));
  }
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingId = null;
}

// Form submit
document.getElementById('roomForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    number: document.getElementById('number').value,
    capacity: parseInt(document.getElementById('capacity').value),
    type: document.getElementById('type').value,
    equipment: document.getElementById('equipment').value || null
  };
  
  if (editingId) {
    // Update existing room
    const index = rooms.findIndex(r => r.id === editingId);
    rooms[index] = { ...rooms[index], ...formData };
    alert(t('updateSuccess'));
  } else {
    // Add new room
    const maxId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) : 0;
    rooms.push({ id: maxId + 1, ...formData });
    alert(t('addSuccess'));
  }
  
  localStorage.setItem('rooms', JSON.stringify(rooms));
  filteredRooms = [...rooms];
  renderRooms();
  closeModal();
});

// Export to CSV
function exportCSV() {
  const headers = ['ID', t('roomNumber'), t('capacity'), t('type'), t('equipment')];
  const rows = rooms.map(r => [r.id, r.number, r.capacity, r.type, r.equipment || '']);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rooms_${new Date().toISOString().split('T')[0]}.csv`;
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
  renderRooms();
});