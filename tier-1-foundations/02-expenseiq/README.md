# 02 — ExpenseIQ 💰

> A smart personal expense tracker built with vanilla JavaScript.
> Track every rupee you spend — filter, search, and analyze
> your spending patterns. No frameworks. Pure JS.

## 🎯 What I Built

A full expense management tool where you can add expenses
with title, amount, category and date. Stats update live,
filters work together, and everything persists on refresh.
Built with proper software design patterns — not just DOM
manipulation.

## ✨ Features

- [x] Add expense — title, amount, category, date
- [x] Live stats — total spent, highest, this month, count
- [x] Filter by category — tabs with active state
- [x] Search by title — debounced 300ms
- [x] Both filters work together simultaneously
- [x] Delete expense by unique ID
- [x] Toast notifications for all actions
- [x] Form validation with field-level error highlighting
- [x] Persists on refresh via localStorage
- [x] Smooth card animation on add
- [x] Empty state when no expenses
- [x] Category icons per expense type

## 🧠 JS Concepts Used

### Design Patterns
- **Builder Pattern** — ExpenseBuilder creates expense
  objects step by step with method chaining
- **Observer Pattern** — EventEmitter notifies all
  subscribers when expenses change — stats and list
  both update from one emit() call

### OOP
- **Classes** — Expense, ExpenseBuilder, EventEmitter
- **Custom Errors** — ValidationError extends Error
  with field + statusCode properties
- **Inheritance** — ValidationError extends Error

### Core JS
- **Array methods** — reduce, filter, find, forEach, map
- **Debounce** — implemented from scratch, applied to
  search input (300ms delay)
- **localStorage** — full persistence with
  JSON.stringify / JSON.parse
- **Event delegation** — category tabs use one listener
  on parent container
- **UUID** — crypto.randomUUID() for unique expense IDs
- **try/catch** — form validation with custom error types

## 🏗️ Architecture

\`\`\`
app.js
│
├── DOM References
├── ValidationError (Custom Error)
├── Expense (Data Model)
├── ExpenseBuilder (Builder Pattern)
├── EventEmitter (Observer Pattern)
├── Storage (load/save localStorage)
├── Filter State (searchItem, selectedCategory)
│
├── Calculations
│   ├── getTotal()
│   ├── getHighestExpense()
│   ├── getThisMonthTotal()
│   └── countExpenses()
│
├── Render
│   └── renderExpenses()
│
├── Filters
│   ├── filterExpensesByTitle()
│   ├── filterByCategory()
│   └── applyFilter() ← chains both filters
│
├── Event Listeners
│   ├── form submit
│   ├── search input (debounced)
│   └── category tabs (event delegation)
│
├── Helpers
│   ├── updateStat()
│   ├── showToast()
│   ├── showErrMsg()
│   ├── clearErrors()
│   └── debounce()
│
└── Init
    └── emitter.emit("expensesChanged", expenses)
\`\`\`

## 🔄 Data Flow

\`\`\`
User adds expense
      ↓
Form validates → throws ValidationError if invalid
      ↓
ExpenseBuilder.build() → creates Expense object
      ↓
expenses.push() → saveExpenses()
      ↓
emitter.emit("expensesChanged")
      ↓
  ┌───┴───┐
  ↓       ↓
stats   applyFilter()
update  (search + category + render)
\`\`\`

## 💡 What I Learned

- Builder Pattern makes complex object creation
  readable and self-documenting — each step is explicit
- Observer Pattern decouples state from UI — one emit
  updates everything without knowing what's listening
- Custom errors with field property let you highlight
  exactly which input failed — much better UX than
  generic error messages
- Debounce on search prevents API hammering — only
  fires after user stops typing for 300ms
- Delete by ID using filter() is safer than splice()
  by index — works correctly regardless of array state
- Event delegation on filter tabs — one listener on
  parent handles all tab clicks efficiently
- crypto.randomUUID() generates collision-proof IDs
  without any library

## 🐛 Fixes Applied During Review

- PascalCase applied to all class names
- Stats show "Rs." prefix correctly
- Date formatted as "Jan 15, 2024" not raw "2024-01-15"
- Category tab active state updates on click
- Guard added to tab click — prevents