// ====================
// * DOM REFERENCES
// ====================

// FORM
const form = document.getElementById("book-form");
const titleInput = document.getElementById("title-input");
const authorInput = document.getElementById("author-input");
const genreInput = document.getElementById("genre-input");
const yearInput = document.getElementById("year-input");
const statusInput = document.getElementById("status-input");
const errMsg = document.getElementById("error-msg");

// STATS
const statTotal = document.getElementById("stat-total");
const statRead = document.getElementById("stat-read");
const statReading = document.getElementById("stat-reading");
const statUnread = document.getElementById("stat-unread");

// BOOK LIST
const bookContainer = document.getElementById("books-container");
const emptyState = document.getElementById("empty-state");
const bookCount = document.getElementById("book-count");

// FILTERS
const searchFilter = document.getElementById("search-input");

// TOAST
const toastContainer = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");

// FORM BUTTONS
const addOrEditBtn = document.querySelector(".btn");
const cancelBtn = document.querySelector(".cancel-btn");


// ====================
// * CONSTANTS
// ====================

const STORAGE_KEY = "all-books-data";

const categoryIcons = {
  Fiction: "📖",
  "Non-Fiction": "📰",
  "Self Help": "🧠",
  Technology: "💻",
  Science: "🔬",
  History: "🏛️",
  Biography: "👤",
  Philosophy: "💭",
  Other: "📦",
};

const currentStatus = {
  Read: "status--read",
  Reading: "status--reading",
  Unread: "status--unread",
};


// ====================
// * DEBOUNCE
// ====================

function debounce(callback, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}


// ====================
// * CUSTOM ERRORS
// ====================

class ValidationError extends Error {
  constructor(message, field) {
    super(message);

    this.name = "ValidationError";
    this.field = field;
    this.statusCode = 400;
  }
}

class DuplicateBookError extends Error {
  constructor(title) {
    super(`Book already exists: ${title}`);

    this.name = "DuplicateBookError";
    this.statusCode = 409;
  }
}


// ====================
// * BOOK CLASS
// ====================

class Book {
  constructor(title, author, genre, year, status) {
    this.id = Date.now().toString();

    this.title = title;
    this.author = author;
    this.genre = genre;
    this.year = year;
    this.status = status;
  }

  getGenreIcon() {
    return categoryIcons[this.genre] ?? "📦";
  }

  getStatusClass() {
    return currentStatus[this.status] ?? "status--unread";
  }

  getFormattedYear() {
    return this.year ? String(this.year) : "Unknown";
  }
}


// ====================
// * APPLICATION STATE
// ====================

const state = {
  books: [],

  filters: {
    genre: "All",
    status: "All",
    search: "",
  },

  editingBookId: null,
};


// ====================
// * ERROR UI
// ====================

function showError(message) {
  errMsg.textContent = message;
  errMsg.classList.remove("hidden");
}

function clearError() {
  errMsg.textContent = "";
  errMsg.classList.add("hidden");
}


// ====================
// * FORM MODE
// ====================

function resetFormMode() {
  state.editingBookId = null;

  addOrEditBtn.textContent = "Add Book";

  cancelBtn.classList.add("hidden");

  form.reset();
}


// ====================
// * LOCAL STORAGE
// ====================

function saveToStorage() {
  const stringifiedBooks = JSON.stringify(state.books);

  localStorage.setItem(STORAGE_KEY, stringifiedBooks);
}


function loadFromStorage() {
  const storedBooks = localStorage.getItem(STORAGE_KEY);

  if (!storedBooks) {
    return;
  }

  try {
    const parsedBooks = JSON.parse(storedBooks);

    state.books = parsedBooks.map((plainBook) => {
      const book = new Book(
        plainBook.title,
        plainBook.author,
        plainBook.genre,
        plainBook.year,
        plainBook.status
      );

      book.id = plainBook.id;

      return book;
    });

  } catch (err) {
    showError("Could not load saved books.");
    console.error(err);
  }
}


