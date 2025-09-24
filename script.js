/* Untamed Spirits - simple shop + cart (localStorage)
   Replace sample products / images with your real data.
*/

const products = [
  {
    id: "predator-lion-black",
    title: "Lion Apex Tee — Black",
    price: 29.99,
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder",
    desc: "Soft performance tee with large lion face on the back and small chest logo."
  },
  {
    id: "predator-tiger-charcoal",
    title: "Tiger Apex Tee — Charcoal",
    price: 31.99,
    img: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder",
    desc: "Premium cut, reinforced seams, moisture-wicking fabric."
  },
  {
    id: "predator-gorilla-olive",
    title: "Gorilla Apex Tee — Olive",
    price: 32.00,
    img: "https://images.unsplash.com/photo-1520975687920-6b4b1a23f4f0?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder",
    desc: "Heavy-lift friendly tee with modern gorilla artwork."
  }
];

// DOM
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const productModal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

let cart = JSON.parse(localStorage.getItem('untamed_cart') || '[]');

function saveCart(){ localStorage.setItem('untamed_cart', JSON.stringify(cart)); updateCartUI(); }
function addToCart(productId, qty = 1){
  const p = products.find(x => x.id === productId);
  if(!p) return;
  const existing = cart.find(i=>i.id===p.id);
  if(existing) existing.qty += qty;
  else cart.push({id:p.id, title:p.title, price:p.price, img:p.img, qty});
  saveCart();
  openCart();
}
function removeFromCart(productId){
  cart = cart.filter(i=>i.id !== productId);
  saveCart();
}
function updateQty(productId, qty){
  const it = cart.find(i=>i.id===productId);
  if(!it) return;
  it.qty = Math.max(1, qty);
  saveCart();
}
function cartTotal(){ return cart.reduce((s,i)=>s + i.price*i.qty, 0); }
function updateCartUI(){
  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartTotalEl.textContent = cartTotal().toFixed(2);
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p style="color:var(--muted)">Your cart is empty.</p>';
    return;
  }
  cart.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${it.img}" alt="${it.title}">
      <div style="flex:1">
        <strong style="display:block">${it.title}</strong>
        <div style="color:var(--muted);font-size:.95rem">$${it.price.toFixed(2)} • Qty:
          <input type="number" value="${it.qty}" min="1" style="width:56px" data-id="${it.id}" class="qty-input">
          <button data-id="${it.id}" class="remove-btn" style="margin-left:8px">Remove</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  // bind qty & remove
  cartItemsEl.querySelectorAll('.qty-input').forEach(inp=>{
    inp.addEventListener('change', e=>{
      const id = e.target.dataset.id;
      const val = parseInt(e.target.value) || 1;
      updateQty(id, val);
    });
  });
  cartItemsEl.querySelectorAll('.remove-btn').forEach(b=>{
    b.addEventListener('click', e=>{
      removeFromCart(e.target.dataset.id);
    });
  });
}

// open / close cart
function openCart(){ cartDrawer.setAttribute('aria-hidden', 'false'); updateCartUI(); }
function closeCartDrawer(){ cartDrawer.setAttribute('aria-hidden', 'true'); }

// render products
function renderProducts(){
  productGrid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="desc">${p.desc}</p>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div class="card-actions">
        <button class="btn-primary view-btn" data-id="${p.id}">View</button>
        <button class="btn-primary add-btn" style="background:transparent;border:1px solid rgba(255,255,255,0.08)" data-id="${p.id}">Add</button>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // bindings
  document.querySelectorAll('.add-btn').forEach(b=>{
    b.addEventListener('click', e=> addToCart(e.target.dataset.id));
  });
  document.querySelectorAll('.view-btn').forEach(b=>{
    b.addEventListener('click', e=> openProductModal(e.target.dataset.id));
  });
}

// product modal
function openProductModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  productModal.setAttribute('aria-hidden','false');
  modalBody.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start">
      <img src="${p.img}" alt="${p.title}" style="width:100%;height:360px;object-fit:cover;border-radius:8px">
      <div>
        <h2>${p.title}</h2>
        <p style="color:var(--muted)">${p.desc}</p>
        <div style="font-weight:800;margin:8px 0">$${p.price.toFixed(2)}</div>
        <label>Quantity <input id="modalQty" type="number" value="1" min="1" style="width:80px"></label>
        <div style="margin-top:12px">
          <button id="modalAdd" class="btn-primary">Add to cart</button>
          <button id="modalCloseBtn" style="margin-left:8px;background:transparent;border:1px solid rgba(255,255,255,0.06);padding:10px;border-radius:8px">Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modalAdd').addEventListener('click', ()=>{
    const qty = parseInt(document.getElementById('modalQty').value) || 1;
    addToCart(p.id, qty);
    closeProductModal();
  });
  document.getElementById('modalCloseBtn').addEventListener('click', closeProductModal);
}
function closeProductModal(){ productModal.setAttribute('aria-hidden','true'); modalBody.innerHTML = ''; }

// contact form (stub)
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  alert('Thanks — message sent (this is a demo stub). Replace with your mailing backend or use Formspree/Netlify Forms.');
  e.target.reset();
});

// init
document.getElementById('year').textContent = new Date().getFullYear();
renderProducts();
updateCartUI();

// events
cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartDrawer);
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  alert('Checkout not implemented in this demo. Integrate with Stripe / Shopify / PayPal for payments.');
});
modalClose.addEventListener('click', closeProductModal);
productModal.addEventListener('click', (e)=>{ if(e.target === productModal) closeProductModal(); });

// mobile menu (very simple)
document.getElementById('mobileMenuBtn').addEventListener('click', ()=>{
  const nav = document.getElementById('navLinks');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  nav.style.flexDirection = 'column';
});
