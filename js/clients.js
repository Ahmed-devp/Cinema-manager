// Initialize data from localStorage or use default
let clients = JSON.parse(localStorage.getItem('clients')) || [
  { id: 1, firstName: "Jean", lastName: "Dupont", email: "jean.dupont@email.com", phone: "0123456789", birthDate: "1985-05-15", registrationDate: "2024-01-01" },
  { id: 2, firstName: "Marie", lastName: "Martin", email: "marie.martin@email.com", phone: "0234567890", birthDate: "1990-08-22", registrationDate: "2024-01-02" },
  { id: 3, firstName: "Pierre", lastName: "Dubois", email: "pierre.dubois@email.com", phone: "0345678901", birthDate: "1982-11-30", registrationDate: "2024-01-03" },
  { id: 4, firstName: "Sophie", lastName: "Leroy", email: "sophie.leroy@email.com", phone: "0456789012", birthDate: "1995-03-18", registrationDate: "2024-01-04" },
  { id: 5, firstName: "Thomas", lastName: "Moreau", email: "thomas.moreau@email.com", phone: "0567890123", birthDate: "1988-07-25", registrationDate: "2024-01-05" },
  { id: 6, firstName: "Julie", lastName: "Simon", email: "julie.simon@email.com", phone: "0678901234", birthDate: "1992-12-10", registrationDate: "2024-01-06" },
  { id: 7, firstName: "David", lastName: "Bernard", email: "david.bernard@email.com", phone: "0789012345", birthDate: "1980-09-05", registrationDate: "2024-01-07" }
];

let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

let currentPage = 1;
const itemsPerPage = 5;
let filteredClients = [...clients];
let editingId = null;

// Helper function to get reservation count
function getReservationCount(clientId) {
  return reservations.filter(r => r.clientId === clientId).length;
}

// Helper function to get full name
function getFullName(client) {
  return `${client.firstName} ${client.lastName}`;
}

// Helper function to calculate age
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Render clients table
function renderClients() {
  const tbody = document.getElementById('clientsBody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedClients = filteredClients.slice(start, end);

  paginatedClients.forEach(client => {
    const reservationCount = getReservationCount(client.id);
    const age = calculateAge(client.birthDate);
    
    tbody.innerHTML += `
      <tr>
        <td>${client.id}</td>
        <td><strong>${getFullName(client)}</strong><br><small>${age} ans</small></td>
        <td>${client.email}</td>
        <td>${client.phone}</td>
        <td>${client.birthDate}</td>
        <td>${client.registrationDate}</td>
        <td>
          <span class="badge ${reservationCount > 0 ? 'badge-success' : ''}">
            ${reservationCount} ${t('reservations')}
          </span>
        </td>
        <td>
          <button onclick="editClient(${client.id})" class="action-btn btn-edit">✏️ ${t('edit')}</button>
          <button onclick="deleteClient(${client.id})" class="action-btn btn-delete">🗑️ ${t('delete')}</button>
        </td>
      </tr>
    `;
  });

  updatePagination();
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  document.getElementById('paginationInfo').textContent = `${filteredClients.length} ${t('clients')}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredClients = clients.filter(client => 
    client.firstName.toLowerCase().includes(searchTerm) ||
    client.lastName.toLowerCase().includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm) ||
    client.phone.includes(searchTerm) ||
    client.birthDate.includes(searchTerm) ||
    client.registrationDate.includes(searchTerm)
  );
  currentPage = 1;
  renderClients();
});

// Pagination functions
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderClients();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderClients();
  }
}

// Open add modal
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = t('add') + ' ' + t('client');
  document.getElementById('clientForm').reset();
  document.getElementById('modal').classList.add('active');
}

// Edit client
function editClient(id) {
  editingId = id;
  const client = clients.find(c => c.id === id);
  
  document.getElementById('modalTitle').textContent = t('edit') + ' ' + t('client');
  document.getElementById('firstName').value = client.firstName;
  document.getElementById('lastName').value = client.lastName;
  document.getElementById('email').value = client.email;
  document.getElementById('phone').value = client.phone;
  document.getElementById('birthDate').value = client.birthDate;
  
  document.getElementById('modal').classList.add('active');
}

// Delete client
function deleteClient(id) {
  if (confirm(t('confirmDelete'))) {
    // Check if client has reservations
    const clientReservations = reservations.filter(r => r.clientId === id);
    
    if (clientReservations.length > 0) {
      alert(t('clientHasReservations'));
      return;
    }
    
    clients = clients.filter(c => c.id !== id);
    localStorage.setItem('clients', JSON.stringify(clients));
    filteredClients = [...clients];
    
    // Adjust current page if needed
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      currentPage--;
    }
    
    renderClients();
    alert(t('deleteSuccess'));
  }
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingId = null;
}

// Form submit
document.getElementById('clientForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    birthDate: document.getElementById('birthDate').value,
    registrationDate: new Date().toISOString().split('T')[0]
  };
  
  // Validate email
  const existingClient = clients.find(c => 
    c.id !== editingId && c.email === formData.email
  );
  
  if (existingClient) {
    alert(t('emailExists'));
    return;
  }
  
  if (editingId) {
    // Update existing client
    const index = clients.findIndex(c => c.id === editingId);
    // Keep original registration date
    formData.registrationDate = clients[index].registrationDate;
    clients[index] = { ...clients[index], ...formData };
    alert(t('updateSuccess'));
  } else {
    // Add new client
    const maxId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;
    clients.push({ id: maxId + 1, ...formData });
    alert(t('addSuccess'));
  }
  
  localStorage.setItem('clients', JSON.stringify(clients));
  filteredClients = [...clients];
  renderClients();
  closeModal();
});

// Export to CSV
function exportCSV() {
  const headers = ['ID', t('firstName'), t('lastName'), t('email'), t('phone'), t('birthDate'), t('registrationDate'), t('reservations')];
  const rows = clients.map(c => [
    c.id, 
    c.firstName, 
    c.lastName, 
    c.email, 
    c.phone, 
    c.birthDate, 
    c.registrationDate, 
    getReservationCount(c.id)
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
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
  renderClients();
});