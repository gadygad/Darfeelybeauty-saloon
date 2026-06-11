/* =============================================
   DARFEELY BEAUTY — Modern App JS
   ============================================= */

'use strict';

/* ─── State ─────────────────────────────────── */
const state = {
  cart: [],
  panelOpen: null,   // 'account' | 'cart' | 'menu' | null
  viewerData: null,
};

/* ─── DOM References ────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const overlay       = $('overlay');
const navbar        = $('navbar');
const searchBtn     = $('searchBtn');
const searchBar     = $('searchBar');
const searchInput   = $('searchInput');
const accountBtn    = $('accountBtn');
const accountPanel  = $('accountPanel');
const accountClose  = $('accountClose');
const cartBtn       = $('cartBtn');
const cartPanel     = $('cartPanel');
const cartClose     = $('cartClose');
const cartBadge     = $('cartBadge');
const cartTotal     = $('cartTotalDisplay');
const cartList      = $('cartItemsList');
const menuBtn       = $('menuBtn');
const menuPanel     = $('menuPanel');
const menuClose     = $('menuClose');
const productViewer = $('productViewer');
const viewerClose   = $('viewerClose');
const viewerImg     = $('viewerImg');
const viewerName    = $('viewerName');
const viewerOld     = $('viewerPriceOld');
const viewerNew     = $('viewerPriceNew');
const viewerQty     = $('viewerQty');
const viewerAddCart = $('viewerAddCart');
const viewerBuyNow  = $('viewerBuyNow');
const subscribeBtn  = $('subscribeBtn');

/* ─── Navbar scroll effect ──────────────────── */
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveTab();
});

/* ─── Panel Management ───────────────────────── */
function openPanel(name) {
  closeAll();
  state.panelOpen = name;
  overlay.classList.add('active');

  if (name === 'account') {
    accountPanel.classList.add('active');
    accountBtn.classList.add('active');
  } else if (name === 'cart') {
    cartPanel.classList.add('active');
    cartBtn.classList.add('active');
  } else if (name === 'menu') {
    menuPanel.classList.add('active');
    menuBtn.classList.add('active');
  } else if (name === 'search') {
    searchBar.classList.add('active');
    searchBtn.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
  }
}

function closeAll() {
  state.panelOpen = null;
  overlay.classList.remove('active');
  accountPanel.classList.remove('active');
  cartPanel.classList.remove('active');
  menuPanel.classList.remove('active');
  searchBar.classList.remove('active');
  productViewer.classList.remove('active');
  [accountBtn, cartBtn, menuBtn, searchBtn].forEach(b => b.classList.remove('active'));
}

/* ─── Navbar button handlers ─────────────────── */
searchBtn.addEventListener('click', () => {
  state.panelOpen === 'search' ? closeAll() : openPanel('search');
});

accountBtn.addEventListener('click', () => {
  state.panelOpen === 'account' ? closeAll() : openPanel('account');
});

cartBtn.addEventListener('click', () => {
  renderCart();
  state.panelOpen === 'cart' ? closeAll() : openPanel('cart');
});

menuBtn.addEventListener('click', () => {
  state.panelOpen === 'menu' ? closeAll() : openPanel('menu');
});

accountClose.addEventListener('click', closeAll);
cartClose.addEventListener('click', closeAll);
menuClose.addEventListener('click', closeAll);
overlay.addEventListener('click', closeAll);

/* ─── Auth Tabs ──────────────────────────────── */
const loginTab     = $('loginTab');
const registerTab  = $('registerTab');
const loginForm    = $('loginForm');
const registerForm = $('registerForm');
const toRegister   = $('toRegister');
const toLogin      = $('toLogin');
const authWarning  = $('authWarning');
const authWarnTxt  = $('authWarningText');

function switchAuth(tab) {
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  }
  authWarning.classList.remove('active');
}

loginTab.addEventListener('click', () => switchAuth('login'));
registerTab.addEventListener('click', () => switchAuth('register'));
toRegister.addEventListener('click', (e) => { e.preventDefault(); switchAuth('register'); });
toLogin.addEventListener('click', (e) => { e.preventDefault(); switchAuth('login'); });

/* Password toggles */
function setupPassToggle(toggleId, inputId) {
  const toggle = $(toggleId);
  const input  = $(inputId);
  if (!toggle || !input) return;
  toggle.addEventListener('click', () => {
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    toggle.classList.toggle('fa-eye', !hidden);
    toggle.classList.toggle('fa-eye-slash', hidden);
  });
}

setupPassToggle('toggleLoginPass', 'loginPassword');
setupPassToggle('toggleRegPass', 'regPassword');

/* Form submissions */
$('loginFormEl').addEventListener('submit', (e) => {
  e.preventDefault();
  showWarning('Login feature coming soon — stay tuned!');
});

