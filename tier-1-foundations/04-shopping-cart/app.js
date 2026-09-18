
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
const marqueeText = document.getElementById("marquee-text")
// * available products in the array 
let products = [];


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

const p1 = new Product("Nike Air Max", 8500, 100, "👟");
const p2 = new Product("Plain T-Shirt", 1200, 500, "👕");
const p3 = new Product("Leather Bag", 4500, 300, "👜");
const p4 = new Product("Sunglasses", 2200, 600, "🕶️");
const p5 = new Product("Running Shoes", 6500, 546, "🏃");
const p6 = new Product("Hoodie", 3500, 685, "🧥");
const p7 = new Product("Puma Running Shoe", 3300, 356, "👟");
const p8 = new Product("LV BAG", 1000, 1000, "👜");
const p9 = new Product("Gucci Bag", 3500, 420, "👝");
const p10 = new Product("Caliber T-shirt", 3500, 245, "👚");


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
    if (addedProduct.stock === 0) {
      throw new OutOfStockError("OOPS! Out Of Stock!");
    }
    const isDuplicate = this.items.some(curProd => curProd.product.id === addedProduct.id);
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

const c1 = new Coupon("SAVE10", 10, '2026-09-20');
const c2 = new Coupon("SAVE50", 50, '2020-09-14');
const c3 = new Coupon("SAVE90", 90, '2027-10-10');
const c4 = new Coupon("SAVE60", 60, '2027-10-10');

const availableCoupons = [c1, c2, c3, c4]

// * TO SHOW THE DISCOUNT ON THE MARQEE TAG

function renderMarqee() {
  let marqueeMsg = "";

  availableCoupons.forEach((curCoupon) => {

    if (curCoupon.isValid()) {
      marqueeMsg += `🔥 Use ${curCoupon.couponCode} for ${curCoupon.disPercentage}% off!   `;
    }
  })


  marqueeText.textContent = marqueeMsg;
}

// * function updateCart (what ever is in the state.cart, just display that in the ui)


