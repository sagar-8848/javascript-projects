// ==========================================
// * API LINKS
// ==========================================

const apiKey = API_KEY;
const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";


// ==========================================
// *  DOM ELEMENTS CACHE
// ==========================================

// HEADER
const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-btn");

// GENRE
const genreTabs = document.getElementById("genre-tabs");

// CONTENT
const sectionTitle = document.getElementById("section-title");
const resultCount = document.getElementById("result-count");
const moviesGrid = document.getElementById("movies-grid");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("empty-state");
const sentinel = document.getElementById("sentinel");

// MODAL
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalPoster = document.getElementById("modal-poster");
const modalTitle = document.getElementById("modal-title");
const modalYear = document.getElementById("modal-year");
const modalRuntime = document.getElementById("modal-runtime");
const modalRating = document.getElementById("modal-rating");
const modalGenres = document.getElementById("modal-genres");
const modalOverview = document.getElementById("modal-overview");

// TOAST
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");