$('registerFormEl').addEventListener('submit', (e) => {
  e.preventDefault();
  showWarning('Registration coming soon — stay tuned!');
});

function showWarning(msg) {
  authWarnTxt.textContent = msg;
  authWarning.classList.add('active');
  setTimeout(() => authWarning.classList.remove('active'), 4000);
}

/* ─── Menu accordion ─────────────────────────── */
function setupMenuToggle(toggleId, subId) {
  const toggle = $(toggleId);
  const sub    = $(subId);
  if (!toggle || !sub) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    sub.classList.toggle('open');
  });
}

setupMenuToggle('productsToggle', 'productsSub');
setupMenuToggle('servicesToggle', 'servicesSub');

/* ─── Cart Logic ─────────────────────────────── */
function addToCart(name, img, price, oldPrice) {
  const existing = state.cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ name, img, price: parsePrice(price), oldPrice, qty: 1 });
  }
  updateCartBadge();
  showToast(`✓ ${name} added to cart`);
}

function parsePrice(str) {
  return parseInt(String(str).replace(/[^0-9]/g, ''), 10) || 0;
}

function removeFromCart(name) {
  state.cart = state.cart.filter(i => i.name !== name);
  updateCartBadge();
  renderCart();
}

function updateCartQty(name, qty) {
  const item = state.cart.find(i => i.name === name);
  if (!item) return;
  item.qty = Math.max(1, parseInt(qty) || 1);
  renderCart();
}

function updateCartBadge() {
  const total = state.cart.reduce((sum, i) => sum + i.qty, 0);
  cartBadge.textContent = total;
  cartBadge.style.display = total > 0 ? 'flex' : 'none';
}

function getCartTotal() {
  return state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  if (state.cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align:center;padding:40px 0;color:var(--text-muted);">
        <i class="fa-solid fa-bag-shopping" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:0.3;"></i>
        <p style="font-size:0.9rem;">Your cart is empty</p>
        <p style="font-size:0.8rem;margin-top:4px;">Add some beautiful products!</p>
      </div>`;
    cartTotal.textContent = 'TZS 0';
    return;
  }

  cartList.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" loading="lazy">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">TZS ${(item.price * item.qty).toLocaleString()}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="dec" data-name="${item.name}">−</button>
        <input type="number" class="qty-input" value="${item.qty}" min="1" data-name="${item.name}">
        <button class="qty-btn" data-action="inc" data-name="${item.name}">+</button>
        <button class="qty-btn" data-action="remove" data-name="${item.name}" style="color:var(--primary);font-size:0.8rem;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  /* Event listeners for qty controls */
  cartList.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name   = btn.dataset.name;
      const action = btn.dataset.action;
      const item   = state.cart.find(i => i.name === name);
      if (!item) return;

      if (action === 'inc') item.qty += 1;
      else if (action === 'dec') { if (item.qty > 1) item.qty -= 1; }
      else if (action === 'remove') removeFromCart(name);
      updateCartBadge();
      renderCart();
    });
  });

  cartList.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', () => updateCartQty(inp.dataset.name, inp.value));
  });

  cartTotal.textContent = `TZS ${getCartTotal().toLocaleString()}`;
}

/* Checkout */
document.addEventListener('click', (e) => {
  if (e.target.closest('#checkoutBtn')) {
    const phone = '255782515322';
    const items = state.cart.map(i => `${i.name} x${i.qty}`).join(', ');
    const total = `TZS ${getCartTotal().toLocaleString()}`;
    const msg = encodeURIComponent(`Hello Darfeely Beauty! 🌸\nI'd like to order:\n${items}\nTotal: ${total}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }
});

/* ─── Product Cards ──────────────────────────── */
document.addEventListener('click', (e) => {

  /* Add to cart button */
  const addBtn = e.target.closest('.add-to-cart-btn');
  if (addBtn) {
    e.stopPropagation();
    const card = addBtn.closest('.product-card');
    if (!card) return;
    addToCart(
      card.dataset.name,
      card.dataset.img,
      card.dataset.price,
      card.dataset.old
    );
    return;
  }

  /* Quick view button */
  const qvBtn = e.target.closest('.card-quick-view');
  if (qvBtn) {
    e.stopPropagation();
    const card = qvBtn.closest('.product-card');
    if (!card) return;
    openViewer(card.dataset);
    return;
  }

  /* Card click → open viewer */
  const card = e.target.closest('.product-card');
  if (card && !e.target.closest('button')) {
    openViewer(card.dataset);
  }
});

