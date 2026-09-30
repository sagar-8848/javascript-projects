

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



// ==========================================
// * API LINKS and State
// ==========================================

const apiKey = API_KEY;
const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";


// ? state

const state = {
  query: "", // the search 
  genre: 0, // 0 means All, 28 means action, 35 means comedy
  page: 1, // which page are we in 
  totalPages: 1, // check if the page exists
  isLoading: false, // loading state 
}


// ==========================================
// * UTILITIES
// ==========================================

// ! debounce function 
function debounce(cb, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb()
    }, delay)
  }
}


let toastTimer;
function showToast(msg, type = "success") {
  clearTimeout(toastTimer);
  toastMsg.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

// ==========================================
// * API LAYER
// ==========================================

async function fetchTrending() {

  const res = await fetch(`${API_BASE}/trending/movie/week?api_key=${apiKey}`);

  if (!res.ok) {
    throw new Error("something went wrong, please try again!")
  }
  const data = await res.json();
  renderMovies(data)

  return data;
}

// ==========================================
// * UI CONTROLLER
// ==========================================

function renderMovies(movieData) {
  console.log(movieData)
}



// ==========================================
// * EVENT LISTENERS
// ==========================================