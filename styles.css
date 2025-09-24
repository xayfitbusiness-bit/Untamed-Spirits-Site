// ---------- Helpers ----------
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
document.documentElement.style.scrollBehavior = 'smooth';
$('#year').textContent = new Date().getFullYear();

// Mobile menu
$('#mobileMenuBtn')?.addEventListener('click', () => {
  $('#navLinks').classList.toggle('open');
});

// Back to top
const toTop = $('#toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 800);
});
toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// Newsletter + contact (demo only)
$('#newsForm')?.addEventListener('submit', (e) => { e.preventDefault(); alert('Subscribed!'); e.target.reset(); });
$('#contactForm')?.addEventListener('submit', (e) => { e.preventDefault(); alert('Thanks! We’ll reply soon.'); e.target.reset(); });

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  })
}, { threshold: 0.15 });
$$('.reveal, .product-card').forEach(el => io.observe(el));

// ---------- Products ----------
// tip: you can duplicate items to add sizes/colors; change price/name/thumbnail/logo/mock as needed
const products = [
  // Existing athletic shots
  {
    id: 'black-classic',
    name: 'Black Tee — Classic',
    price: 29.00,
    badge: 'Best Seller',
    design: 'gorilla',
    thumbnail: 'assets/images/model-gym-smile.jpg',
    imageLarge: 'assets/images/model-portrait-crossed.jpg',
    description: 'Moisture-wicking performance tee with chest logo and tiger mark.',
    // mock overlay (logo over a model photo)
    mock: { photo: 'assets/images/model-portrait-crossed.jpg', logo: 'assets/images/gorilla-logo.jpg' }
  },
  {
    id: 'charcoal-performance',
    name: 'Charcoal Tee — Performance',
    price: 29.00,
    badge: 'New',
    design: 'wolf',
    thumbnail: 'assets/images/model-forest-xavier.jpg',
    imageLarge: 'assets/images/rock-three-tees.jpg',
    description: 'Lightweight charcoal fabric with reinforced seams—built for heavy sessions.',
    mock: { photo: 'assets/images/model-steps-sit-2.jpg', logo: 'assets/images/wolf-logo.jpg' }
  },
  {
    id: 'black-athletic',
    name: 'Black Tee — Athletic Fit',
    price: 29.00,
    badge: 'Limited',
    design: 'bear',
    thumbnail: 'assets/images/model-gym-flex.jpg',
    imageLarge: 'assets/images/model-steps-sit-2.jpg',
    description: 'Athletic cut with four-way stretch and quick-dry comfort.',
    mock: { photo: 'assets/images/model-steps-sit-1.jpg', logo: 'assets/images/bear-logo.jpg' }
  },

  // New “logo-first” product tiles
  {
    id: 'gorilla-black',
    name: 'Gorilla Mark — Black',
    price: 29.00,
    badge: 'New',
    design: 'gorilla',
    thumbnail: 'assets/images/gorilla-logo.jpg',
    imageLarge: 'assets/images/gorilla-logo.jpg',
    description: 'Signature Gorilla artwork on our moisture-wicking black tee.',
    mock: { photo: 'assets/images/model-forest-stand.jpg', logo: 'assets/images/gorilla-logo.jpg' }
  },
  {
    id: 'wolf-black',
    name: 'Wolf Mark — Black',
    price: 29.00,
    badge: 'New',
    design: 'wolf',
    thumbnail: 'assets/images/wolf-logo.jpg',
    imageLarge: 'assets/images/wolf-logo.jpg',
    description: 'Alpha Wolf artwork with clean chest branding.',
    mock: { photo: 'assets/images/model-steps-sit-1.jpg', logo: 'assets/images/wolf-logo.jpg' }
  },
  {
    id: 'bear-black',
    name: 'Bear Mark — Black',
    price: 29.00,
    badge: 'New',
    design: 'bear',
    thumbnail: 'assets/images/bear-logo.jpg',
    imageLarge: 'assets/images/bear-logo.jpg',
    description: 'Grizzly Bear artwork — strength, grit, and focus.',
    mock: { photo: 'assets/images/model-forest-xavier.jpg', logo: 'assets/images/bear-logo.jpg' }
  }
];