/* ─── Product Viewer ─────────────────────────── */
function openViewer(data) {
  state.viewerData = data;
  viewerImg.src  = data.img;
  viewerName.textContent = data.name;
  viewerOld.textContent  = `TZS ${data.old}`;
  viewerNew.textContent  = `TZS ${data.price}`;
  viewerQty.value = 1;
  closeAll();
  overlay.classList.add('active');
  productViewer.classList.add('active');
}

function closeViewer() {
  productViewer.classList.remove('active');
  overlay.classList.remove('active');
  state.viewerData = null;
}

viewerClose.addEventListener('click', closeViewer);

/* Quantity updates viewer price */
viewerQty.addEventListener('input', () => {
  const qty = Math.max(1, parseInt(viewerQty.value) || 1);
  viewerQty.value = qty;
  if (state.viewerData) {
    const base = parsePrice(state.viewerData.price);
    viewerNew.textContent = `TZS ${(base * qty).toLocaleString()}`;
  }
});

viewerAddCart.addEventListener('click', () => {
  if (!state.viewerData) return;
  const qty = parseInt(viewerQty.value) || 1;
  for (let i = 0; i < qty; i++) {
    addToCart(state.viewerData.name, state.viewerData.img, state.viewerData.price, state.viewerData.old);
  }
  closeViewer();
});

viewerBuyNow.addEventListener('click', () => {
  if (!state.viewerData) return;
  const qty   = parseInt(viewerQty.value) || 1;
  const phone = '255782515322';
  const total = parsePrice(state.viewerData.price) * qty;
  const msg   = encodeURIComponent(`Hello Darfeely Beauty! 🌸\nI'd like to buy:\n${state.viewerData.name} x${qty}\nTotal: TZS ${total.toLocaleString()}`);
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
});

/* ─── Category Tab active highlight ─────────────── */
const sections = $$('.products-section');
const catTabs  = $$('.cat-tab');

function updateActiveTab() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top < 160) current = sec.id;
  });
  catTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.cat === current);
  });
}

/* ─── Scroll Reveal ──────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

$$('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Newsletter ─────────────────────────────── */
subscribeBtn.addEventListener('click', () => {
  const email = $('newsletterEmail').value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address.');
    return;
  }
  showToast(`✓ Subscribed! Welcome to Darfeely Beauty, ${email.split('@')[0]}!`);
  $('newsletterEmail').value = '';
});

/* ─── Toast Notification ─────────────────────── */
let toastTimer;

function showToast(msg) {
  let toast = document.getElementById('darfToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'darfToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--bg-card);
      border: 1px solid var(--primary);
      color: var(--text-primary);
      padding: 12px 24px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s ease;
      box-shadow: 0 8px 32px var(--primary-glow);
      max-width: 90vw;
      text-align: center;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  clearTimeout(toastTimer);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}

/* ─── Keyboard Escape ────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAll();
    closeViewer();
  }
});

/* ─── Search Filter ──────────────────────────── */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  $$('.product-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    card.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
});

/* ─── Add dynamic event listeners for Quick View / Cart ────────────── */
function attachCardListeners(card) {
  const qvBtns = card.querySelectorAll('.card-quick-view');
  const addBtn = card.querySelector('.add-to-cart-btn');
  const name   = card.dataset.name;
  const img    = card.dataset.img;
  const oldP   = card.dataset.old;
  const newP   = card.dataset.price;

  qvBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickView(name, img, oldP, newP);
    });
  });

  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const numPrice = parseInt(newP.replace(/,/g, ''));
      addToCart({ name, price: numPrice, img, qty: 1 });
      
      const icon = addBtn.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-check';
        setTimeout(() => { icon.className = 'fa-solid fa-plus'; }, 1000);
      }
    });
  }
}

