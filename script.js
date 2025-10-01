// ---------- Utilities ----------
-const $ = (s, c=document)=>c.querySelector(s);
-const $$ = (s, c=document)=>Array.from(c.querySelectorAll(s));
-$('#year').textContent = new Date().getFullYear();
-
-// Reveal on scroll
-const io = new IntersectionObserver((entries)=>{
-  entries.forEach(en=>{
-    if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
-  });
-},{threshold:.15});
-$$('.reveal').forEach(el=>io.observe(el));
-
-// ---------- Data ----------
-// Your images are in the repo root, so the paths are just the filenames.
-const products = [
-  { id:'lion',    name:'Lion Tee',    price:29.99, img:'lion-logo.jpg',    desc:'Lead like a king.',      tag:'big-cat', badge:'Drop' },
-  { id:'tiger',   name:'Tiger Tee',   price:29.99, img:'tiger-logo.jpg',   desc:'Strike fast. Stay sharp.', tag:'big-cat', badge:'Hot' },
-  { id:'bear',    name:'Bear Tee',    price:29.99, img:'bear-logo.jpg',    desc:'Grit and resilience.',  tag:'power',   badge:'Core' },
-  { id:'gorilla', name:'Gorilla Tee', price:29.99, img:'gorilla-logo.jpg', desc:'Raw strength.',         tag:'power',   badge:'Core' },
-  { id:'wolf',    name:'Wolf Tee',    price:29.99, img:'wolf-logo.jpg',    desc:'Run with the pack.',    tag:'pack',    badge:'New' }
-];
-
-// ---------- Render ----------
-const grid = $('#productGrid');
-function render(filter='all'){
-  const list = products.filter(p => filter==='all' ? true : p.tag===filter);
-  grid.innerHTML = list.map(p => `
-    <article class="card reveal" data-id="${p.id}">
-      <div class="thumb">
-        <img src="${p.img}" alt="${p.name}">
-        <span class="badge">${p.badge}</span>
-      </div>
-      <div class="card-body">
-        <h3>${p.name}</h3>
-        <p>${p.desc}</p>
-        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
-          <span class="price">$${p.price.toFixed(2)}</span>
-          <div style="display:flex;gap:8px;">
-            <button class="btn btn-ghost view" data-id="${p.id}">View</button>
-            <button class="btn btn-primary add" data-id="${p.id}">Add</button>
-          </div>
+// ---------- UTILITIES ----------
+const $ = (s, c = document) => c.querySelector(s);
+const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
+
+document.addEventListener('DOMContentLoaded', () => {
+  $('#year').textContent = new Date().getFullYear();
+
+  // ---------- STRIPE + PRODUCT DATA ----------
+  const STRIPE = {
+    'Lion Muscle Tee': 'https://buy.stripe.com/00wfZhf94gYv49U4nJ14405',
+    'Tiger Muscle Tee': 'https://buy.stripe.com/eVq6oH3qmcIffSCbQb14403',
+    'Bear Muscle Tee': 'https://buy.stripe.com/00w8wPe508rZ8qa2fB14404',
+    'Gorilla Muscle Tee': 'https://buy.stripe.com/fZu8wP2mi8rZbCmf2n14401',
+    'Wolf Muscle Tee': 'https://buy.stripe.com/cNicN5d0W4bJ9ue7zV14402',
+  };
+
+  // Per-size prices (Tiger & Wolf = $35, others = $30; 2XL +$2)
+  const PRODUCTS = [
+    {
+      title: 'Lion Muscle Tee',
+      img: 'lion-logo.jpg',
+      category: 'big-cat',
+      imgs: ['lion-logo.jpg', 'lion-front.jpg', 'lion-detail.jpg'],
+      variantPrices: { XS: 30, S: 30, M: 30, L: 30, XL: 30, '2XL': 32 },
+    },
+    {
+      title: 'Tiger Muscle Tee',
+      img: 'tiger-logo.jpg',
+      category: 'big-cat',
+      imgs: ['tiger-logo.jpg', 'tiger-front.jpg', 'tiger-detail.jpg'],
+      variantPrices: { XS: 35, S: 35, M: 35, L: 35, XL: 35, '2XL': 37 },
+    },
+    {
+      title: 'Bear Muscle Tee',
+      img: 'bear-logo.jpg',
+      category: 'power',
+      imgs: ['bear-logo.jpg', 'bear-front.jpg', 'bear-detail.jpg'],
+      variantPrices: { XS: 30, S: 30, M: 30, L: 30, XL: 30, '2XL': 32 },
+    },
+    {
+      title: 'Gorilla Muscle Tee',
+      img: 'gorilla-logo.jpg',
+      category: 'power',
+      imgs: ['gorilla-logo.jpg', 'gorilla-front.jpg', 'gorilla-detail.jpg'],
+      variantPrices: { XS: 30, S: 30, M: 30, L: 30, XL: 30, '2XL': 32 },
+    },
+    {
+      title: 'Wolf Muscle Tee',
+      img: 'wolf-logo.jpg',
+      category: 'pack',
+      imgs: ['wolf-logo.jpg', 'wolf-front.jpg', 'wolf-detail.jpg'],
+      variantPrices: { XS: 35, S: 35, M: 35, L: 35, XL: 35, '2XL': 37 },
+    },
+  ];
+
+  // ---------- ELEMENTS ----------
+  const grid = $('#productGrid');
+  const cartBtn = $('#cartBtn');
+  const cartDrawer = $('#cartDrawer');
+  const closeCart = $('#closeCart');
+  const cartItemsEl = $('#cartItems');
+  const cartTotalEl = $('#cartTotal');
+  const checkoutBtn = $('#checkoutBtn');
+  const modal = $('#productModal');
+  const modalBody = $('#modalBody');
+  const modalClose = $('#modalClose');
+
+  // ---------- HELPERS ----------
+  const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
+
+  // ---------- RENDER PRODUCTS ----------
+  function renderProducts() {
+    grid.innerHTML = '';
+    PRODUCTS.forEach((p) => {
+      const defaultPrice = p.variantPrices.M ?? Object.values(p.variantPrices)[0];
+
+      const card = document.createElement('div');
+      card.className = `product ${p.category}`;
+      card.style.border = '2px solid #000';
+      card.style.borderRadius = '12px';
+      card.style.padding = '12px';
+      card.style.textAlign = 'center';
+
+      card.innerHTML = `
+        <button class="img-open" aria-label="Open gallery" style="all:unset;cursor:zoom-in;display:block">
+          <img src="${p.img}" alt="${p.title}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;">
+        </button>
+
+        <h2 style="margin:8px 0 4px">${p.title}</h2>
+        <div class="price" data-price>${money(defaultPrice)}</div>
+
+        <div class="actions" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px">
+          <select class="size" aria-label="Choose size" style="padding:6px;border:1px solid #ccc;border-radius:6px">
+            <option value="">Select size…</option>
+            ${Object.keys(p.variantPrices)
+              .map((s) => `<option>${s}</option>`)
+              .join('')}
+          </select>
+          <button class="btn add">Add to Cart</button>
+          <a class="btn" href="${STRIPE[p.title] || '#'}" target="_blank" rel="noopener">Buy Now</a>
         </div>
-      </div>
-    </article>
-  `).join('');
-  $$('.card.reveal').forEach(el=>io.observe(el));
-}
-render();
-
-// Filters
-$('.filters')?.addEventListener('click', e=>{
-  const btn = e.target.closest('.filter'); if(!btn) return;
-  $$('.filter').forEach(b=>b.classList.remove('is-active'));
-  btn.classList.add('is-active');
-  render(btn.dataset.filter);
-});
+      `;
 
-// ---------- Modal ----------
-const modal = $('#productModal');
-const modalBody = $('#modalBody');
-$('#modalClose').addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
-modal.addEventListener('click', e=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true'); });
-
-grid.addEventListener('click', e=>{
-  const v = e.target.closest('.view'); if(!v) return;
-  const p = products.find(x=>x.id===v.dataset.id);
-  modalBody.innerHTML = `
-    <div class="detail">
-      <img src="${p.img}" alt="${p.name}">
-      <div>
-        <h3>${p.name}</h3>
-        <p>${p.desc}</p>
-        <p class="price" style="margin:8px 0 12px;">$${p.price.toFixed(2)}</p>
-        <button class="btn btn-primary" id="detailAdd">Add to Cart</button>
-      </div>
-    </div>`;
-  modal.setAttribute('aria-hidden','false');
-  $('#detailAdd').addEventListener('click', ()=> addToCart(p.id));
-});
+      const sizeEl = card.querySelector('.size');
+      const priceEl = card.querySelector('[data-price]');
+      const addBtn = card.querySelector('.add');
+      const imgOpen = card.querySelector('.img-open');
 
-// ---------- Cart ----------
-let cart = [];
-const cartBtn = $('#cartBtn');
-const drawer = $('#cartDrawer');
-const closeCart = $('#closeCart');
-const itemsEl = $('#cartItems');
-const totalEl = $('#cartTotal');
-
-cartBtn.addEventListener('click', ()=>{
-  const hidden = drawer.getAttribute('aria-hidden')==='true';
-  drawer.setAttribute('aria-hidden', hidden?'false':'true');
-});
-closeCart.addEventListener('click', ()=> drawer.setAttribute('aria-hidden','true'));
+      function updatePrice() {
+        const sz = sizeEl.value;
+        const base = p.variantPrices[sz] ?? defaultPrice;
+        priceEl.textContent = money(base);
+      }
+      sizeEl.addEventListener('change', updatePrice);
 
-function addToCart(id){
-  const p = products.find(x=>x.id===id);
-  const ex = cart.find(x=>x.id===id);
-  if(ex) ex.qty += 1; else cart.push({id:p.id,name:p.name,price:p.price,img:p.img,qty:1});
-  renderCart();
-}
-grid.addEventListener('click', e=>{
-  const add = e.target.closest('.add'); if(add) addToCart(add.dataset.id);
-});
+      addBtn.addEventListener('click', (e) => {
+        e.preventDefault();
+        const sz = sizeEl.value;
+        if (!sz) {
+          alert('Please select a size.');
+          sizeEl.focus();
+          return;
+        }
+        const unit = p.variantPrices[sz];
+        addToCart({ title: p.title, size: sz, unitPrice: unit, stripe: STRIPE[p.title] });
+      });
+
+      imgOpen.addEventListener('click', (e) => {
+        e.preventDefault();
+        openGallery(p);
+      });
 
-function renderCart(){
-  if(cart.length===0){
-    itemsEl.innerHTML = `<p style="color:#9aa3b2">Your cart is empty.</p>`;
-    totalEl.textContent = '0.00';
-    return;
+      grid.appendChild(card);
+    });
   }
-  itemsEl.innerHTML = cart.map(i=>`
-    <div class="ci">
-      <img src="${i.img}" alt="${i.name}" />
-      <div style="display:grid;gap:4px;">
-        <strong>${i.name}</strong>
-        <div style="display:flex;align-items:center;gap:8px;">
-          <button class="icon-btn q" data-id="${i.id}" data-d="-1">−</button>
-          <span>${i.qty}</span>
-          <button class="icon-btn q" data-id="${i.id}" data-d="1">+</button>
+
+  // ---------- GALLERY / LIGHTBOX ----------
+  function openGallery(p) {
+    const imgs = Array.isArray(p.imgs) && p.imgs.length ? p.imgs : [p.img];
+    let idx = 0;
+
+    function render() {
+      modalBody.innerHTML = `
+        <div style="display:grid;grid-template-columns:1fr;gap:12px;max-width:min(92vw,900px)">
+          <div style="position:relative">
+            <button id="prev" aria-label="Previous" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);border:1px solid #000;background:#fff;padding:6px 10px;border-radius:8px;cursor:pointer">‹</button>
+            <img id="mainImg" src="${imgs[idx]}" alt="${p.title}" style="width:100%;height:auto;max-height:72vh;object-fit:contain;border-radius:12px;border:2px solid #000;background:#fff">
+            <button id="next" aria-label="Next" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:1px solid #000;background:#fff;padding:6px 10px;border-radius:8px;cursor:pointer">›</button>
+          </div>
+          <div>
+            ${imgs
+              .map(
+                (src, i) => `
+                  <button class="thumb ${i === idx ? 'is-active' : ''}" data-i="${i}" style="all:unset;cursor:pointer;display:inline-block;margin:4px">
+                    <img src="${src}" alt="thumb ${i + 1}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;border:2px solid ${i === idx ? '#000' : '#ccc'}">
+                  </button>
+                `,
+              )
+              .join('')}
+          </div>
         </div>
-      </div>
-      <div class="price">$${(i.price*i.qty).toFixed(2)}</div>
-    </div>
-  `).join('');
-  totalEl.textContent = cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2);
-}
-itemsEl.addEventListener('click', e=>{
-  const q = e.target.closest('.q'); if(!q) return;
-  const id = q.dataset.id; const d = Number(q.dataset.d);
-  const it = cart.find(x=>x.id===id); if(!it) return;
-  it.qty += d; if(it.qty<=0) cart = cart.filter(x=>x.id!==id);
+      `;
+      modalBody.querySelectorAll('.thumb').forEach((b) => {
+        b.addEventListener('click', () => {
+          idx = Number(b.dataset.i);
+          render();
+        });
+      });
+      modalBody.querySelector('#prev').onclick = () => {
+        idx = (idx - 1 + imgs.length) % imgs.length;
+        render();
+      };
+      modalBody.querySelector('#next').onclick = () => {
+        idx = (idx + 1) % imgs.length;
+        render();
+      };
+    }
+
+    render();
+    modal.setAttribute('aria-hidden', 'false');
+
+    function onKey(e) {
+      if (e.key === 'Escape') {
+        close();
+      }
+      if (e.key === 'ArrowLeft') {
+        modalBody.querySelector('#prev')?.click();
+      }
+      if (e.key === 'ArrowRight') {
+        modalBody.querySelector('#next')?.click();
+      }
+    }
+    document.addEventListener('keydown', onKey);
+
+    function close() {
+      modal.setAttribute('aria-hidden', 'true');
+      document.removeEventListener('keydown', onKey);
+    }
+    modal.addEventListener(
+      'click',
+      (e) => {
+        if (e.target === modal) close();
+      },
+      { once: true },
+    );
+    modalClose?.addEventListener('click', close, { once: true });
+  }
+
+  // ---------- CART ----------
+  let cart = []; // {title,size,unitPrice,qty,stripe}
+
+  function addToCart(item) {
+    const existing = cart.find((i) => i.title === item.title && i.size === item.size);
+    if (existing) {
+      existing.qty += 1;
+    } else {
+      cart.push({ ...item, qty: 1 });
+    }
+    renderCart();
+    cartDrawer.setAttribute('aria-hidden', 'false');
+  }
+
+  function removeLine(idx) {
+    cart.splice(idx, 1);
+    renderCart();
+  }
+
+  function totals() {
+    const subtotal = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0);
+    return { subtotal, total: subtotal };
+  }
+
+  function renderCart() {
+    if (cart.length === 0) {
+      cartItemsEl.innerHTML = `<div style="color:#666">Cart empty</div>`;
+      cartTotalEl.textContent = (0).toFixed(2);
+      checkoutBtn.textContent = 'Checkout';
+      checkoutBtn.onclick = (e) => {
+        e.preventDefault();
+        alert('Please add a product first.');
+      };
+      return;
+    }
+
+    cartItemsEl.innerHTML = cart
+      .map(
+        (i, idx) => `
+          <div class="cart-row" style="display:flex;justify-content:space-between;align-items:center;margin:6px 0;gap:10px;">
+            <div>
+              <div style="font-weight:700">${i.title}</div>
+              <div style="font-size:.9rem;color:#555">Size: ${i.size} · ${money(i.unitPrice)}</div>
+            </div>
+            <div style="display:flex;align-items:center;gap:8px;">
+              <span>x${i.qty}</span>
+              <strong>${money(i.qty * i.unitPrice)}</strong>
+              <button class="icon-btn" aria-label="Remove" data-remove="${idx}">✕</button>
+            </div>
+          </div>
+        `,
+      )
+      .join('');
+
+    cartItemsEl.querySelectorAll('[data-remove]').forEach((btn) => {
+      btn.addEventListener('click', () => removeLine(Number(btn.getAttribute('data-remove'))));
+    });
+
+    const { total } = totals();
+    cartTotalEl.textContent = total.toFixed(2);
+
+    const last = cart[cart.length - 1];
+    checkoutBtn.textContent = `Checkout — ${last.title}`;
+    checkoutBtn.onclick = (e) => {
+      e.preventDefault();
+      if (!last?.stripe) {
+        alert('Missing Stripe link');
+        return;
+      }
+      window.open(last.stripe, '_blank', 'noopener');
+    };
+  }
+
+  // Drawer open/close
+  cartBtn?.addEventListener('click', () => cartDrawer.setAttribute('aria-hidden', 'false'));
+  closeCart?.addEventListener('click', () => cartDrawer.setAttribute('aria-hidden', 'true'));
+
+  // ---------- FILTERS ----------
+  $$('.filter').forEach((button) => {
+    button.addEventListener('click', () => {
+      const filter = button.getAttribute('data-filter');
+      $$('.filter').forEach((b) => b.classList.remove('is-active'));
+      button.classList.add('is-active');
+      $$('#productGrid .product').forEach((prod) => {
+        prod.style.display = filter === 'all' || prod.classList.contains(filter) ? 'block' : 'none';
+      });
+    });
+  });
+
+  // ---------- LOOKBOOK: use same modal ----------
+  $$('.lookbook-grid img').forEach((img) => {
+    img.style.cursor = 'zoom-in';
+    img.addEventListener('click', () => {
+      modalBody.innerHTML = `
+        <div style="padding:8px">
+          <img src="${img.src}" alt="${img.alt || ''}" style="width:100%;height:100%;object-fit:contain;border-radius:12px;border:2px solid #000;background:#fff">
+        </div>`;
+      modal.setAttribute('aria-hidden', 'false');
+    });
+  });
+  modalClose?.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
+  modal.addEventListener('click', (e) => {
+    if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
+  });
+
+  // ---------- CONTACT FORM (demo) ----------
+  $('#contactForm')?.addEventListener('submit', (e) => {
+    e.preventDefault();
+    alert('Thanks! We’ll get back to you soon.');
+    e.target.reset();
+  });
+
+  // ---------- INITIALIZE ----------
+  renderProducts();
   renderCart();
-});
 
-// Contact (demo)
-$('#contactForm')?.addEventListener('submit', e=>{
-  e.preventDefault();
-  alert('Thanks! We’ll get back to you soon.');
-  e.target.reset();
+  // Reveal-on-load for .reveal items (simple)
+  $$('.reveal').forEach((el) => el.classList.add('in'));
 });
 
EOF
)
