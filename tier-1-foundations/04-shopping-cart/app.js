
const productContainer = document.getElementById("products-container");
const cartSection = document.getElementById("cart-section")
// * cart container where cart items lives

// * DOM Elements Cache
const cartBadge = document.getElementById("cart-badge");
const cartContainer = document.getElementById("cart-container");
const cartEmpty = document.getElementById("cart-empty");
const cartCount = document.getElementById("cart-count");
const cartSummary = document.getElementById("cart-summary");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");
const discountRow = document.getElementById("discount-row");
const summaryDiscount = document.getElementById("summary-discount");
const discountLabel = document.getElementById("discount-label");


// * Coupon Elements
const couponSection = document.getElementById("coupon-section");
const couponInput = document.getElementById("coupon-input");
const couponBtn = document.getElementById("coupon-btn");
const couponMsg = document.getElementById("coupon-msg");

// * Action Buttons
const clearBtn = document.getElementById("clear-btn");
const checkoutBtn = document.getElementById("checkout-btn");

// * Toast & Modal
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");
const modalOverlay = document.getElementById("modal-overlay");
const modalItems = document.getElementById("modal-items");
const modalTotal = document.getElementById("modal-total");
const modalClose = document.getElementById("modal-close");



// * Product class
class Product {
  constructor(name, price, stock, emoji) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.emoji = emoji;
  }
}

const p1 = new Product("Nike Air Max", 8500, 5, "👟");
const p2 = new Product("Plain T-Shirt", 1200, 10, "👕");
const p3 = new Product("Leather Bag", 4500, 2, "👜");
const p4 = new Product("Sunglasses", 2200, 8, "🕶️");
const p5 = new Product("Running Shoes", 6500, 3, "🏃");
const p6 = new Product("Hoodie", 3500, 6, "🧥");
const p7 = new Product("Puma Running Shoe", 3300, 3, "👟");
const p8 = new Product("LV BAG", 1000, 10, "👜");
const p9 = new Product("Gucci Bag", 3500, 20, "👝");
const p10 = new Product("Caliber T-shirt", 3500, 25, "👚");

const products = [];

products.push(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);


// * Cart Item

class CartItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity
  }
}

const selection1 = new CartItem(p1, 2);

// * class cart

class Cart {
  constructor(tracker) {
    this.items = [];
    this.tracker = tracker;
  }
  // * add to cart

  addToCart(addedProduct, quantity) {
    // * duplication check 
    const isDuplicate = this.items.some(curProd => curProd.product === addedProduct);
    if (!isDuplicate) {
      this.items.push(new CartItem(addedProduct, quantity))
      this.tracker.notify();
    }
    else {
      throw new DuplicateError("Product already exists in the Cart!")
    }
  }

  // * increase the quantity 

  increaseQuantity(productId) {
    const qtyToBeIncr = this.items.find(curCartItem => curCartItem.product.id === productId);

    let newQuantity = qtyToBeIncr.quantity + 1;

    if (newQuantity <= qtyToBeIncr.product.stock) {
      qtyToBeIncr.quantity = newQuantity;
      this.tracker.notify();
    }
    else {
      throw new OutOfStockError("OOPS! Out of Stock!")
    }

  }

  // * decrease quantity

  decreaseQuantity(productId) {
    const qtyToBeDecr = this.items.find(curCartItem => curCartItem.product.id === productId);

    let newQuantity = qtyToBeDecr.quantity - 1;

    if (newQuantity >= 1) {
      qtyToBeDecr.quantity = newQuantity;
      this.tracker.notify();

    }
  }

  // * remove item

  removeItem(productId) {
    const prevLength = this.items.length;
    this.items = this.items.filter(curCartItem => curCartItem.product.id !== productId)
    const newlength = this.items.length;
    if (newlength < prevLength) {
      this.tracker.notify();
    }

  }

  // * get sub total  

  getSubTotal() {
    let subTotal = this.items.reduce((acc, curItem) => {
      return acc + (curItem.quantity * curItem.product.price)
    }, 0)
    return subTotal;
  }

  // * clear the cart

  clearCart() {
    const prevLength = this.items.length;
    this.items = []
    if (prevLength > 0) {
      this.tracker.notify();
    }
  }


}


// * Custom Errors

class DuplicateError extends Error {
  constructor(msg) {
    super(msg);
  }
}

class OutOfStockError extends Error {
  constructor(msg) {
    super(msg)
  }
}

class InvalidCouponError extends Error {
  constructor(msg) {
    super(msg)
  }
}

// * observer pattern to track changes

class TrackChanges {
  constructor() {
    this.listeners = []
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  notify() {
    this.listeners.forEach((cb) => {
      cb()
    })
  }

  unSubscribe(listener) {
    this.listeners = this.listeners.filter(curListener => curListener !== listener)  // here the argument listener is the function that we want to remove from the this.listeners
  }
}

// * dummy function to check observer pattern


const tracker = new TrackChanges();




// ! STATE OF THE APPLICATION

const state = {
  cart: new Cart(tracker),
  curAppliedCoupon: null,
}

// * coupon class

class Coupon {
  constructor(couponCode, disPercentage, expiryDate) {
    this.couponCode = couponCode;
    this.disPercentage = disPercentage;
    this.expiryDate = new Date(expiryDate);
  }

  isExpired() {
    const curDate = new Date();

    // * checking if the coupon is expired or not
    if (curDate > this.expiryDate) {
      return true
    }
    else return false;
  }

  // * Check if the coupon is valid or not 