// ====================
// * FILTERING
// ====================

function getFilteredBooks(allBooks) {
  const searchQuery = state.filters.search
    .toLowerCase()
    .trim();

  return allBooks.filter((book) => {
    const matchesGenre =
      state.filters.genre === "All" ||
      book.genre === state.filters.genre;

    const matchesStatus =
      state.filters.status === "All" ||
      book.status === state.filters.status;

    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery) ||
      book.author.toLowerCase().includes(searchQuery);

    return (
      matchesGenre &&
      matchesStatus &&
      matchesSearch
    );
  });
}


// ====================
// * RENDER BOOKS
// ====================

function renderBooks(books) {
  bookContainer.innerHTML = "";

  bookCount.textContent =
    `${books.length} ${books.length === 1 ? "book" : "books"}`;

  if (books.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  books.forEach((book) => {
    const card = document.createElement("div");

    card.classList.add("book-card");

    card.innerHTML = `
      <div class="book-card__header">

        <span class="book-card__icon">
          ${book.getGenreIcon()}
        </span>

        <span class="book-card__status ${book.getStatusClass()}">
          ${book.status}
        </span>

      </div>

      <div class="book-card__info">
        <h3 class="book-card__title">
          ${book.title}
        </h3>
      </div>

      <p class="book-card__author">
        ${book.author}
      </p>

      <p class="book-card__genre">
        ${book.genre}
      </p>

      <p class="book-card__year">
        ${book.getFormattedYear()}
      </p>

      <div class="book-card__actions">

        <button
          class="edit-btn"
          data-id="${book.id}"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          data-id="${book.id}"
        >
          Delete
        </button>

      </div>
    `;

    bookContainer.appendChild(card);
  });
}


// ====================
// * UPDATE STATS
// ====================

function updateStats() {
  const readCount = state.books.filter(
    (book) => book.status === "Read"
  ).length;

  const readingCount = state.books.filter(
    (book) => book.status === "Reading"
  ).length;

  const unreadCount = state.books.filter(
    (book) => book.status === "Unread"
  ).length;

  statTotal.textContent = state.books.length;
  statRead.textContent = readCount;
  statReading.textContent = readingCount;
  statUnread.textContent = unreadCount;
}


// ====================
// * REFRESH UI
// ====================

function refreshUI() {
  updateStats();

  const filteredBooks =
    getFilteredBooks(state.books);

  renderBooks(filteredBooks);
}


// ====================
// * TOAST
// ====================

let toastTimer;

function showToast(message, type = "success") {
  toastContainer.classList.remove("hidden");

  toastContainer.classList.remove(
    "success",
    "error"
  );

  toastContainer.classList.add(type);

  toastMsg.textContent = message;

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastContainer.classList.add("hidden");
  }, 2000);
}


// ====================
// * ADD BOOK
// ====================

function addBook() {
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const genre = genreInput.value;
  const year = yearInput.value;
  const status = statusInput.value;

  if (!title) {
    throw new ValidationError(
      "Title cannot be empty!",
      "title"
    );
  }

  if (!author) {
    throw new ValidationError(
      "Author can't be empty!",
      "author"
    );
  }

  if (!genre) {
    throw new ValidationError(
      "Genre can't be empty!",
      "genre"
    );
  }

  if (!year) {
    throw new ValidationError(
      "Year can't be empty!",
      "year"
    );
  }

  if (!status) {
    throw new ValidationError(
      "Status can't be empty!",
      "status"
    );
  }

  const duplicateBook = state.books.find(
    (book) =>
      book.title.toLowerCase().trim() ===
      title.toLowerCase().trim()
  );

  if (duplicateBook) {
    throw new DuplicateBookError(title);
  }

  const newBook = new Book(
    title,
    author,
    genre,
    year,
    status
  );

  state.books.push(newBook);

  showToast("Book Added!", "success");
}


// ====================
// * UPDATE BOOK
// ====================

