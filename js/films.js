// Initialize data from localStorage or use default
let films = JSON.parse(localStorage.getItem('films')) || [
  { id: 1, title: "Inception", genre: "Sci-Fi", duration: 148, releaseDate: "2010-07-16" },
  { id: 2, title: "The Godfather", genre: "Drama", duration: 175, releaseDate: "1972-03-24" },
  { id: 3, title: "Pulp Fiction", genre: "Crime", duration: 154, releaseDate: "1994-10-14" },
  { id: 4, title: "The Dark Knight", genre: "Action", duration: 152, releaseDate: "2008-07-18" },
  { id: 5, title: "Interstellar", genre: "Sci-Fi", duration: 169, releaseDate: "2014-11-07" },
  { id: 6, title: "Fight Club", genre: "Drama", duration: 139, releaseDate: "1999-10-15" },
  { id: 7, title: "Forrest Gump", genre: "Drama", duration: 142, releaseDate: "1994-07-06" }
];

let currentPage = 1;
const itemsPerPage = 5;
let filteredFilms = [...films];
let editingId = null;

// Render films table
function renderFilms() {
  const tbody = document.getElementById('filmsBody');
  tbody.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedFilms = filteredFilms.slice(start, end);

  paginatedFilms.forEach(film => {
    tbody.innerHTML += `
      <tr>
        <td>${film.id}</td>
        <td><strong>${film.title}</strong></td>
        <td>${film.genre}</td>
        <td>${film.duration} min</td>
        <td>${film.releaseDate}</td>
        <td>
          <button onclick="editFilm(${film.id})" class="action-btn btn-edit">✏️ ${t('edit')}</button>
          <button onclick="deleteFilm(${film.id})" class="action-btn btn-delete">🗑️ ${t('delete')}</button>
        </td>
      </tr>
    `;
  });

  updatePagination();
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
  document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages}`;
  document.getElementById('paginationInfo').textContent = `${filteredFilms.length} ${t('films')}`;
  
  document.getElementById('prevBtn').disabled = currentPage === 1;
  document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredFilms = films.filter(film => 
    film.title.toLowerCase().includes(searchTerm) ||
    film.genre.toLowerCase().includes(searchTerm) ||
    film.duration.toString().includes(searchTerm) ||
    film.releaseDate.includes(searchTerm)
  );
  currentPage = 1;
  renderFilms();
});

// Pagination functions
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderFilms();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderFilms();
  }
}

// Open add modal
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = t('add') + ' ' + t('film');
  document.getElementById('filmForm').reset();
  document.getElementById('modal').classList.add('active');
}

// Edit film
function editFilm(id) {
  editingId = id;
  const film = films.find(f => f.id === id);
  
  document.getElementById('modalTitle').textContent = t('edit') + ' ' + t('film');
  document.getElementById('title').value = film.title;
  document.getElementById('genre').value = film.genre;
  document.getElementById('duration').value = film.duration;
  document.getElementById('releaseDate').value = film.releaseDate;
  
  document.getElementById('modal').classList.add('active');
}

// Delete film
function deleteFilm(id) {
  if (confirm(t('confirmDelete'))) {
    films = films.filter(f => f.id !== id);
    localStorage.setItem('films', JSON.stringify(films));
    filteredFilms = [...films];
    
    // Adjust current page if needed
    const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      currentPage--;
    }
    
    renderFilms();
    alert(t('deleteSuccess'));
  }
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingId = null;
}

// Form submit
document.getElementById('filmForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('title').value,
    genre: document.getElementById('genre').value,
    duration: parseInt(document.getElementById('duration').value),
    releaseDate: document.getElementById('releaseDate').value
  };
  
  if (editingId) {
    // Update existing film
    const index = films.findIndex(f => f.id === editingId);
    films[index] = { ...films[index], ...formData };
    alert(t('updateSuccess'));
  } else {
    // Add new film
    const maxId = films.length > 0 ? Math.max(...films.map(f => f.id)) : 0;
    films.push({ id: maxId + 1, ...formData });
    alert(t('addSuccess'));
  }
  
  localStorage.setItem('films', JSON.stringify(films));
  filteredFilms = [...films];
  renderFilms();
  closeModal();
});

// Export to CSV
function exportCSV() {
  const headers = ['ID', t('title'), t('genre'), t('duration'), t('releaseDate')];
  const rows = films.map(f => [f.id, f.title, f.genre, f.duration, f.releaseDate]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `films_${new Date().toISOString().split('T')[0]}.csv`;
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
  renderFilms();
});