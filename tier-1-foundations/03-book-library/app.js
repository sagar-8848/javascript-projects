// FORM
const form = document.getElementById("book-form")       // form
const titleInput = document.getElementById("title-input")     // title
const authorInput = document.getElementById("author-input")    // author
const genreInput = document.getElementById("genre-input")     // genre dropdown
const yearInput = document.getElementById("year-input")      // year
const statusInput = document.getElementById("status-input")    // status dropdown
const errMsg = document.getElementById("error-msg")       // error text

// STATS
let statTotal = document.getElementById("stat-total")      // total books
let statRead = document.getElementById("stat-read")       // read count
let statReading = document.getElementById("stat-reading")    // reading count
let statUnread = document.getElementById("stat-unread")     // unread count

// LIST
let bookContainer = document.getElementById("books-container") // cards render here
let emptyState = document.getElementById("empty-state")     // empty message
let bookCount = document.getElementById("book-count")      // "12 books"

// FILTERS
let searchFilter = document.getElementById("search-input")    // search box
document.getElementById("genre-tabs")      // genre filter tabs
document.getElementById("status-tabs")     // status filter tabs

// TOAST
document.getElementById("toast")           // toast wrapper
document.getElementById("toast-msg")       // toast text




// ====================
// * debounce function 
// ====================

function debounce(callback, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback(...args)
    }, delay)
  }

}


// ====================
// * Custiom Errors
// ====================

// * validation error

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
    this.name = "Validation Error";
    this.statusCode = 400;
  }
}

// * duplicate error

class DuplicateBookError extends Error {
  constructor(title) {
    super(`Book already Exists ${title}`);
    this.name = "Duplicate Book Error";
    this.statusCode = 409;
  }
}

// Category Icons

const categoryIcons = {

  "Fiction": "📖",
  "Non-Fiction": "📰",
  "Self Help": "🧠",
  "Technology": "💻",
  "Science": "🔬",
  "History": "🏛️",
  "Biography": "👤",
  "Philosophy": "💭",
  "Other": "📦",
};


// status 

const currentStatus = {
  Read: "status--read",
  Reading: "status--reading",
  Unread: "status--unread"
}

// ====================
// * Book Class
// ====================


class Book {
  constructor(title, author, genre, year, status) {
    this.id = Date.now().toString();
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.year = year;
    this.status = status
  }

  // ? to get the icon 
  getGenreIcon() {
    return categoryIcons[this.genre] ?? "📦"
  }

  getStatusClass() {
    return currentStatus[this.status] ?? "status--unread"
  }

  getFormattedYear() {
    return this.year ? String(this.year) : "Unknown"
  }
}

const state = {
  books: [],
  filters: {
    genre: "All",
    status: "All",
    search: ""
  }
}



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
// * Save to Local Storage
// ====================
const STORAGE_KEY = "all-books-data";  // 

function saveToStorage() {
  const stringifedBooksArr = JSON.stringify(state.books)
  localStorage.setItem(STORAGE_KEY, stringifedBooksArr)
}


function loadFromStorage() {
  const stringifedBooksArr = localStorage.getItem(STORAGE_KEY)
  if (!stringifedBooksArr) return;
  try {
    const orgBooksArr = JSON.parse(stringifedBooksArr);
    orgBooksArr.forEach((plainObject) => {
      const book = new Book(
        plainObject.title, plainObject.author, plainObject.genre, plainObject.year, plainObject.status,
      )
      book.id = plainObject.id;
      state.books.push(book)
    })
    updateStats()
    errMsg.textContent = ""
  }

  catch (err) {
    errMsg.textContent = err.message;
  }
}


function getFilteredBooks(allBooks) {
  const filtered = allBooks.filter((curBook) => {
    return (state.filters.genre === "All" || curBook.genre === state.filters.genre)
      &&
      (state.filters.status === "All" || curBook.status === state.filters.status)
      &&
      // let userQuery = searchFilter.value
      (state.filters.search === "" || curBook.title.toLowerCase().trim().includes(state.filters.search.toLowerCase().trim()) || curBook.author.toLowerCase().trim().includes(state.filters.search.toLowerCase().trim()))
  })
  return filtered;
}



