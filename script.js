// ---------- Utilities ----------
const $ = (s, c=document)=>c.querySelector(s);
const $$ = (s, c=document)=>Array.from(c.querySelectorAll(s));
$('#year').textContent = new Date().getFullYear();

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
  });
},{threshold:.15});
$$('.reveal').forEach(el=>io.observe(el));

// ---------- Data ----------
// Your images are in the repo root, so the paths are just the filenames.
const products = [
  { id:'lion',    name:'Lion Tee',    price:29.99, img:'lion-logo.jpg',    desc:'Lead like a king.',      tag:'big-cat', badge:'Drop' },
  { id:'tiger',   name:'Tiger Tee',   price:29.99, img:'tiger-logo.jpg',   desc:'Strike fast. Stay sharp.', tag:'big-cat', badge:'Hot' },
  { id:'bear',    name:'Bear Tee',    price:29.99, img:'bear-logo.jpg',    desc:'Grit and resilience.',  tag:'power',   badge:'Core' },
  { id:'gorilla', name:'Gorilla Tee', price:29.99, img:'gorilla-logo.jpg', desc:'Raw strength.',         tag:'power',   badge:'Core' },
  { id:'wolf',    name:'Wolf Tee',    price:29.99, img:'wolf-logo.jpg',    desc:'Run with the pack.',    tag:'pack',    badge:'New' }
];

// ---------- Render ----------
const grid = $('#productGrid');
function render(filter='all'){
  const list = products.filter(p => filter==='all' ? true : p.tag===filter);
  grid.innerHTML = list.map(p => `
    <article class="card reveal" data-id="${p.id}">
      <div class="thumb">
        <img src="${p.img}" alt="${p.name}">
        <span class="badge">${p.badge}</span>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <span class="price">$${p.price.toFixed(2)}</span>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost view" data-id="${p.id}">View</button>
            <button class="btn btn-primary add" data-id="${p.id}">Add</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
  $$('.card.reveal').forEach(el=>io.observe(el));
}
render();

// Filters
$('.filters')?.addEventListener('click', e=>{
  const btn = e.target.closest('.filter'); if(!btn) return;
  $$('.filter').forEach(b=>b.classList.remove('is-active'));
  btn.classList.add('is-active');
  render(btn.dataset.filter);
});

// ---------- Modal ----------
const modal = $('#productModal');
const modalBody = $('#modalBody');
$('#modalClose').addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', e=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true'); });

grid.addEventListener('click', e=>{
  const v = e.target.closest('.view'); if(!v) return;
  const p = products.find(x=>x.id===v.dataset.id);
  modalBody.innerHTML = `
    <div class="detail">
      <img src="${p.img}" alt="${p.name}">
      <div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <p class="price" style="margin:8px 0 12px;">$${p.price.toFixed(2)}</p>
        <button class="btn btn-primary" id="detailAdd">Add to Cart</button>
      </div>
    </div>`;
  modal.setAttribute('aria-hidden','false');
  $('#detailAdd').addEventListener('click', ()=> addToCart(p.id));
});

// ---------- Cart ----------
let cart = [];
const cartBtn = $('#cartBtn');
const drawer = $('#cartDrawer');
const closeCart = $('#closeCart');
const itemsEl = $('#cartItems');
const totalEl = $('#cartTotal');

cartBtn.addEventListener('click', ()=>{
  const hidden = drawer.getAttribute('aria-hidden')==='true';
  drawer.setAttribute('aria-hidden', hidden?'false':'true');
});
closeCart.addEventListener('click', ()=> drawer.setAttribute('aria-hidden','true'));

function addToCart(id){
  const p = products.find(x=>x.id===id);
  const ex = cart.find(x=>x.id===id);
  if(ex) ex.qty += 1; else cart.push({id:p.id,name:p.name,price:p.price,img:p.img,qty:1});
  renderCart();
}
grid.addEventListener('click', e=>{
  const add = e.target.closest('.add'); if(add) addToCart(add.dataset.id);
});

function renderCart(){
  if(cart.length===0){
    itemsEl.innerHTML = `<p style="color:#9aa3b2">Your cart is empty.</p>`;
    totalEl.textContent = '0.00';
    return;
  }
  itemsEl.innerHTML = cart.map(i=>`
    <div class="ci">
      <img src="${i.img}" alt="${i.name}" />
      <div style="display:grid;gap:4px;">
        <strong>${i.name}</strong>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="icon-btn q" data-id="${i.id}" data-d="-1">−</button>
          <span>${i.qty}</span>
          <button class="icon-btn q" data-id="${i.id}" data-d="1">+</button>
        </div>
      </div>
      <div class="price">$${(i.price*i.qty).toFixed(2)}</div>
    </div>
  `).join('');
  totalEl.textContent = cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2);
}
itemsEl.addEventListener('click', e=>{
  const q = e.target.closest('.q'); if(!q) return;
  const id = q.dataset.id; const d = Number(q.dataset.d);
  const it = cart.find(x=>x.id===id); if(!it) return;
  it.qty += d; if(it.qty<=0) cart = cart.filter(x=>x.id!==id);
  renderCart();
});

// Contact (demo)
$('#contactForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  alert('Thanks! We’ll get back to you soon.');
  e.target.reset();
});