// ---------- Render products ----------
const productGrid = $('#productGrid');
function renderGrid(filter = 'all') {
  const list = products.filter(p => filter === 'all' ? true : p.design === filter);
  productGrid.innerHTML = list.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="img-wrap">
        <img src="${p.thumbnail}" alt="${p.name}" loading="lazy">
        <span class="badge">${p.badge ?? ''}</span>
      </div>
      <div class="info">
        <h3>${p.name}</h3>
        <p class="muted">${p.description}</p>
        <div class="row">
          <p class="price">$${p.price.toFixed(2)}</p>
          <div class="actions">
            <button class="btn-secondary viewBtn" data-id="${p.id}">View</button>
            <button class="btn-primary addBtn" data-id="${p.id}">Add</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
  $$('.product-card').forEach(el => io.observe(el));
}
renderGrid();

// Filters
$('.filters')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  $$('.chip').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  renderGrid(btn.dataset.filter);
});

// ---------- Modal ----------
const modal = $('#productModal');
const modalBody = $('#modalBody');
const modalClose = $('#modalClose');

function openModal(html) {
  modalBody.innerHTML = html;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ---------- Cart ----------
let cart = [];
const cartBtn = $('#cartBtn');
const cartDrawer = $('#cartDrawer');
const closeCart = $('#closeCart');
const cartItemsEl = $('#cartItems');
const cartTotalEl = $('#cartTotal');
const cartCountEl = $('#cartCount');

cartBtn.addEventListener('click', () => {
  const isHidden = cartDrawer.getAttribute('aria-hidden') === 'true';
  cartDrawer.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
});
closeCart.addEventListener('click', () => cartDrawer.setAttribute('aria-hidden', 'true'));

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="muted">Your cart is empty.</p>';
    cartTotalEl.textContent = '0.00';
    cartCountEl.textContent = '0';
    return;
  }
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.thumbnail}" alt="${item.name}" />
      <div class="ci-info">
        <div class="ci-title">${item.name}</div>
        <div class="qty">
          <button class="qbtn" data-id="${item.id}" data-delta="-1" aria-label="Decrease">−</button>
          <span>${item.qty}</span>
          <button class="qbtn" data-id="${item.id}" data-delta="1" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="ci-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotalEl.textContent = total.toFixed(2);
  cartCountEl.textContent = String(cart.reduce((n, i) => n + i.qty, 0));
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, thumbnail: p.thumbnail, qty: 1 });
  renderCart();
}

cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.qbtn');
  if (!btn) return;
  const id = btn.dataset.id;
  const delta = Number(btn.dataset.delta);
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
});

// Grid buttons (view / add)
productGrid.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('.viewBtn');
  const addBtn  = e.target.closest('.addBtn');
  if (viewBtn) {
    const id = viewBtn.dataset.id;
    const p = products.find(x => x.id === id);

    // Build mock preview if provided
    const mockHTML = p.mock ? `
      <div class="mock">
        <img class="mock-photo" src="${p.mock.photo}" alt="${p.name} on model">
        <img class="mock-logo" src="${p.mock.logo}" alt="${p.name} logo overlay">
      </div>` : '';

    openModal(`
      <div class="product-detail">
        <div class="detail-media">
          ${mockHTML || `<img src="${p.imageLarge}" alt="${p.name} large view">`}
        </div>
        <div class="detail-info">
          <h3 id="modalTitle">${p.name}</h3>
          <p>${p.description}</p>
          <p class="price">$${p.price.toFixed(2)}</p>
          <div class="detail-actions">
            <button class="btn-secondary" id="detailClose">Close</button>
            <button class="btn-primary" id="detailAdd">Add to Cart</button>
          </div>
        </div>
      </div>
    `);
    $('#detailClose').addEventListener('click', closeModal);
    $('#detailAdd').addEventListener('click', () => addToCart(id));
  }
  if (addBtn) addToCart(addBtn.dataset.id);
});
