// FORM
const form = document.getElementById("expense-form");
const title = document.getElementById("title-input");
const amount = document.getElementById("amount-input");
const category = document.getElementById("category-input");
const date = document.getElementById("date-input");
const errMsg = document.getElementById("error-msg");

// STATS
const statTotal = document.getElementById("stat-total");
const statHighest = document.getElementById("stat-highest");
const statMonth = document.getElementById("stat-month");
const statCount = document.getElementById("stat-count");

// LIST
const expContainer = document.getElementById("expenses-container");
const emptyState = document.getElementById("empty-state");
const expenseCount = document.getElementById("expense-count");

// FILTERS
const searchInput = document.getElementById("search-input");
const filteredTabs = document.getElementById("filter-tabs");

// TOAST
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");

// CATEGORY ICONS
const categoryIcons = {
  Food: "🍕",
  Transport: "🚌",
  Shopping: "🛍️",
  Education: "📚",
  Bills: "💡",
  Entertainment: "🎬",
  Other: "💰",
};

// =====================================================
// * Debounce
// =====================================================

function debounce(callback, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
// Toast function  

function showToast(msg, type = "success") {
  toast.className = `toast ${type}`;
  toastMsg.textContent = msg;

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 1500);
}


// CUSTOM ERROR
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
    this.name = "Validation Error";
    this.statusCode = 400;
  }
}

// EXPENSE CLASS
class Expense {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.amount = data.amount;
    this.category = data.category;
    this.date = data.date;
  }
}

// EXPENSE BUILDER
class ExpenseBuilder {
  constructor() {
    this.title = null;
    this.amount = null;
    this.category = null;
    this.date = null;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setAmount(amount) {
    this.amount = amount;
    return this;
  }

  setCategory(category) {
    this.category = category;
    return this;
  }

  setDate(date) {
    this.date = date;
    return this;
  }

  build() {
    this.id = crypto.randomUUID();
    return new Expense(this);
  }
}

// LOCAL STORAGE

let expenses = loadExpenses();

function saveExpenses() {
  const stringifiedArr = JSON.stringify(expenses);
  localStorage.setItem("expenses", stringifiedArr);
}

function loadExpenses() {
  const localData = localStorage.getItem("expenses");

  if (localData === null) {
    console.log("no data found!");
    return [];
  }

  return JSON.parse(localData);
}

// =====================================================
// FILTER STATE
// IMPORTANT: THIS MUST EXIST BEFORE ANY EMIT / FILTER
// =====================================================

let searchItem = "";
let selectedCategory = "All";

// =====================================================
// EVENT EMITTER
// =====================================================

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  }

  emit(event, data) {
    if (!this.events[event]) {
      return;
    }

    this.events[event].forEach((cb) => cb(data));
  }
}

const emitter = new EventEmitter();

emitter.on("expensesChanged", (expenses) => {
  // Stats should always represent ALL expenses
  updateStat(expenses);

  // List should respect current filters
  applyFilter();
});

// =====================================================
// EXPENSE CALCULATIONS
// =====================================================

function getTotal(expenses) {
  return expenses.reduce((total, expense) => {
    return total + expense.amount;
  }, 0);
}

function getHighestExpense(expenses) {
  if (expenses.length < 1) {
    return;
  }

  return expenses.reduce((max, curVal) => {
    if (curVal.amount > max.amount) {
      return curVal;
    }

    return max;
  });
}

function getThisMonthTotal(expenses) {
  const now = new Date();

  const thisMonthExpense = expenses.filter((exp) => {
    const expDate = new Date(exp.date);

    return (
      now.getFullYear() === expDate.getFullYear() &&
      now.getMonth() === expDate.getMonth()
    );
  });

  return thisMonthExpense.reduce((acc, curVal) => {
    return acc + curVal.amount;
  }, 0);
}

function countExpenses(expenses) {
  return expenses.length;
}

// =====================================================
// RENDER EXPENSES
// =====================================================

