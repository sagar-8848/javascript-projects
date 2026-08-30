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

// LIST
const bookContainer = document.getElementById("books-container");
const emptyState = document.getElementById("empty-state");
const bookCount = document.getElementById("book-count");

// FILTERS
const searchFilter = document.getElementById("search-input");

// TOAST
const toastContainer = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");

// ADD / EDIT
const addOrEditBtn = document.querySelector(".btn");
const cancelBtn = document.querySelector(".cancel-btn");


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
    this.field = field;
    this.name = "Validation Error";
    this.statusCode = 400;
  }
}

class DuplicateBookError extends Error {
  constructor(title) {
    super(`Book already exists: ${title}`);
    this.name = "Duplicate Book Error";
    this.statusCode = 409;
  }
}


// ====================
// * CATEGORY ICONS
// ====================

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


// ====================
// * STATUS CLASSES
// ====================

const currentStatus = {
  Read: "status--read",
  Reading: "status--reading",
  Unread: "status--unread",
};


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
// * STATE
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
// * BOOK SUBCLASSES
// ====================

class FictionBook extends Book {
  constructor(title, author, year, status) {
    super(title, author, "Fiction", year, status);
    this.hasSeries = false;
  }

  getGenreIcon() {
    return "📖";
  }
}

class NonFiction extends Book {
  constructor(title, author, year, status) {
    super(title, author, "Non-Fiction", year, status);
    this.hasSeries = false;
  }

  getGenreIcon() {
    return "📰";
  }
}


// ====================
// * LOCAL STORAGE
// ====================

const STORAGE_KEY = "all-books-data";

function saveToStorage() {
  const stringifiedBooksArr = JSON.stringify(state.books);

  localStorage.setItem(STORAGE_KEY, stringifiedBooksArr);
}


function loadFromStorage() {
  const stringifiedBooksArr = localStorage.getItem(STORAGE_KEY);

  if (!stringifiedBooksArr) return;

  try {
    const originalBooksArr = JSON.parse(stringifiedBooksArr);

    originalBooksArr.forEach((plainObject) => {
      const book = new Book(
        plainObject.title,
        plainObject.author,
        plainObject.genre,
        plainObject.year,
        plainObject.status
      );

      book.id = plainObject.id;

      state.books.push(book);
    });

    updateStats();
    errMsg.textContent = "";
  } catch (err) {
    errMsg.textContent = err.message;
    errMsg.classList.remove("hidden");
  }
}


// ====================
// * FILTERING
// ====================

function getFilteredBooks(allBooks) {
  return allBooks.filter((curBook) => {
    return (
      (state.filters.genre === "All" ||
        curBook.genre === state.filters.genre) &&

      (state.filters.status === "All" ||
        curBook.status === state.filters.status) &&

      (
        state.filters.search === "" ||
        curBook.title
          .toLowerCase()
          .trim()
          .includes(state.filters.search.toLowerCase().trim()) ||

        curBook.author
          .toLowerCase()
          .trim()
          .includes(state.filters.search.toLowerCase().trim())
      )
    );
  });
}


// ====================
// * SEARCH
// ====================

searchFilter.addEventListener("input", () => {
  const searchedQuery = searchFilter.value;

  state.filters.search = searchedQuery;

  const filteredBooks = getFilteredBooks(state.books);

  renderBooks(filteredBooks);
});


// ====================
// * RENDER BOOKS
// ====================

function renderBooks(books) {
  bookContainer.innerHTML = "";

  bookCount.textContent = `${books.length} ${books.length === 1 ? "book" : "books"
    }`;

  if (books.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  books.forEach((curBook) => {
    const card = document.createElement("div");

    card.classList.add("book-card");

    card.innerHTML = `
      <div class="book-card__header">

        <span class="book-card__icon">
          ${curBook.getGenreIcon()}
        </span>

        <span class="book-card__status ${curBook.getStatusClass()}">
          ${curBook.status}
        </span>

      </div>

      <div class="book-card__info">
        <h3 class="book-card__title">
          ${curBook.title}
        </h3>
      </div>

      <p class="book-card__author">
        ${curBook.author}
      </p>

      <p class="book-card__genre">
        ${curBook.genre}
      </p>

      <p class="book-card__year">
        ${curBook.getFormattedYear()}
      </p>

      <div class="book-card__actions">

        <button class="edit-btn" data-id="${curBook.id}">
          Edit
        </button>

        <button class="delete-btn" data-id="${curBook.id}">
          Delete
        </button>

      </div>
    `;

    bookContainer.appendChild(card);
  });
}


// ====================
// * DELETE BOOK
// ====================

bookContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) {
    return;
  }

  const bookId = e.target.dataset.id;

  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  state.books = state.books.filter(
    (curBook) => curBook.id !== bookId
  );

  saveToStorage();

  const filteredBooks = getFilteredBooks(state.books);

  renderBooks(filteredBooks);

  updateStats();

  showToast("Book Deleted!", "error");
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
    (curBook) => curBook.id === bookId
  );

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
}


