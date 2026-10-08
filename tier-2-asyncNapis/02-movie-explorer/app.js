
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

// * Abort Controller

let abortController;


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

// ? fetchTrending

async function fetchTrending() {

  const res = await fetch(`${API_BASE}/trending/movie/week?api_key=${apiKey}&page=${state.page}`);

  if (!res.ok) {
    throw new Error("something went wrong, please try again!")
  }
  const data = await res.json();

  return data;
}

// ? function fetchSearch

async function fetchSearch(query, page, signal) {
  const res = await fetch(`${API_BASE}/search/movie?api_key=${apiKey}&query=${query}&page=${page}`, { signal });
  if (!res.ok) throw new Error("something went wrong!");
  const data = await res.json();
  return data;
}

// ? Event Listener in the Search

searchInput.addEventListener("input", debounce(() => {

  if (abortController) abortController.abort();
  abortController = new AbortController()
  const searchedValue = searchInput.value.trim();

  // 1. NEW LOGIC: If search is empty, go back to Trending!
  if (searchedValue === "") {
    state.query = "";
    state.page = 1;
    state.genre = 0;
    localStorage.removeItem("lastSearch"); // Clear saved search
    sectionTitle.textContent = "🔥 Trending Now"; // Reset title

    // Reset the UI to "All" tab
    const allTabs = document.querySelectorAll('.genre-tab');
    allTabs.forEach((tab) => tab.classList.remove("active"));
    document.querySelector('[data-id="0"]').classList.add("active");

    // Fetch Trending movies
    showSkeletons(12);
    fetchTrending().then(data => renderMovies(data, false));
    return; // Stop here so it doesn't continue to the search code
  }

  // 2. Normal Search Logic
  state.query = searchedValue;
  localStorage.setItem("lastSearch", searchedValue)
  state.page = 1;
  state.genre = 0;

  // Update UI
  const allTabs = document.querySelectorAll('.genre-tab');
  allTabs.forEach((curItem) => curItem.classList.remove("active"))
  document.querySelector('[data-id="0"]').classList.add("active");
  sectionTitle.textContent = `🔍 Results for "${searchedValue}"`;

  showSkeletons(12)
  fetchSearch(searchedValue, state.page, abortController.signal)
    .then((data) => renderMovies(data, false))
    .catch(err => {
      if (err.name !== "AbortError") {
        showToast(err.message, "error")
      }
    })
}, 500))



// ? function fetch movie details

async function fetchMovieDetails(movieId) {
  const res = await fetch(`${API_BASE}/movie/${movieId}?api_key=${apiKey}`);
  if (!res.ok) throw new Error("failed to fetch the movie, try again later!")
  const data = await res.json();
  return data;
}

// ? function to get the genres
async function fetchGenres() {
  const res = await fetch(`${API_BASE}/genre/movie/list?api_key=${apiKey}`);
  if (!res.ok) throw new Error("Failed to fetch the movie!")
  const data = await res.json();
  return data;
}


// ? render the genres

function renderGenres(data) {
  data.genres.forEach((curGenre) => {
    const genreBtn = document.createElement("button");
    genreBtn.classList.add("genre-tab");
    genreBtn.textContent = curGenre.name;
    genreBtn.setAttribute("data-id", curGenre.id);
    genreTabs.appendChild(genreBtn)
  })
}

// ? fetch movie by genre filter

async function fetchMovieByGenre(genreId, page) {
  const res = await fetch(`${API_BASE}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`);
  if (!res.ok) throw new Error("failed to fetch the movies, please try again after sometimes!");

  const data = await res.json();
  return data;
}

// ==========================================
// * UI CONTROLLER
// ==========================================

function renderMovies(movieData, append = true) {
  if (!append) {
    moviesGrid.innerHTML = "";
  }

  // 1. CHECK FOR NO MOVIES FOUND!
  if (movieData.results.length === 0) {
    emptyState.classList.remove("hidden"); // Show the "No movies found" UI
    moviesGrid.innerHTML = ""; // Clear the grid
    showToast("No movies found! Try another search.", "error"); // Pop up the toast!
    return; // Stop the function so it doesn't try to loop through nothing
  }

  // 2. If we have movies, hide the empty state just in case
  emptyState.classList.add("hidden");

  state.totalPages = movieData.total_pages;

  resultCount.textContent = `${movieData.total_results} results`;
  movieData.results.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    movieCard.addEventListener("click", () => {
      fetchMovieDetails(movie.id).then((data) => {
        showModal(data)
      })
    })

    const movieBody = document.createElement("div")
    movieBody.classList.add("movie-card__body")


    // If the movie HAS a poster, create the image
    if (movie.poster_path) {
      const movieImg = document.createElement("img");
      movieImg.classList.add("movie-card__poster");
      movieImg.src = `${IMG_BASE}${movie.poster_path}`;
      movieImg.alt = movie.title; // Good for accessibility!
      movieCard.appendChild(movieImg);
    } else {
      // If NO poster, show the emoji placeholder
      const placeholder = document.createElement("div");
      placeholder.classList.add("movie-card__poster--placeholder");
      placeholder.textContent = "🎬";
      movieCard.appendChild(placeholder);
    }

    const movieTitle = document.createElement("h3");
    movieTitle.classList.add("movie-card__title")
    movieTitle.textContent = movie.title;

    const meta = document.createElement("div")
    meta.classList.add("movie-card__meta")

    const year = document.createElement("span")
    year.classList.add("movie-card__year")

    year.textContent = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    meta.appendChild(year)

    const rating = document.createElement("span")
    rating.classList.add("movie-card__rating");
    rating.textContent = "⭐ " + (movie.vote_average?.toFixed(1) ?? "N/A")
    meta.appendChild(rating)



    movieBody.appendChild(movieTitle);
    movieBody.appendChild(meta);
    movieCard.appendChild(movieBody)
    moviesGrid.append(movieCard)

  })
}