/* ─── Dynamic Product Fetching (Backend Integration) ───────────────── */
async function fetchAndRenderProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) return;
    
    const products = await response.json();
    
    const lipsticksGrid = document.querySelector('#lipsticks .products-grid');
    const lashesGrid = document.querySelector('#lashes .products-grid');
    const accessoriesGrid = document.querySelector('#tweezers .products-grid'); // Fallback for accessories
    
    products.forEach(product => {
      // Format price with commas
      const formattedPrice = product.price.toLocaleString();
      
      const cardHTML = `
        <div class="product-card" data-name="${product.name}" data-img="assets/${product.image_filename}" data-old="" data-price="${formattedPrice}">
          <div class="card-img-wrap">
            <img src="assets/${product.image_filename}" alt="${product.name}" loading="lazy">
            <span class="card-badge badge-new" style="background:var(--secondary)">New</span>
            <div class="card-quick-actions">
              <button class="quick-action-btn" title="Wishlist"><i class="fa-regular fa-heart"></i></button>
              <button class="quick-action-btn card-quick-view" title="Quick View"><i class="fa-solid fa-eye"></i></button>
            </div>
            <div class="card-img-overlay"></div>
            <button class="btn btn-primary card-view-btn card-quick-view">Quick View</button>
          </div>
          <div class="card-body">
            <div class="card-name">${product.name}</div>
            <div class="card-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
            <div class="card-pricing">
              <div class="card-price-group">
                <span class="price-new">TZS ${formattedPrice}</span>
              </div>
              <button class="card-add-btn add-to-cart-btn"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        </div>
      `;
      
      // Create element and attach listeners
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardHTML.trim();
      const newCard = tempDiv.firstChild;
      attachCardListeners(newCard);
      
      // Append to the correct grid based on category
      if (product.category === 'lipsticks' && lipsticksGrid) {
        lipsticksGrid.prepend(newCard);
      } else if (product.category === 'lashes' && lashesGrid) {
        lashesGrid.prepend(newCard);
      } else if (product.category === 'accessories' && accessoriesGrid) {
        accessoriesGrid.prepend(newCard);
      } else if (lipsticksGrid) {
        lipsticksGrid.prepend(newCard); // default fallback
      }
    });
  } catch (error) {
    console.error("Error fetching dynamic products:", error);
  }
}

/* ─── Customer Feedback Fetching & Rendering ─── */
async function fetchAndRenderCustomerFeedbacks() {
  const container = $('feedbackListContainer');
  if (!container) return;

  try {
    const response = await fetch('/api/feedbacks');
    if (!response.ok) throw new Error('Failed to fetch feedbacks');
    
    const feedbacks = await response.json();
    if (feedbacks.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 0;color:var(--text-muted);">
          <i class="fa-regular fa-comment-dots" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:0.3;"></i>
          <p style="font-size:0.9rem;">No feedback yet. Be the first to share your experience!</p>
        </div>`;
      return;
    }

    container.innerHTML = feedbacks.map(item => {
      const initial = (item.name || 'C').trim().charAt(0).toUpperCase();
      
      // Class mapping
      let sourceClass = 'source-other';
      const sourceLower = (item.source || '').toLowerCase();
      if (sourceLower.includes('instagram')) sourceClass = 'source-instagram';
      else if (sourceLower.includes('tiktok')) sourceClass = 'source-tiktok';
      else if (sourceLower.includes('whatsapp')) sourceClass = 'source-whatsapp';
      else if (sourceLower.includes('mouth') || sourceLower.includes('friend') || sourceLower.includes('recommendation')) sourceClass = 'source-word-of-mouth';
      else if (sourceLower.includes('search') || sourceLower.includes('google')) sourceClass = 'source-search-engine';
      else if (sourceLower.includes('advertisement') || sourceLower.includes('ad')) sourceClass = 'source-advertisement';

      // Parse date safely
      let dateStr = '';
      try {
        if (item.created_at) {
          const dateObj = new Date(item.created_at.replace(' ', 'T') + 'Z');
          dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }
      } catch (e) {
        dateStr = item.created_at || '';
      }

      return `
        <div class="feedback-card">
          <div class="feedback-card-header">
            <div class="feedback-user-info">
              <div class="feedback-avatar-placeholder">${initial}</div>
              <div>
                <div class="feedback-user-name">${escapeHTML(item.name)}</div>
                <span class="feedback-source-badge ${sourceClass}">via ${escapeHTML(item.source)}</span>
              </div>
            </div>
            <span class="feedback-card-date">${dateStr}</span>
          </div>
          <p class="feedback-card-comment">${escapeHTML(item.comment)}</p>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    container.innerHTML = `<div style="color:var(--primary);text-align:center;padding:20px;">Failed to load feedbacks.</div>`;
  }
}

// Simple HTML Escaping
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

/* ─── Feedback Form Handler ─── */
const feedbackForm = $('customerFeedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = $('feedbackName').value.trim();
    const source = $('feedbackSource').value;
    const comment = $('feedbackComment').value.trim();
    
    if (!name || !source || !comment) {
      showToast('Please fill out all fields.');
      return;
    }

    const submitBtn = feedbackForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, source, comment })
      });

      if (response.ok) {
        showToast('✓ Feedback submitted successfully! Thank you.');
        feedbackForm.reset();
        fetchAndRenderCustomerFeedbacks();
      } else {
        const err = await response.json();
        showToast(`Error: ${err.error || 'Failed to submit feedback.'}`);
      }
    } catch (error) {
      console.error(error);
      showToast('Network error. Please try again later.');
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
    }
  });
}

// Fetch products and feedbacks when page loads
window.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProducts();
  fetchAndRenderCustomerFeedbacks();
});

/* ─── Init ───────────────────────────────────── */
updateCartBadge();
updateActiveTab();