// ====================
// * UPDATE STATS
// ====================

function updateStats() {
  const readBooks = state.books.filter(
    (curBook) => curBook.status === "Read"
  );

  const readingBooks = state.books.filter(
    (curBook) => curBook.status === "Reading"
  );

  const unreadBooks = state.books.filter(
    (curBook) => curBook.status === "Unread"
  );

  statTotal.textContent = state.books.length;
  statRead.textContent = readBooks.length;
  statReading.textContent = readingBooks.length;
  statUnread.textContent = unreadBooks.length;
}


// ====================
// * ADD / UPDATE BOOK
// ====================

form.addEventListener("submit", (e) => {
  e.preventDefault();

  try {
    const titleInputValue = titleInput.value;
    const authorInputValue = authorInput.value;
    const genreInputValue = genreInput.value;
    const yearInputValue = yearInput.value;
    const statusInputValue = statusInput.value;

    // Validation
    if (!titleInputValue.trim()) {
      throw new ValidationError(
        "Title cannot be empty!",
        "title"
      );
    }

    // Duplicate check
    state.books.forEach((curBook) => {
      if (state.editingBookId === curBook.id) {
        return;
      }

      if (
        titleInputValue.toLowerCase().trim() ===
        curBook.title.toLowerCase().trim()
      ) {
        throw new DuplicateBookError(titleInputValue);
      }
    });

    if (!authorInputValue.trim()) {
      throw new ValidationError(
        "Author can't be empty!",
        "author"
      );
    }

    if (!genreInputValue) {
      throw new ValidationError(
        "Genre can't be empty!",
        "genre"
      );
    }

    if (!yearInputValue) {
      throw new ValidationError(
        "Year can't be empty!",
        "year"
      );
    }

    if (!statusInputValue) {
      throw new ValidationError(
        "Status can't be empty!",
        "status"
      );
    }


    // ADD
    if (state.editingBookId === null) {
      const newBook = new Book(
        titleInputValue,
        authorInputValue,
        genreInputValue,
        yearInputValue,
        statusInputValue
      );

      state.books.push(newBook);

      showToast("Book Added!", "success");
    }


    // UPDATE
    else {
      const editedBook = state.books.find(
        (curBook) =>
          curBook.id === state.editingBookId
      );

      editedBook.title = titleInputValue;
      editedBook.author = authorInputValue;
      editedBook.genre = genreInputValue;
      editedBook.year = yearInputValue;
      editedBook.status = statusInputValue;

      showToast("Book Updated!", "success");
    }


    saveToStorage();

    updateStats();

    renderBooks(state.books);

    errMsg.textContent = "";

    form.reset();

    resetFormMode();

  } catch (err) {
    errMsg.textContent = err.message;
    errMsg.classList.remove("hidden");
  }
});


// ====================
// * RESET FORM MODE
// ====================

cancelBtn.addEventListener("click", () => {
  resetFormMode();

  showToast("Edit Cancelled!", "success");
});


function resetFormMode() {
  state.editingBookId = null;

  addOrEditBtn.textContent = "Add Book";

  cancelBtn.classList.add("hidden");

  form.reset();
}


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

    const keyArr = Object.keys(e.target.dataset);

    const key = keyArr[0];

    const value = e.target.dataset[key];


    const parentOne =
      e.target.closest(".filter-tabs");

    const activeOne =
      parentOne.querySelector(".filter-tab.active");

    activeOne.classList.remove("active");

    e.target.classList.add("active");


    state.filters[key] = value;

    const filteredBooks =
      getFilteredBooks(state.books);

    renderBooks(filteredBooks);
  });
}

setupFilterTabs();


// ====================
// * TOAST
// ====================

let toastTimer;

function showToast(msg, type = "success") {
  toastContainer.classList.remove("hidden");

  toastContainer.classList.remove(
    "error",
    "success"
  );

  toastContainer.classList.add(type);

  toastMsg.textContent = msg;

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastContainer.classList.add("hidden");
  }, 2000);
}


// ====================
// * INITIALIZE APP
// ====================

function init() {
  loadFromStorage();

  updateStats();

  const filteredBooks =
    getFilteredBooks(state.books);

  renderBooks(filteredBooks);
}

init();