searchFilter.addEventListener("input", () => {
  let searchedQuery = searchFilter.value;

  state.filters.search = searchedQuery;
  const filteredBooks = getFilteredBooks(state.books);
  renderBooks(filteredBooks)
})

function renderBooks(books) {
  bookContainer.innerHTML = "";
  bookCount.textContent = `${books.length} ${books.length === 1 ? "book" : "books"}`;

  if (books.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  books.forEach((curBook) => {
    const card = document.createElement("div");
    card.classList.add("book-card")

    card.innerHTML = `
    <div class = "book-card__header">
    <span class="book-card__icon">
    ${curBook.getGenreIcon()}
    </span >
    <span class="book-card__status ${curBook.getStatusClass()}">${curBook.status}</span>
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

    bookContainer.appendChild(card)
  })
}

// * to delete the book 

bookContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-btn")) {
    return;
  }
  const clickedBtn = e.target.dataset.id;
  state.books = state.books.filter(curBook => curBook.id !== clickedBtn);
  saveToStorage()
  const filteredBooks = getFilteredBooks(state.books);
  renderBooks(filteredBooks)
  updateStats()
})

// * to edit the book

bookContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("edit-btn")) return;

  const clickedBook = e.target.dataset.id;
  const book = state.books.find(curBook => curBook.id === clickedBook)
  handleEdit(book)
})

// * handle edit

function handleEdit(book) {
  titleInput.value = book.title;
  authorInput.value = book.author;
  genreInput.value = book.genre;
  yearInput.value = book.year;
  statusInput.value = book.status;

  document.querySelector(".btn").textContent = "Update Book"
}

// * function updateStats

function updateStats() {
  // * filtering all the read books
  const readBooks = state.books.filter(
    (curBook) => curBook.status === "Read"
  );

  // * filtering all the undread books
  const readingBooks = state.books.filter(
    (curBook) => curBook.status === "Reading"
  );

  // * filtering all unread books
  const unreadBooks = state.books.filter(
    (curBook) => curBook.status === "Unread"
  );

  statTotal.textContent = state.books.length;
  statRead.textContent = readBooks.length;
  statReading.textContent = readingBooks.length;
  statUnread.textContent = unreadBooks.length;

}


// * taking user input and add the books 

form.addEventListener("submit", (e) => {
  e.preventDefault();

  try {

    let titleInputValue = titleInput.value;
    if (!titleInputValue.trim()) {
      throw new ValidationError("title cannot be empty!", "title")
    }
    // * logic for duplicate error
    state.books.forEach((curElem) => {
      if (titleInputValue.toLowerCase().trim() === curElem.title.toLowerCase().trim()) {
        throw new DuplicateBookError(titleInputValue)
      }
    })
    let authorInputValue = authorInput.value;
    if (!authorInputValue.trim()) {
      throw new ValidationError("author can't be empty!", "author")
    }
    let genreInputValue = genreInput.value;
    if (!genreInputValue) {
      throw new ValidationError("genre can't be empty!", "genre")
    }
    let yearInputValue = yearInput.value
    if (!yearInputValue) {
      throw new ValidationError("year can't be empty!", "year")
    }
    let statusInputValue = statusInput.value;
    if (!statusInputValue) {
      throw new ValidationError("status can't be empty!", "status")
    }



    const newBook = new Book(titleInputValue, authorInputValue, genreInputValue, yearInputValue, statusInputValue)
    state.books.push(newBook)
    saveToStorage()
    updateStats()
    renderBooks(state.books)
    errMsg.textContent = ""
    form.reset()
  } catch (err) {
    errMsg.textContent = err.message;
  }

})

// * toast message

function toastMsg(msg) {

}

// * application initial state

function init() {
  loadFromStorage();
  updateStats();
  const filteredBooks = getFilteredBooks(state.books);
  renderBooks(filteredBooks)
}

init()