// * show loading effect

function showSkeletons(count) {
  moviesGrid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeletonCard = document.createElement("div");
    skeletonCard.classList.add("skeleton");

    const poster = document.createElement("div");
    poster.classList.add("skeleton__poster")

    skeletonCard.appendChild(poster)

    const skl_body = document.createElement("div");
    skl_body.classList.add("skeleton__body");

    skeletonCard.appendChild(skl_body)

    const skl_line = document.createElement("div");
    skl_line.classList.add("skeleton__line")

    skl_body.appendChild(skl_line)

    const skl_line_short = document.createElement("div");
    skl_line_short.classList.add("skeleton__line--short");
    skl_body.appendChild(skl_line_short)

    moviesGrid.appendChild(skeletonCard)

  }
}

// * show modal when click on the specific card

function showModal(movie) {
  modalTitle.textContent = movie.title;
  modalOverview.textContent = movie.overview;
  modalBackdrop.setAttribute("src", IMG_BASE + movie.backdrop_path);
  modalPoster.setAttribute("src", IMG_BASE + movie.poster_path);
  modalYear.textContent = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
  modalRating.textContent = "⭐ " + movie.vote_average.toFixed(1);
  modalRuntime.textContent = `${movie.runtime} min`
  modalGenres.innerHTML = "";

  movie.genres.forEach((curGenre) => {
    const modalGenre = document.createElement("span");
    modalGenre.classList.add("modal__genre");
    modalGenre.textContent = curGenre.name;

    modalGenres.appendChild(modalGenre)
  })
  modalOverlay.classList.remove("hidden")

}


// ==========================================
// * EVENT LISTENERS
// ==========================================

// ? to hide the modal when clicked outside the modal 

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    hideModal();
  }
});

// ? to hide the modal when clicked in the "X" sign in the modal 
modalClose.addEventListener("click", () => {
  hideModal()
});

function hideModal() {
  modalOverlay.classList.add("hidden");
}

// ? to know which genre was clicked 
genreTabs.addEventListener("click", (e) => {
  const clickedElem = e.target;
  if (clickedElem.classList.contains('genre-tab')) {
    const genreId = e.target.getAttribute("data-id");

    // ? update the genre and page in the state
    state.genre = genreId;
    localStorage.setItem("lastGenre", genreId);
    state.page = 1;
    state.query = "";
    searchInput.value = "";

    // If "All" is clicked, fetch Trending! Otherwise, fetch by genre.
    const fetchFn = genreId === "0"
      ? fetchTrending()
      : fetchMovieByGenre(state.genre, state.page)
    fetchFn
      .then(data => renderMovies(data, false))
      .catch(err => showToast(err.message, "error"));

    const allTabs = document.querySelectorAll('.genre-tab');
    allTabs.forEach((curItem) => {
      curItem.classList.remove("active")
    })

    clickedElem.classList.add("active");

  }

})



async function init() {
  console.log("Init running!");
  state.page = 1;
  state.genre = 0; // Always start on "All" genre

  // 1. Render the genre tabs FIRST!
  const genresData = await fetchGenres();
  renderGenres(genresData);

  // 2. Check if we have a SAVED SEARCH
  const lastSearched = localStorage.getItem("lastSearch");

  if (lastSearched) {
    // Restore the search!
    state.query = lastSearched;
    searchInput.value = lastSearched;
    sectionTitle.textContent = `🔍 Results for "${lastSearched}"`;
    fetchSearch(state.query, state.page, null).then(data => renderMovies(data, false));
  } else {
    // If no saved search, load Trending!
    sectionTitle.textContent = "🔥 Trending Now";
    const data = await fetchTrending();
    renderMovies(data, false);
  }
}

init()

const intersectionObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    // 1. GUARD: If already fetching, stop! Don't fetch again.
    if (state.isLoading) return;

    // 2. GUARD: If we hit the last page, stop! No more pages.
    if (state.page >= state.totalPages) return;

    // 3. Lock the door and increment the page
    state.isLoading = true;
    state.page++;
    loading.classList.remove("hidden");

    // 4. Figure out which fetch to run
    const fetchFn = state.query
      ? fetchSearch(state.query, state.page, null)
      : state.genre != 0
        ? fetchMovieByGenre(state.genre, state.page)
        : fetchTrending();

    // 5. Fetch, render, and ALWAYS unlock the door at the end
    fetchFn
      .then(data => {
        state.totalPages = data.total_pages; // Track max pages
        renderMovies(data, true);
      })
      .catch(err => showToast(err.message, "error"))
      .finally(() => {
        state.isLoading = false; // Unlock the door!
        loading.classList.add("hidden");
      });
  }
}, { threshold: 0.1 });

intersectionObserver.observe(sentinel);