function renderExpenses(expenses) {
  expContainer.innerHTML = "";

  if (expenses.length === 0) {
    emptyState.classList.remove("hidden");
    expenseCount.textContent = "0 items";
    return;
  }

  emptyState.classList.add("hidden");

  expenses.forEach((curExpense) => {
    const card = document.createElement("div");
    card.classList.add("expense-card");

    // ICON
    const icon = document.createElement("div");
    icon.classList.add("expense-card__icon");
    icon.textContent = categoryIcons[curExpense.category] || "💰";

    // INFO
    const info = document.createElement("div");
    info.classList.add("expense-card__info");

    const title = document.createElement("div");
    title.classList.add("expense-card__title");
    title.textContent = curExpense.title;

    const meta = document.createElement("div");
    meta.classList.add("expense-card__meta");

    info.appendChild(title);
    info.appendChild(meta);

    // CATEGORY
    const category = document.createElement("div");
    category.classList.add("expense-card__category");
    category.textContent = curExpense.category;

    // DATE
    const date = document.createElement("div");
    date.classList.add("expense-card__date");
    date.textContent = new Date(curExpense.date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

    meta.appendChild(category);
    meta.appendChild(date);

    // AMOUNT
    const amount = document.createElement("div");
    amount.classList.add("expense-card__amount");
    amount.textContent = `Rs. ${curExpense.amount}`;

    // DELETE
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("expense-card__delete");
    deleteBtn.textContent = "🗑️";

    deleteBtn.addEventListener("click", () => {
      deleteExpense(curExpense.id);
    });

    // APPEND CARD
    card.append(icon, info, amount, deleteBtn);
    expContainer.appendChild(card);
  });

  expenseCount.textContent = `${countExpenses(expenses)} items`;
}

// =====================================================
// FORM SUBMISSION
// =====================================================

form.addEventListener("submit", (e) => {
  e.preventDefault();

  try {
    const inputs = [title, amount, category, date];

    clearErrors(inputs);
    errMsg.textContent = "";

    const values = {
      titleValue: title.value.trim(),
      amountValue: amount.value.trim(),
      categoryValue: category.value.trim(),
      dateValue: date.value.trim(),
    };

    // VALIDATION

    if (!values.titleValue) {
      throw new ValidationError("title is required", "title");
    }

    if (!values.amountValue) {
      throw new ValidationError("amount is required", "amount");
    }

    if (!values.categoryValue) {
      throw new ValidationError("category is required", "category");
    }

    if (!values.dateValue) {
      throw new ValidationError("date is required", "date");
    }

    // BUILD EXPENSE

    const newExpense = new ExpenseBuilder()
      .setTitle(values.titleValue)
      .setAmount(Number(values.amountValue))
      .setCategory(values.categoryValue)
      .setDate(values.dateValue)
      .build();

    // ADD
    expenses.push(newExpense);

    // SAVE
    saveExpenses();

    // UPDATE EVERYTHING
    emitter.emit("expensesChanged", expenses);
    showToast("✅ Expense added!");

    // CLEAR FORM
    form.reset();
  } catch (err) {
    showErrMsg(err.message);

    const fieldInputs = {
      title: title,
      amount: amount,
      category: category,
      date: date,
    };

    const input = fieldInputs[err.field];

    if (input) {
      input.classList.add("input-error");
    }
  }
});

// =====================================================
// SEARCH FILTER
// =====================================================

function filterExpensesbyTitle(expenses, searchedItem) {
  return expenses.filter((curExpense) =>
    curExpense.title.toLowerCase().includes(searchedItem.toLowerCase().trim()),
  );
}

// =====================================================
// CATEGORY FILTER
// =====================================================

function filterByCategory(expenses, clickedOne) {

  return expenses.filter((curExp) => {

    return curExp.category === clickedOne;
  });
}

// =====================================================
// APPLY ALL FILTERS
// =====================================================

function applyFilter() {
  let filteredExpenses = expenses;

  // SEARCH
  if (searchItem.trim()) {
    filteredExpenses = filterExpensesbyTitle(filteredExpenses, searchItem);
  }

  // CATEGORY
  if (selectedCategory !== "All") {
    filteredExpenses = filterByCategory(filteredExpenses, selectedCategory);
  }

  // RENDER FINAL RESULT
  renderExpenses(filteredExpenses);
}

// =====================================================
// SEARCH INPUT
// =====================================================
const debouncedFilter = debounce(applyFilter, 300);
searchInput.addEventListener("input", (e) => {
  searchItem = e.target.value;

  debouncedFilter();
});

// =====================================================
// CATEGORY TABS
// =====================================================

filteredTabs.addEventListener("click", (e) => {

  if (!e.target.classList.contains("filter-tab")) return;

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  e.target.classList.add("active");
  selectedCategory = e.target.dataset.category;
  applyFilter();
});

// =====================================================
// UPDATE STATS
// =====================================================

function updateStat(expenses) {
  statTotal.textContent = `Rs. ${getTotal(expenses)}`;
  statMonth.textContent = `Rs. ${getThisMonthTotal(expenses)}`;
  statCount.textContent = countExpenses(expenses);

  const highest = getHighestExpense(expenses);

  if (!highest) {
    statHighest.textContent = "Rs. 0";
    return;
  }

  statHighest.textContent = `Rs. ${highest.amount}`;
}
// =====================================================
// ERROR MESSAGE
// =====================================================

function showErrMsg(msg) {
  errMsg.textContent = msg;
}

function clearErrors(input) {
  input.forEach((curElem) => {
    curElem.classList.remove("input-error");
  });
}

// =====================================================
// DELETE EXPENSE
// =====================================================

function deleteExpense(id) {
  expenses = expenses.filter((curItem) => {
    return curItem.id !== id;
  });

  saveExpenses();

  // This will:
  // 1. update stats
  // 2. apply current search
  // 3. apply current category
  // 4. render the correct list
  emitter.emit("expensesChanged", expenses);
  showToast("🗑️ Expense deleted!", "error");
}

// =====================================================
// INITIAL RENDER
// =====================================================

emitter.emit("expensesChanged", expenses);

