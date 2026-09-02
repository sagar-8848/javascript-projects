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

}