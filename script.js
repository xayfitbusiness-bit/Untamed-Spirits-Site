const products = [
  {
    name: "Gorilla Tee",
    price: 29.99,
    image: "https://raw.githubusercontent.com/xayfitbusiness-bit/xayfitbusiness-bit.github.io/main/assets/images/gorilla-logo.jpg",
    description: "Bold gorilla design representing strength and dominance."
  },
  {
    name: "Wolf Tee",
    price: 29.99,
    image: "https://raw.githubusercontent.com/xayfitbusiness-bit/xayfitbusiness-bit.github.io/main/assets/images/wolf-logo.jpg",
    description: "Fierce wolf design symbolizing loyalty and teamwork."
  },
  {
    name: "Bear Tee",
    price: 29.99,
    image: "https://raw.githubusercontent.com/xayfitbusiness-bit/xayfitbusiness-bit.github.io/main/assets/images/bear-logo.jpg",
    description: "Powerful bear design channeling endurance and resilience."
  },
  {
    name: "Lion Tee",
    price: 29.99,
    image: "https://raw.githubusercontent.com/xayfitbusiness-bit/xayfitbusiness-bit.github.io/main/assets/images/lion-logo.jpg",
    description: "Majestic lion design embodying leadership and pride."
  },
  {
    name: "Tiger Tee",
    price: 29.99,
    image: "https://raw.githubusercontent.com/xayfitbusiness-bit/xayfitbusiness-bit.github.io/main/assets/images/tiger-logo.jpg",
    description: "Dynamic tiger design unleashing speed and focus."
  }
];

const productsContainer = document.getElementById("products");
const cartBtn = document.querySelector(".cart-btn");
const cart = document.getElementById("cart");
const closeCartBtn = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const year = document.getElementById("year");

let cartData = [];

// Render products
function renderProducts() {
  productsContainer.innerHTML = "";
  products.forEach((p, i) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${p.price.toFixed(2)}</p>
      <button class="btn" onclick="addToCart(${i})">Add to Cart</button>
    `;
    productsContainer.appendChild(card);
  });
}

function addToCart(i) {
  const product = products[i];
  const existing = cartData.find(item => item.name === product.name);
  if (existing) {
    existing.qty++;
  } else {
    cartData.push({ ...product, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cartData.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.innerHTML = `
      <p>${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}</p>
      <button onclick="removeFromCart(${i})">Remove</button>
    `;
    cartItems.appendChild(div);
  });
  cartTotal.textContent = total.toFixed(2);
}

function removeFromCart(i) {
  cartData.splice(i, 1);
  renderCart();
}

// Cart toggles
cartBtn.addEventListener("click", () => cart.classList.add("open"));
closeCartBtn.addEventListener("click", () => cart.classList.remove("open"));

// Year
year.textContent = new Date().getFullYear();

// Init
renderProducts();
