// --------- PRODUCT DATA ----------
const products = [
  {
    id: 1,
    name: "Gorilla Apex Tee",
    price: 30,
    img: "assets/images/gorilla-logo.jpg",
    desc: "Unleash raw strength with the Gorilla design. Perfect for heavy lifts."
  },
  {
    id: 2,
    name: "Wolf Apex Tee",
    price: 30,
    img: "assets/images/wolf-logo.jpg",
    desc: "Run with the pack. Built for endurance and focus."
  },
  {
    id: 3,
    name: "Bear Apex Tee",
    price: 30,
    img: "assets/images/bear-logo.jpg",
    desc: "Channel brute force. Stability and power combined."
  },
  {
    id: 4,
    name: "Lion Apex Tee",
    price: 30,
    img: "assets/images/lion-logo.jpg",
    desc: "Lead like a king. Dominate your training sessions."
  },
  {
    id: 5,
    name: "Tiger Apex Tee",
    price: 30,
    img: "assets/images/tiger-logo.jpg",
    desc: "Ferocious energy with sleek design. Strike hard."
  }
];

// --------- RENDER PRODUCTS ----------
const grid = document.getElementById("product-grid");

function renderProducts() {
  grid.innerHTML = "";
  products.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">$${p.price}</p>
      <button onclick="openModal(${p.id})">View</button>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    grid.appendChild(card);
  });
}
renderProducts();

// --------- MODAL ----------
const modal = document.getElementById("product-modal");

function openModal(id) {
  const p = products.find((x) => x.id === id);
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <img src="${p.img}" alt="${p.name}">
      <h2>${p.name}</h2>
      <p>${p.desc}</p>
      <p class="price">$${p.price}</p>
      <button onclick="addToCart(${p.id}); closeModal()">Add to Cart</button>
    </div>
  `;
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
}

// --------- CART ----------
let cart = [];
const cartDrawer = document.getElementById("cart-drawer");
const cartCount = document.getElementById("cart-count");

function addToCart(id) {
  const item = cart.find((x) => x.id === id);
  if (item) {
    item.qty++;
  } else {
    const product = products.find((x) => x.id === id);
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
}

function updateCart() {
  cartCount.textContent = cart.reduce((sum, x) => sum + x.qty, 0);
  cartDrawer.innerHTML = `
    <div class="cart-content">
      <span class="close" onclick="toggleCart()">&times;</span>
      <h2>Your Cart</h2>
      ${cart
        .map(
          (x) => `
          <div class="cart-item">
            <img src="${x.img}" alt="${x.name}">
            <div>
              <h4>${x.name}</h4>
              <p>$${x.price} × ${x.qty}</p>
            </div>
            <button onclick="removeFromCart(${x.id})">Remove</button>
          </div>
        `
        )
        .join("")}
      <p class="cart-total">Total: $${cart.reduce(
        (sum, x) => sum + x.price * x.qty,
        0
      )}</p>
    </div>
  `;
}

function removeFromCart(id) {
  cart = cart.filter((x) => x.id !== id);
  updateCart();
}

function toggleCart() {
  cartDrawer.classList.toggle("hidden");
}

document.querySelector(".cart-toggle").addEventListener("click", toggleCart);

// --------- YEAR ----------
document.getElementById("year").textContent = new Date().getFullYear();
