// FORM
const form = document.getElementById("expense-form"); // form
const title = document.getElementById("title-input"); // title
const amount = document.getElementById("amount-input"); // amount
const category = document.getElementById("category-input"); // category dropdown
const date = document.getElementById("date-input"); // date
const errMsg = document.getElementById("error-msg"); // error text

// STATS
const statTotal = document.getElementById("stat-total"); // total spent
const statHighest = document.getElementById("stat-highest"); // highest expense
const statMonth = document.getElementById("stat-month"); // this month total
const statCount = document.getElementById("stat-count"); // total entries

// LIST
const expContainer = document.getElementById("expenses-container"); // cards render here
const emptyState = document.getElementById("empty-state"); // empty message
const expenseCount = document.getElementById("expense-count"); // "5 items"

// FILTERS
document.getElementById("search-input"); // search box
document.getElementById("filter-tabs"); // category tabs

// TOAST
document.getElementById("toast"); // toast wrapper
document.getElementById("toast-msg"); // toast text

// category icons
const categoryIcons = {
  Food: "🍕",
  Transport: "🚌",
  Shopping: "🛍️",
  Education: "📚",
  Bills: "💡",
  Entertainment: "🎬",
  Other: "💰",
};

// * creating custom error handler
class validationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
    this.name = "Validation Error";
    this.statusCode = 400;
  }
}

// ? creating Expense class

class Expense {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.amount = data.amount;
    this.category = data.category;
    this.date = data.date;
  }
}

function* idGenerator() {
  let index = 0;
  while (true) {
    yield index++;
  }
}

const generator = idGenerator();

// ? creating expenseBuilder

class expenseBuilder {
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
    this.id = generator.next().value;
    return new Expense(this);
  }
}

// const builder = new expenseBuilder()
//   .setTitle("dinner")
//   .setAmount(5000)
//   .setCategory("food")
//   .setDate("2005-9-10")
//   .build();

// * let's store and fetch our data in local storage

const expenses = loadExpenses();

function saveExpenses() {
  if (expenses.length === 0) {
    console.log("no expenses to save for now!");
    return;
  }
  const stringifedArr = JSON.stringify(expenses);
  localStorage.setItem("expenses", stringifedArr);
}

function loadExpenses() {
  const localData = localStorage.getItem("expenses");
  if (localData === null) {
    console.log("no data found!");
    return [];
  }

  const data = JSON.parse(localData);
  return data;
}

// * creating event emmiters, so if any changed, update immediately

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
  updateStat(expenses);
  renderExpenses(expenses);
});

emitter.emit("expensesChanged", expenses);
// * to get the total

function getTotal(expenses) {
  return expenses.reduce((total, expense) => {
    return total + expense.amount;
  }, 0);
}

// * get the highest expenses

function getHighestExpense(expenses) {
  if (expenses.length < 1) {
    console.log("no expenses found! ");
    return;
  }
  return expenses.reduce((max, curVal) => {
    if (curVal.amount > max.amount) {
      return curVal;
    } else {
      return max;
    }
  });
}

// * to getThisMonthTotal() function

function getThisMonthTotal(expenses) {
  // ? current date
  const now = new Date();

  const thisMonthExpense = expenses.filter((exp) => {
    const expDate = new Date(exp.date);

    return (
      now.getFullYear() === expDate.getFullYear() &&
      now.getMonth() === expDate.getMonth()
    );
  });

  const thisMonthTotalAmnt = thisMonthExpense.reduce((acc, curVal) => {
    return acc + curVal.amount;
  }, 0);
  return thisMonthTotalAmnt;
}

// * to count the number of expenses present in the array

function countExpenses(expenses) {
  return expenses.length;
}

countExpenses(expenses);

// * rendering the data of js (array) to the html

function renderExpenses(expenses) {
  // ? clearing the old
  if (expenses.length > 0) {
    emptyState.classList.add("hidden");
    expContainer.innerHTML = "";

    expenses.forEach((curExpense) => {
      const card = document.createElement("div");
      card.classList.add("expense-card");

      const icon = document.createElement("div");
      icon.classList.add("expense-card__icon");
      icon.textContent = categoryIcons[curExpense.category] || "💰";

      const info = document.createElement("div");
      info.classList.add("expense-card__info");

      const title = document.createElement("div");
      title.classList.add("expense-card__title");
      title.textContent = curExpense.title;

      const meta = document.createElement("div");
      meta.classList.add("expense-card__meta");

      info.appendChild(title);
      info.appendChild(meta);

      const category = document.createElement("div");
      category.classList.add("expense-card__category");
      category.textContent = curExpense.category;

      const date = document.createElement("div");
      date.classList.add("expense-card__date");
      date.textContent = curExpense.date;

      meta.appendChild(category);
      meta.appendChild(date);

      const amount = document.createElement("div");
      amount.classList.add("expense-card__amount");
      amount.textContent = `Rs. ${curExpense.amount}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("expense-card__delete");
      deleteBtn.textContent = "🗑️";
      // ? now appending child with parents

      card.append(icon, info, amount, deleteBtn);
      expContainer.appendChild(card);

      // ? count the total element

      expenseCount.textContent = `${countExpenses(expenses)} items`;
    });
  } else {
    emptyState.classList.add("hidden");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const inputs = [title, amount, category, date];
    clearErrors(inputs);
    const values = {
      titleValue: title.value.trim(),
      amountValue: amount.value.trim(),
      categoryValue: category.value.trim(),
      dateValue: date.value.trim(),
    };

    if (!values.titleValue) {
      throw new validationError("title is required", "title");
    }

    if (!values.amountValue) {
      throw new validationError("amount is required", "amount");
    }

    if (!values.categoryValue) {
      throw new validationError("category is required", "category");
    }

    if (!values.dateValue) {
      throw new validationError("date is required", "date");
    }

    // * validation check ends here now
    // * now we buil the expense object

    const newExpense = new expenseBuilder()
      .setTitle(values.titleValue)
      .setAmount(Number(values.amountValue))
      .setCategory(values.categoryValue)
      .setDate(values.dateValue)
      .build();

    expenses.push(newExpense);
    saveExpenses();
    emitter.emit("expensesChanged", expenses);
  } catch (err) {
    showErrMsg(err.message);
    const fieldInputs = {
      title: title,
      amount: amount,
      category: category,
      date: date,
    };

    const input = fieldInputs[err.field];
    input.classList.add("input-error");
  }
});

// * update stat function

function updateStat(expenses) {
  statTotal.textContent = getTotal(expenses);
  statMonth.textContent = getThisMonthTotal(expenses);
  statCount.textContent = countExpenses(expenses);

  const highest = getHighestExpense(expenses);
  if (!highest) return;
  statHighest.textContent = highest.amount;
}

// ? error message

function showErrMsg(msg) {
  errMsg.textContent = msg;
}

function clearErrors(input) {
  input.forEach((curElem) => {
    curElem.classList.remove("input-error");
  });
}
