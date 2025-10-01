'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Utilities ----------
  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const money = n => n.toLocaleString('en-US', { style:'currency', currency:'USD' });

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Stripe + Product Data ----------
  const STRIPE = {
    'Lion Muscle Tee':    'https://buy.stripe.com/00wfZhf94gYv49U4nJ14405',
    'Tiger Muscle Tee':   'https://buy.stripe.com/eVq6oH3qmcIffSCbQb14403',
    'Bear Muscle Tee':    'https://buy.stripe.com/00w8wPe508rZ8qa2fB14404',
    'Gorilla Muscle Tee': 'https://buy.stripe.com/fZu8wP2mi8rZbCmf2n14401',
    'Wolf Muscle Tee':    'https://buy.stripe.com/cNicN5d0W4bJ9ue7zV14402',
  };

  // If your images are in /images, change to 'images/'
  const IMG_BASE = '';

  // Tiger/Wolf 35, others 30; 2XL +2
  const PRODUCTS = [
    { title:'Lion Muscle Tee', img:IMG_BASE+'lion-logo.jpg', category:'big-cat',
      imgs:[IMG_BASE+'lion-logo.jpg', IMG_BASE+'lion-front.jpg', IMG_BASE+'lion-detail.jpg'],
      variantPrices:{ XS:30, S:30, M:30, L:30, XL:30, '2XL':32 } },
    { title:'Tiger Muscle Tee', img:IMG_BASE+'tiger-logo.jpg', category:'big-cat',
      imgs:[IMG_BASE+'tiger-logo.jpg', IMG_BASE+'tiger-front.jpg', IMG_BASE+'tiger-detail.jpg'],
      variantPrices:{ XS:35, S:35, M:35, L:35, XL:35, '2XL':37 } },
    { title:'Bear Muscle Tee', img:IMG_BASE+'bear-logo.jpg', category:'power',
      imgs:[IMG_BASE+'bear-logo.jpg', IMG_BASE+'bear-front.jpg', IMG_BASE+'bear-detail.jpg'],
      variantPrices:{ XS:30, S:30, M:30, L:30, XL:30, '2XL':32 } },
    { title:'Gorilla Muscle Tee', img:IMG_BASE+'gorilla-logo.jpg', category:'power',
      imgs:[IMG_BASE+'gorilla-logo.jpg', IMG_BASE+'gorilla-front.jpg', IMG_BASE+'gorilla-detail.jpg'],
      variantPrices:{ XS:30, S:30, M:30, L:30, XL:30, '2XL':32 } },
    { title:'Wolf Muscle Tee', img:IMG_BASE+'wolf-logo.jpg', category:'pack',
      imgs:[IMG_BASE+'wolf-logo.jpg', IMG_BASE+'wolf-front.jpg', IMG_BASE+'wolf-detail.jpg'],
      variantPrices:{ XS:35, S:35, M:35, L:35, XL:35, '2XL':37 } },
  ];

  // ---------- Elements ----------
  const grid        = $('#productGrid');
  const cartBtn     = $('#cartBtn');
  const cartDrawer  = $('#cartDrawer');
  const closeCart   = $('#closeCart');
  const cartItemsEl = $('#cartItems');
  const cartTotalEl = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');
  const modal       = $('#productModal');
  const modalBody   = $('#modalBody');
  const modalClose  = $('#modalClose');

  if (!grid) return;

  // ---------- Render Products ----------
  function renderProducts(){
    grid.innerHTML = '';
    PRODUCTS.forEach(p => {
      const defaultPrice = p.variantPrices.M ?? Object.values(p.variantPrices)[0];

      const card = document.createElement('div');
      card.className = `product ${p.category}`;
      card.style.cssText = 'border:2px solid #000;border-radius:12px;padding:12px;text-align:center';

      card.innerHTML = `
        <button class="img-open" aria-label="Open gallery" style="all:unset;cursor:zoom-in;display:block">
          <img src="${p.img}" alt="${p.title}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;">
        </button>

        <h2 style="margin:8px 0 4px">${p.title}</h2>
        <div class="price" data-price>${money(defaultPrice)}</div>

        <div class="actions" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px">
          <select class="size" aria-label="Choose size" style="padding:6px;border:1px solid #ccc;border-radius:6px">
            <option value="">Select size…</option>
            ${Object.keys(p.variantPrices).map(s=>`<option>${s}</option>`).join('')}
          </select>
          <button class="btn view" type="button">View</button>
          <button class="btn add" type="button">Add to Cart</button>
          <a class="btn" href="${STRIPE[p.title] || '#'}" target="_blank" rel="noopener">Buy Now</a>
        </div>
      `;
      grid.appendChild(card);

      const sizeEl  = card.querySelector('.size');
      const priceEl = card.querySelector('[data-price]');
      const addBtn  = card.querySelector('.add');
      const imgOpen = card.querySelector('.img-open');
      const viewBtn = card.querySelector('.view');
      const imgEl   = card.querySelector('img');

      imgEl.onerror = () => console.warn('Image failed to load:', imgEl.src);

      function updatePrice(){
        const sz = sizeEl.value;
        const base = p.variantPrices[sz] ?? defaultPrice;
        priceEl.textContent = money(base);
      }
      sizeEl.addEventListener('change', updatePrice);

      addBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        const sz = sizeEl.value;
        if(!sz){ alert('Please select a size.'); sizeEl.focus(); return; }
        const unit = p.variantPrices[sz];
        addToCart({ title:p.title, size:sz, unitPrice:unit, stripe:STRIPE[p.title] });
      });

      const open = (e)=>{ e.preventDefault(); openGallery(p); };
      imgOpen.addEventListener('click', open);
      viewBtn.addEventListener('click', open);
    });
  }

  // ---------- Gallery / Lightbox ----------
  function openGallery(p){
    if (!modal || !modalBody) return;

    const imgs = Array.isArray(p.imgs) && p.imgs.length ? p.imgs : [p.img];
    let idx = 0;

    function paint(){
      modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr;gap:12px;max-width:min(92vw,900px)">
          <div style="position:relative">
            <button id="prev" aria-label="Previous" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);border:1px solid #000;background:#fff;padding:6px 10px;border-radius:8px;cursor:pointer">‹</button>
            <img id="mainImg" src="${imgs[idx]}" alt="${p.title}" style="width:100%;height:auto;max-height:72vh;object-fit:contain;border-radius:12px;border:2px solid #000;background:#fff">
            <button id="next" aria-label="Next" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:1px solid #000;background:#fff;padding:6px 10px;border-radius:8px;cursor:pointer">›</button>
          </div>
          <div>
            ${imgs.map((src,i)=>`
              <button class="thumb ${i===idx?'is-active':''}" data-i="${i}" style="all:unset;cursor:pointer;display:inline-block;margin:4px">
                <img src="${src}" alt="thumb ${i+1}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;border:2px solid ${i===idx?'#000':'#ccc'}">
              </button>
            `).join('')}
          </div>
        </div>
      `;
      modalBody.querySelectorAll('.thumb').forEach(b=>{
        b.addEventListener('click', ()=>{ idx = Number(b.dataset.i); paint(); });
      });
      modalBody.querySelector('#prev').onclick = ()=>{ idx = (idx-1+imgs.length)%imgs.length; paint(); };
      modalBody.querySelector('#next').onclick = ()=>{ idx = (idx+1)%imgs.length; paint(); };
    }

    function close(){
      modal.setAttribute('aria-hidden','true');
      modal.removeEventListener('click', onBg);
      document.removeEventListener('keydown', onKey);
    }
    function onBg(e){ if(e.target === modal) close(); }
    function onKey(e){
      if(e.key==='Escape') close();
      if(e.key==='ArrowLeft')  modalBody.querySelector('#prev')?.click();
      if(e.key==='ArrowRight') modalBody.querySelector('#next')?.click();
    }

    paint();
    modal.setAttribute('aria-hidden','false');
    modal.addEventListener('click', onBg);
    document.addEventListener('keydown', onKey);
    modalClose?.addEventListener('click', close, { once:true });
  }

  // ---------- Cart ----------
  let cart = []; // {title,size,unitPrice,qty,stripe}

  function addToCart(item){
    const existing = cart.find(i => i.title===item.title && i.size===item.size);
    if(existing){ existing.qty += 1; }
    else { cart.push({...item, qty:1}); }
    renderCart();
    cartDrawer?.setAttribute('aria-hidden','false');
  }
  function removeLine(idx){
    cart.splice(idx,1);
    renderCart();
  }
  function totals(){
    const subtotal = cart.reduce((s,i)=>s + i.qty*i.unitPrice, 0);
    return { subtotal, total:subtotal };
  }
  function renderCart(){
    if(!cartItemsEl || !cartTotalEl || !checkoutBtn) return;

    if(cart.length===0){
      cartItemsEl.innerHTML = `<div style="color:#666">Cart empty</div>`;
      cartTotalEl.textContent = (0).toFixed(2);
      checkoutBtn.textContent = 'Checkout';
      checkoutBtn.onclick = (e)=>{ e.preventDefault(); alert('Please add a product first.'); };
      return;
    }

    cartItemsEl.innerHTML = cart.map((i,idx)=>`
      <div class="cart-row" style="display:flex;justify-content:space-between;align-items:center;margin:6px 0;gap:10px;">
        <div>
          <div style="font-weight:700">${i.title}</div>
          <div style="font-size:.9rem;color:#555">Size: ${i.size} · ${money(i.unitPrice)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span>x${i.qty}</span>
          <strong>${money(i.qty*i.unitPrice)}</strong>
          <button class="icon-btn" aria-label="Remove" data-remove="${idx}">✕</button>
        </div>
      </div>
    `).join('');

    cartItemsEl.querySelectorAll('[data-remove]').forEach(btn=>{
      btn.addEventListener('click', ()=> removeLine(Number(btn.getAttribute('data-remove'))));
    });

    const { total } = totals();
    cartTotalEl.textContent = total.toFixed(2);

    const last = cart[cart.length-1];
    checkoutBtn.textContent = `Checkout — ${last.title}`;
    checkoutBtn.onclick = (e)=>{
      e.preventDefault();
      if(!last?.stripe){ alert('Missing Stripe link'); return; }
      window.open(last.stripe,'_blank','noopener');
    };
  }

  // Drawer open/close
  cartBtn?.addEventListener('click', ()=> cartDrawer?.setAttribute('aria-hidden','false'));
  closeCart?.addEventListener('click', ()=> cartDrawer?.setAttribute('aria-hidden','true'));

  // ---------- Filters ----------
  $$('.filter').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');
      $$('.filter').forEach(b=>b.classList.remove('is-active'));
      button.classList.add('is-active');
      $$('#productGrid .product').forEach(prod => {
        prod.style.display = (filter==='all' || prod.classList.contains(filter)) ? '' : 'none';
      });
    });
  });

  // ---------- Lookbook (zoom in same modal) ----------
  $$('.lookbook-grid img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      if (!modal || !modalBody) return;
      modalBody.innerHTML = `
        <div style="padding:8px">
          <img src="${img.src}" alt="${img.alt || ''}" style="width:100%;height:100%;object-fit:contain;border-radius:12px;border:2px solid #000;background:#fff">
        </div>`;
      modal.setAttribute('aria-hidden','false');
    });
  });
  modalClose?.addEventListener('click', () => modal?.setAttribute('aria-hidden', 'true'));
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.setAttribute('aria-hidden', 'true'); });

  // ---------- Contact (demo) ----------
  $('#contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! We’ll get back to you soon.');
    e.target.reset();
  });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  },{threshold:.15});
  $$('.reveal').forEach(el=>io.observe(el));

  // ---------- Init ----------
  renderProducts();
  renderCart();
});
