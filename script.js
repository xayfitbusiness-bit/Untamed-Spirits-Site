// ---------- Helpers ----------
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

// Year
$('#year') && ($('#year').textContent = new Date().getFullYear());

// ---------- Config ----------
const IMG_BASE = 'assets/images/'; // set to '' if your images are in the repo root

// ---------- Products ----------
const products = [
  { id:'lion',    name:'Lion Tee',    price:29.99, img:`${IMG_BASE}lion-logo.jpg`,    desc:'Lead like a king.' },
  { id:'tiger',   name:'Tiger Tee',   price:29.99, img:`${IMG_BASE}tiger-logo.jpg`,   desc:'Strike fast. Stay sharp.' },
  { id:'bear',    name:'Bear Tee',    price:29.99, img:`${IMG_BASE}bear-logo.jpg`,    desc:'Grit and resilience.' },
  { id:'gorilla', name:'Gorilla Tee', price:29.99, img:`${IMG_BASE}gorilla-logo.jpg`, desc:'Raw strength.' },
  { id:'wolf',    name:'Wolf Tee',    price:29.99, img:`${IMG_BASE}wolf-logo.jpg`,    desc:'Run with the pack.' }
];

// ---------- Render Shop ----------
const grid = $('#products'); // matches index.html
function renderProducts() {
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <article class="product-card" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${p.price.toFixed(2)}</p>
      <div style="display:flex; gap:8px; justify-content:center">
        <button class="btn btn-primary view" data-id="${p.id}">View</button>
        <button class="btn add" data-id="${p.id}">Add to Cart</button>
      </div>
    </article>
  `).join('');
}
renderProducts();

// ---------- Modal (matches index.html IDs) ----------
const modal      = $('#product-modal');
const modalImg   = $('#modal-img');
const modalTitle = $('#modal-title');
const modalDesc  = $('#modal-desc');
const modalPrice = $('#modal-price');
const closeModal = $('#close-modal');
const addToCartBtn = $('#add-to-cart');

let selectedProduct = null;

function openModal(p) {
  selectedProduct = p;
  if (!modal) return;
  modalImg.src = p.img;
  modalImg.alt = p.name;
  modalTitle.textContent = p.name;
  modalDesc.textContent = p.desc;
  modalPrice.textContent = `$${p.price.toFixed(2)}`;
  modal.style.display = 'flex';
}
function hideModal() {
  if (modal) modal.style.display = 'none';
}

grid?.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('.view');
  const addBtn  = e.target.closest('.add');
  if (viewBtn) {
    const p = products.find(x => x.id === viewBtn.dataset.id);
    if (p) openModal(p);
  }
  if (addBtn) {
    addToCart(addBtn.dataset.id);
  }
});

closeModal?.addEventListener('click', hideModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
addToCartBtn?.addEventListener('click', () => {
  if (selectedProduct) addToCart(selectedProduct.id);
  hideModal();
});

// ---------- Cart (matches index.html) ----------
const cartToggle = $('#cart-toggle');
const cart       = $('#cart');
const closeCart  = $('#close-cart');
const cartItems  = $('#cart-items');
const cartTotal  = $('#cart-total');

let cartData = [];

cartToggle?.addEventListener('click', () => cart?.classList.add('active'));
closeCart?.addEventListener('click', () => cart?.classList.remove('active'));

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cartData.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cartData.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
  renderCart();
  cart?.classList.add('active');
}

function renderCart() {
  if (!cartItems || !cartTotal) return;
  if (cartData.length === 0) {
    cartItems.innerHTML = '<p style="color:#9aa3b2">Your cart is empty.</p>';
    cartTotal.textContent = '0.00';
    return;
  }
  cartItems.innerHTML = cartData.map((i, idx) => `
    <div class="ci">
      <img src="${i.img}" alt="${i.name}">
      <div>
        <strong>${i.name}</strong>
        <div style="display:flex; gap:8px; align-items:center; margin-top:6px;">
          <button class="qty" data-i="${idx}" data-d="-1">−</button>
          <span>${i.qty}</span>
          <button class="qty" data-i="${idx}" data-d="1">+</button>
          <button class="qty" data-i="${idx}" data-d="del" style="margin-left:8px">Remove</button>
        </div>
      </div>
      <div class="price">$${(i.price * i.qty).toFixed(2)}</div>
    </div>
  `).join('');
  cartTotal.textContent = cartData.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
}

cartItems?.addEventListener('click', (e) => {
  const btn = e.target.closest('.qty'); if (!btn) return;
  const i = Number(btn.dataset.i);
  const d = btn.dataset.d;
  if (d === 'del') cartData.splice(i, 1);
  else cartData[i].qty += Number(d);
  if (cartData[i] && cartData[i].qty <= 0) cartData.splice(i, 1);
  renderCart();
});

// ---------- Contact (index.html uses #contact-form) ----------
$('#contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thanks! We’ll get back to you soon.');
  e.target.reset();
});
