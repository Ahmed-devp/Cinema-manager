// Translations
const translations = {
  fr: {
    // Login
    loginSubtitle: "Connexion au système",
    usernameLabel: "Nom d'utilisateur",
    passwordLabel: "Mot de passe",
    loginBtn: "Se connecter",
    
    // Navigation
    dashboard: "Tableau de bord",
    films: "Films",
    rooms: "Salles",
    sessions: "Séances",
    clients: "Clients",
    reservations: "Réservations",
    logout: "Déconnexion",
    
    // Stats
    totalFilms: "Total Films",
    totalRooms: "Total Salles",
    totalClients: "Total Clients",
    totalReservations: "Total Réservations",
    
    // Actions
    add: "Ajouter",
    edit: "Modifier",
    delete: "Supprimer",
    search: "Rechercher...",
    export: "Exporter",
    actions: "Actions",
    cancel: "Annuler",
    save: "Enregistrer",
    
    // Fields
    title: "Titre",
    genre: "Genre",
    duration: "Durée (minutes)",
    releaseDate: "Date de sortie",
    roomNumber: "Numéro de salle",
    capacity: "Capacité",
    name: "Nom",
    email: "Email",
    session: "Séance",
    seats: "Places",
    date: "Date",
    time: "Heure",
    room: "Salle",
    film: "Film",
    client: "Client",
    
    // Charts
    filmsDuration: "Durée des films",
    genreDistribution: "Distribution des genres",
    roomOccupancy: "Occupation des salles",
    monthlyReservations: "Réservations mensuelles",
    topFilms: "Films populaires",
    
    // Messages
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément?",
    addSuccess: "Élément ajouté avec succès!",
    updateSuccess: "Élément modifié avec succès!",
    deleteSuccess: "Élément supprimé avec succès!"
  },
  
  en: {
    // Login
    loginSubtitle: "System Login",
    usernameLabel: "Username",
    passwordLabel: "Password",
    loginBtn: "Sign In",
    
    // Navigation
    dashboard: "Dashboard",
    films: "Movies",
    rooms: "Rooms",
    sessions: "Sessions",
    clients: "Clients",
    reservations: "Reservations",
    logout: "Logout",
    
    // Stats
    totalFilms: "Total Movies",
    totalRooms: "Total Rooms",
    totalClients: "Total Clients",
    totalReservations: "Total Reservations",
    
    // Actions
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    search: "Search...",
    export: "Export",
    actions: "Actions",
    cancel: "Cancel",
    save: "Save",
    
    // Fields
    title: "Title",
    genre: "Genre",
    duration: "Duration (minutes)",
    releaseDate: "Release Date",
    roomNumber: "Room Number",
    capacity: "Capacity",
    name: "Name",
    email: "Email",
    session: "Session",
    seats: "Seats",
    date: "Date",
    time: "Time",
    room: "Room",
    film: "Movie",
    client: "Client",
    
    // Charts
    filmsDuration: "Movies Duration",
    genreDistribution: "Genre Distribution",
    roomOccupancy: "Room Occupancy",
    monthlyReservations: "Monthly Reservations",
    topFilms: "Popular Movies",
    
    // Messages
    confirmDelete: "Are you sure you want to delete this item?",
    addSuccess: "Item added successfully!",
    updateSuccess: "Item updated successfully!",
    deleteSuccess: "Item deleted successfully!"
  },
  
  ar: {
    // Login
    loginSubtitle: "تسجيل الدخول إلى النظام",
    usernameLabel: "اسم المستخدم",
    passwordLabel: "كلمة المرور",
    loginBtn: "دخول",
    
    // Navigation
    dashboard: "لوحة التحكم",
    films: "الأفلام",
    rooms: "القاعات",
    sessions: "الجلسات",
    clients: "العملاء",
    reservations: "الحجوزات",
    logout: "خروج",
    
    // Stats
    totalFilms: "إجمالي الأفلام",
    totalRooms: "إجمالي القاعات",
    totalClients: "إجمالي العملاء",
    totalReservations: "إجمالي الحجوزات",
    
    // Actions
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    search: "بحث...",
    export: "تصدير",
    actions: "الإجراءات",
    cancel: "إلغاء",
    save: "حفظ",
    
    // Fields
    title: "العنوان",
    genre: "النوع",
    duration: "المدة (دقائق)",
    releaseDate: "تاريخ الإصدار",
    roomNumber: "رقم القاعة",
    capacity: "السعة",
    name: "الاسم",
    email: "البريد الإلكتروني",
    session: "الجلسة",
    seats: "المقاعد",
    date: "التاريخ",
    time: "الوقت",
    room: "القاعة",
    film: "الفيلم",
    client: "العميل",
    
    // Charts
    filmsDuration: "مدة الأفلام",
    genreDistribution: "توزيع الأنواع",
    roomOccupancy: "إشغال القاعات",
    monthlyReservations: "الحجوزات الشهرية",
    topFilms: "الأفلام الشائعة",
    
    // Messages
    confirmDelete: "هل أنت متأكد من حذف هذا العنصر؟",
    addSuccess: "تمت الإضافة بنجاح!",
    updateSuccess: "تم التعديل بنجاح!",
    deleteSuccess: "تم الحذف بنجاح!"
  }
};

// Get current language from localStorage or default to 'fr'
let currentLang = localStorage.getItem('lang') || 'fr';

// Change language function
function changeLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Set RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      element.placeholder = translations[lang][key];
    }
  });
  
  // Update active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang || btn.getAttribute('onclick')?.includes(lang)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Translate function to get translation for a key
function t(key) {
  return translations[currentLang][key] || key;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  changeLang(currentLang);
});