  isValid() {
    return !this.isExpired() ? true : false
  }

  // * calculate the discount amount

  calculateDiscount(subtotal) {
    if (this.isValid()) {
      const discountPercentage = this.disPercentage;

      // * now discount amount
      const discountAmnt = subtotal * discountPercentage / 100;
      return discountAmnt;
    }
    else {
      throw new InvalidCouponError("the coupon you entered may have expired!")
    }
  }
}


// * function updateCart (what ever is in the state.cart, just display that in the ui)

updateCart(state.cart.items)

function updateCart() {
  const isEmpty = state.cart.items.length === 0;
  cartContainer.innerHTML = "";
  if (!isEmpty) {
    state.cart.items.forEach((curCartItem) => {

      const card = document.createElement("div");
      card.classList.add("card")

      const productNameEmoji = document.createElement("div");
      productNameEmoji.classList.add("productNameEmoji");
      card.appendChild(productNameEmoji)

      const emoji = document.createElement("div");
      emoji.classList.add("emoji")
      emoji.textContent = `${curCartItem.product.emoji}`

      const prodName = document.createElement("h3");
      prodName.classList.add("prodName");
      prodName.textContent = `${curCartItem.product.name}`

      productNameEmoji.appendChild(emoji)
      productNameEmoji.appendChild(prodName)

      const price = document.createElement("h4");
      price.classList.add("price");
      price.textContent = `RS. ${curCartItem.product.price}`
      card.appendChild(price)

      const qty = document.createElement("h5");
      qty.classList.add("qty");
      qty.textContent = `${curCartItem.quantity}`
      card.appendChild(qty)

      const qtyControls = document.createElement("div");
      qtyControls.classList.add("qty-controls");

      // ! decrease button
      const decreaseBtn = document.createElement("button");
      decreaseBtn.classList.add("qty-btn");
      decreaseBtn.textContent = "-";

      // ! decrease button functionality

      decreaseBtn.addEventListener("click", () => {
        const productId = curCartItem.product.id;
        state.cart.decreaseQuantity(productId)
      })

      const quantityDisplay = document.createElement("span");
      quantityDisplay.classList.add("qty-display");
      quantityDisplay.textContent = curCartItem.quantity;

      // ! increase button

      const increaseBtn = document.createElement("button");
      increaseBtn.classList.add("qty-btn");
      increaseBtn.textContent = "+";
      // ! increase button functionality

      increaseBtn.addEventListener("click", () => {
        const productId = curCartItem.product.id;
        state.cart.increaseQuantity(productId)
      })

      // ! delete button

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "🗑️";

      // ! delete button functionality

      deleteBtn.addEventListener("click", () => {
        const productId = curCartItem.product.id;
        state.cart.removeItem(productId)
      })

      qtyControls.appendChild(decreaseBtn);
      qtyControls.appendChild(quantityDisplay);
      qtyControls.appendChild(increaseBtn);
      qtyControls.appendChild(deleteBtn)

      card.appendChild(qtyControls);


      cartContainer.appendChild(card)

      // * summary 


      summarySubtotal.classList.add("summary-subtotal");
      summarySubtotal.innerHTML = `${state.cart.getSubTotal()}`;

    })
    cartEmpty.classList.add("hidden");
    const countBadge = state.cart.items.reduce((acc, curVal) => {
      return acc + curVal.quantity
    }, 0);
    cartBadge.textContent = `${countBadge}`;
    cartCount.textContent = `${state.cart.items.length} Item`;
  }
  else {
    cartEmpty.classList.remove("hidden");
    cartBadge.textContent = "0";
    cartCount.textContent = "0 Items"
  }

}


tracker.subscribe(updateCart)

// * to update the badge 



// * to render the products available 

function renderProducts() {
  productContainer.innerHTML = ""
  products.forEach((curProduct) => {
    try {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      const emoji = document.createElement("div");
      emoji.classList.add("product-card__emoji");
      emoji.textContent = curProduct.emoji;

      const productName = document.createElement("div");
      productName.classList.add("product-card__name");
      productName.textContent = curProduct.name;

      const productPrice = document.createElement("div");
      productPrice.classList.add("product-card__price");
      productPrice.textContent = `RS. ${curProduct.price}`;

      const stock = document.createElement("div");
      stock.classList.add("product-card__stock");
      stock.textContent = `Stock Left : ${curProduct.stock} Pcs`;

      const btnWrapper = document.createElement("div");
      btnWrapper.classList.add("btn-wrapper");

      const addToCartBtn = document.createElement("button");
      addToCartBtn.classList.add("product-card__button")
      addToCartBtn.classList.add("btn")
      addToCartBtn.textContent = "Add To Cart"

      addToCartBtn.addEventListener("click", () => {
        state.cart.addToCart(curProduct, 1)
      })


      productCard.appendChild(emoji)
      productCard.appendChild(productName)
      productCard.appendChild(productPrice)
      productCard.appendChild(stock)
      btnWrapper.appendChild(addToCartBtn)
      productCard.appendChild(btnWrapper)

      productContainer.appendChild(productCard)
    }
    catch (err) {
      alert(err.message)
    }



  })
}



function saveCart() {
  const cartJSON = JSON.stringify(state.cart.items)
  localStorage.setItem("cartItems", cartJSON)
}

tracker.subscribe(saveCart);


function loadFromStorage() {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    const parsedItems = JSON.parse(savedCart);
    state.cart.items = parsedItems
  }
  renderProducts();
  updateCart()
}

function init() {
  loadFromStorage()
}


init()