function updateBook() {
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const genre = genreInput.value;
  const year = yearInput.value;
  const status = statusInput.value;

  if (!title) {
    throw new ValidationError(
      "Title cannot be empty!",
      "title"
    );
  }

  if (!author) {
    throw new ValidationError(
      "Author can't be empty!",
      "author"
    );
  }

  if (!genre) {
    throw new ValidationError(
      "Genre can't be empty!",
      "genre"
    );
  }

  if (!year) {
    throw new ValidationError(
      "Year can't be empty!",
      "year"
    );
  }

  if (!status) {
    throw new ValidationError(
      "Status can't be empty!",
      "status"
    );
  }

  const editedBook = state.books.find(
    (book) =>
      book.id === state.editingBookId
  );

  if (!editedBook) {
    throw new Error("Book not found.");
  }

  const duplicateBook = state.books.find(
    (book) =>
      book.id !== editedBook.id &&
      book.title.toLowerCase().trim() ===
      title.toLowerCase().trim()
  );

  if (duplicateBook) {
    throw new DuplicateBookError(title);
  }

  editedBook.title = title;
  editedBook.author = author;
  editedBook.genre = genre;
  editedBook.year = year;
  editedBook.status = status;

  showToast("Book Updated!", "success");
}


// ====================
// * FORM SUBMIT
// ====================

form.addEventListener("submit", (e) => {
  e.preventDefault();

  try {
    if (state.editingBookId === null) {
      addBook();
    } else {
      updateBook();
    }

    saveToStorage();

    refreshUI();

    clearError();

    resetFormMode();

  } catch (err) {
    showError(err.message);

    console.error(err);
  }
});


// ====================
// * EDIT BOOK
// ====================

bookContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("edit-btn")) {
    return;
  }

  const bookId = e.target.dataset.id;

  const book = state.books.find(
    (book) => book.id === bookId
  );

  if (!book) {
    return;
  }

  handleEdit(book);
});


function handleEdit(book) {
  titleInput.value = book.title;
  authorInput.value = book.author;
  genreInput.value = book.genre;
  yearInput.value = book.year;
  statusInput.value = book.status;

  state.editingBookId = book.id;

  addOrEditBtn.textContent = "Update Book";

  cancelBtn.classList.remove("hidden");

  clearError();
}


// ====================
// * DELETE BOOK
// ====================

bookContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) {
    return;
  }

  const bookId = e.target.dataset.id;

  const book = state.books.find(
    (book) => book.id === bookId
  );

  if (!book) {
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete "${book.title}"?`
  );

  if (!confirmed) {
    return;
  }

  state.books = state.books.filter(
    (book) => book.id !== bookId
  );

  saveToStorage();

  refreshUI();

  showToast("Book Deleted!", "error");

  if (state.editingBookId === bookId) {
    resetFormMode();
  }
});


// ====================
// * CANCEL EDIT
// ====================

cancelBtn.addEventListener("click", () => {
  resetFormMode();

  clearError();

  showToast("Edit Cancelled!", "success");
});


// ====================
// * FILTER TABS
// ====================

function setupFilterTabs() {
  const filterSection =
    document.querySelector(".filter-section");

  filterSection.addEventListener("click", (e) => {
    if (!e.target.classList.contains("filter-tab")) {
      return;
    }

    const key = Object.keys(
      e.target.dataset
    )[0];

    const value = e.target.dataset[key];

    const parent =
      e.target.closest(".filter-tabs");

    const activeTab =
      parent.querySelector(".filter-tab.active");

    if (activeTab) {
      activeTab.classList.remove("active");
    }

    e.target.classList.add("active");

    state.filters[key] = value;

    refreshUI();
  });
}

setupFilterTabs();


// ====================
// * SEARCH
// ====================

const handleSearch = debounce(() => {
  state.filters.search = searchFilter.value;

  refreshUI();
}, 300);

searchFilter.addEventListener(
  "input",
  handleSearch
);


// ====================
// * INITIALIZE APP
// ====================

function init() {
  loadFromStorage();

  refreshUI();

  clearError();
}

init();