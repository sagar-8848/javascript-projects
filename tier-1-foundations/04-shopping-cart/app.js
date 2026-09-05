const cartBadge = document.getElementById("cart-badge")




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

const products = [];

products.push(p1, p2, p3, p4, p5, p6);


// * Cart Item

class CartItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity
  }
}

const seletion1 = new CartItem(p1, 2);

// * class cart

class Cart {
  constructor() {
    this.items = []
  }
  // * add to cart

  addToCart(addedProduct, quantity) {
    // * duplication check 
    const isDuplicate = this.items.some(curProd => curProd.product === addedProduct);
    if (!isDuplicate) {
      this.items.push(new CartItem(addedProduct, quantity))
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
    }
  }

  // * remove item

  removeItem(productId) {
    this.items = this.items.filter(curCartItem => curCartItem.product.id !== productId)
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
    this.items = []
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
    return !this.isValid() ? true : false
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

function renderUI() {
  console.log("rendered UI")
}

function updateSummary() {
  console.log("summary update successful!")
}

const tracker = new TrackChanges();

tracker.subscribe(renderUI)
tracker.subscribe(updateSummary)
tracker.notify()