// * update cart 
function updateCart() {
  const isEmpty = state.cart.items.length === 0;
  cartContainer.innerHTML = "";
  if (!isEmpty) {
    couponSection.classList.remove("hidden")
    cartSummary.classList.remove("hidden")
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
        try {
          const productId = curCartItem.product.id;
          state.cart.increaseQuantity(productId);

        }
        catch (err) {
          showToast(err.message, "error")
        }
      })



      // ! delete button

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "🗑️";

      // ! delete button functionality

      deleteBtn.addEventListener("click", () => {
        const productId = curCartItem.product.id;
        state.cart.removeItem(productId)
        showToast("removed from cart!", "error")
      })

      qtyControls.appendChild(decreaseBtn);
      qtyControls.appendChild(quantityDisplay);
      qtyControls.appendChild(increaseBtn);
      qtyControls.appendChild(deleteBtn)

      card.appendChild(qtyControls);


      cartContainer.appendChild(card)

      // * summary 

    })
    updateSummary()
    cartEmpty.classList.add("hidden");
    const countBadge = state.cart.items.reduce((acc, curVal) => {
      return acc + curVal.quantity
    }, 0);
    cartBadge.textContent = `${countBadge}`;
    cartCount.textContent = `${state.cart.items.length} Item`;
  }
  else {
    cartEmpty.classList.remove("hidden");
    couponSection.classList.add("hidden")

    cartBadge.textContent = "0";
    cartCount.textContent = "0 Items"
    cartSummary.classList.add("hidden")
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

      if (curProduct.stock === 0) {
        addToCartBtn.textContent = "Out Of Stock!"
        addToCartBtn.disabled = true
      }
      else {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = "Add To Cart"
      }
      addToCartBtn.addEventListener("click", () => {
        try {
          state.cart.addToCart(curProduct, 1);
          showToast("Added to Cart!", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
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


// * function to update the summary cart

function updateSummary() {
  // 1. Get the subtotal
  const subtotal = state.cart.getSubTotal();

  // 2. Put subtotal on the screen
  summarySubtotal.textContent = "Rs. " + subtotal;

  // 3. Check if a coupon exists
  if (state.curAppliedCoupon) {
    // Do the discount math
    const discountAmount = state.curAppliedCoupon.calculateDiscount(subtotal);

    // Show the discount row and update the text
    discountRow.classList.remove("hidden");
    summaryDiscount.textContent = "- Rs. " + discountAmount;

    // Update the final total
    summaryTotal.textContent = "Rs. " + (subtotal - discountAmount);
  } else {
    // If no coupon, hide the discount row and total is just subtotal
    discountRow.classList.add("hidden");
    summaryTotal.textContent = "Rs. " + subtotal;
  }
}

// * clear cart btn 
clearBtn.addEventListener("click", () => {
  state.cart.clearCart()
  showToast("Cart cleared!", "error")

  // * after clearing the button, the coupon must also be cleared from the state so, 
  state.curAppliedCoupon = null;

  couponInput.value = ""
  couponSection.classList.add("hidden");
  updateSummary()
})

// * save cart to local storage
function saveCart() {
  const cartJSON = JSON.stringify(state.cart.items)
  localStorage.setItem("cartItems", cartJSON)
}

tracker.subscribe(saveCart);



// ? to get the input coupon from the user


couponBtn.addEventListener("click", () => {
  // ? getting the coupon first

  const userCoupon = couponInput.value.toLowerCase();

  const foundCoupon = availableCoupons.find(curCoupon => curCoupon.couponCode.toLowerCase() === userCoupon);
  if (!foundCoupon) {
    showToast("Invalid Coupon Code", "error")
    return
  }
  if (foundCoupon) {
    try {
      foundCoupon.calculateDiscount(state.cart.getSubTotal())
      state.curAppliedCoupon = foundCoupon;
      // console.log("discount applied success!")
      couponMsg.classList.remove("hidden")
      couponMsg.textContent = `${foundCoupon.disPercentage} % Discount Applied!`
      couponMsg.classList.add("coupon-msg--success")
      updateSummary()

    } catch (err) {
      showToast(err.message, "error")
    }
  }
})

checkoutBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("hidden")
  modalItems.innerHTML = "";
  state.cart.items.forEach((curItem) => {

    const stockBeforePurcahase = curItem.product.stock;
    const purchasedStcok = curItem.quantity;

    const stockAfterPurchase = stockBeforePurcahase - purchasedStcok;

    curItem.product.stock = stockAfterPurchase;
    saveProduct()


    const modalItem = document.createElement("div");
    modalItem.classList.add("modal__item");

    const span1 = document.createElement("span")
    span1.textContent = `${curItem.quantity}X ${curItem.product.name}`

    const span2 = document.createElement("span");
    span2.textContent = `${curItem.quantity * curItem.product.price}`


    modalItem.appendChild(span1);
    modalItem.appendChild(span2);

    modalItems.appendChild(modalItem)
  })
  let finalTotal = state.cart.getSubTotal();
  if (state.curAppliedCoupon) {
    const discountAmount = state.curAppliedCoupon.calculateDiscount(finalTotal);
    const discountRow = document.createElement("div");
    discountRow.classList.add("modal__item")
    const span1 = document.createElement("span")
    span1.textContent = "Discount Amount "
    const span2 = document.createElement("span")
    span2.textContent = `- Rs. ${discountAmount}`

    discountRow.appendChild(span1)
    discountRow.appendChild(span2)
    modalItems.appendChild(discountRow)
    finalTotal = finalTotal - discountAmount;
  }

  modalTotal.textContent = `Rs. ${finalTotal}`;
  showToast("Order Placed Successfully!", "success")
  renderProducts()
})

// * save product

function saveProduct() {
  const stringifiedProducts = JSON.stringify(products);
  localStorage.setItem("allProducts", stringifiedProducts)
}

// * close modal button

modalClose.addEventListener("click", () => {
  modalOverlay.classList.add("hidden")
  state.cart.clearCart()
  state.curAppliedCoupon = null;
  couponInput.value = "";
  couponMsg.classList.add("hidden");
  updateSummary()
})


// * load from local storage
function loadFromStorage() {
  // ? Load Products FIRST!
  const savedProduct = localStorage.getItem("allProducts");
  if (savedProduct) {
    products = JSON.parse(savedProduct);
  }

  // ? Load the Cart SECOND
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    const parsedItems = JSON.parse(savedCart);

    // ? DO NOT DO: state.cart.items = parsedItems
    // ? INSTEAD: Loop through parsedItems and re-link them!
    parsedItems.forEach(plainItem => {
      // ? Find the LIVE product in the products array using the ID
      const liveProduct = products.find(p => p.id === plainItem.product.id);

      // ? If we found it, create a NEW CartItem with the live product!
      if (liveProduct) {
        state.cart.items.push(new CartItem(liveProduct, plainItem.quantity));
      }
    });
  }

  // 4. Now render the UI
  renderProducts();
  updateCart();
}

// * showToast function 

let toastTimer;

function showToast(msg, type = "success") {
  clearTimeout(toastTimer);

  // 1. Set text and type
  toastMsg.textContent = msg;
  toast.className = `toast ${type}`; // Sets "toast success" etc.

  // 2. Show it (removes hidden, which uses display: none !important)
  toast.classList.remove("hidden");

  // 3. Hide it after 2 seconds
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

function init() {
  renderMarqee()
  loadFromStorage()
}


init()
