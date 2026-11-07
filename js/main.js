/**
 * Organick — Organic & Eco-Friendly Food Platform
 * Handcrafted Vanilla ES6+ Interactive Engine
 * Designed for 29-Amaliy Ish (Figma node-id: 2:15270)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  initSearchModal();
  initMobileMenu();
  initCategoryFilters();
  initTestimonialsSlider();
  initCounters();
  initNewsletter();
  initContactForm();
  initProductQuickView();
  initBackToTop();
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

/* ==========================================================================
   Shopping Cart Engine (LocalStorage + Drawer)
   ========================================================================== */
const CART_STORAGE_KEY = 'organick_cart_items';

function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {}
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Update badge counter in navbar
  const countBadges = document.querySelectorAll('.cart-count, .cart-quantity');
  countBadges.forEach(badge => {
    badge.textContent = `Cart (${totalCount})`;
    badge.classList.add('badge-bounce');
    setTimeout(() => badge.classList.remove('badge-bounce'), 400);
  });

  // Update drawer contents
  const drawerList = document.querySelector('.cart-drawer-items');
  const drawerSubtotal = document.querySelector('.cart-drawer-subtotal');
  const drawerEmpty = document.querySelector('.cart-drawer-empty');
  const drawerFooter = document.querySelector('.cart-drawer-footer');

  if (drawerList) {
    if (cart.length === 0) {
      drawerList.innerHTML = '';
      if (drawerEmpty) drawerEmpty.style.display = 'block';
      if (drawerFooter) drawerFooter.style.display = 'none';
    } else {
      if (drawerEmpty) drawerEmpty.style.display = 'none';
      if (drawerFooter) drawerFooter.style.display = 'block';

      drawerList.innerHTML = cart.map((item, index) => `
        <div class="cart-drawer-item" data-index="${index}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-qty-control">
              <button type="button" class="qty-btn minus" data-action="decrease" data-id="${item.id}">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button type="button" class="qty-btn plus" data-action="increase" data-id="${item.id}">+</button>
            </div>
          </div>
          <button type="button" class="cart-item-remove" data-id="${item.id}" title="Remove item">&times;</button>
        </div>
      `).join('');
    }
  }

  if (drawerSubtotal) {
    drawerSubtotal.textContent = `$${totalPrice.toFixed(2)}`;
  }
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += product.quantity || 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      category: product.category || 'Organic',
      quantity: product.quantity || 1
    });
  }
  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`);
}

function initCart() {
  // Inject Cart Drawer into DOM if not already present
  if (!document.getElementById('cart-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer-overlay';
    drawer.innerHTML = `
      <div class="cart-drawer-panel">
        <div class="cart-drawer-header">
          <h3 class="cart-drawer-title">Shopping Cart</h3>
          <button type="button" class="cart-drawer-close" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-drawer-body">
          <div class="cart-drawer-empty" style="display:none;">
            <div class="empty-icon">🛒</div>
            <p>Your cart is empty.</p>
            <a href="shop.html" class="primary-button dark-button">Start Shopping</a>
          </div>
          <div class="cart-drawer-items"></div>
        </div>
        <div class="cart-drawer-footer">
          <div class="cart-subtotal-row">
            <span>Subtotal:</span>
            <span class="cart-drawer-subtotal">$0.00</span>
          </div>
          <p class="cart-shipping-note">Shipping and taxes calculated at checkout.</p>
          <button type="button" class="primary-button yellow-button checkout-btn w-100">Proceed to Checkout</button>
          <button type="button" class="cart-clear-btn">Clear Cart</button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  // Trigger Cart Drawer open on navbar cart button click
  const cartTriggers = document.querySelectorAll('.cart-button, .w-commerce-commercecartopenlink, [href="#cart-drawer"]');
  const drawer = document.getElementById('cart-drawer');
  const closeBtn = drawer.querySelector('.cart-drawer-close');

  cartTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Quantity controls and item removal inside drawer
  drawer.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('qty-btn')) {
      const id = target.getAttribute('data-id');
      const action = target.getAttribute('data-action');
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) {
        if (action === 'increase') {
          item.quantity += 1;
        } else if (action === 'decrease') {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            const idx = cart.indexOf(item);
            cart.splice(idx, 1);
          }
        }
        saveCart(cart);
      }
    } else if (target.classList.contains('cart-item-remove')) {
      const id = target.getAttribute('data-id');
      const cart = getCart().filter(i => i.id !== id);
      saveCart(cart);
      showToast('Item removed from cart.');
    } else if (target.classList.contains('cart-clear-btn')) {
      if (confirm('Are you sure you want to clear the cart?')) {
        saveCart([]);
        showToast('Cart cleared.');
      }
    } else if (target.classList.contains('checkout-btn')) {
      const cart = getCart();
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      alert('Thank you for ordering with Organick! Your eco-friendly order is being processed.');
      saveCart([]);
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Attach Add to Cart to product cards on page
  document.querySelectorAll('.product-item, .product-collection-item').forEach((card, idx) => {
    let btn = card.querySelector('.add-to-cart-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'add-to-cart-btn';
      btn.innerHTML = 'Add to Cart <span>+</span>';
      card.appendChild(btn);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const titleElem = card.querySelector('.product-title, h3, h4');
      const priceElem = card.querySelector('.product-price, .discount-price, .product-price-area');
      const imgElem = card.querySelector('.product-image-wrap img, img');
      const catElem = card.querySelector('.product-category-wrap, .product-category');

      let name = titleElem ? titleElem.textContent.trim() : `Organic Product #${idx + 1}`;
      let priceText = priceElem ? priceElem.textContent : '13.00';
      let match = priceText.match(/\$([0-9]+(?:\.[0-9]+)?)/);
      let price = match ? parseFloat(match[1]) : 13.00;
      let img = imgElem ? imgElem.getAttribute('src') : 'assets/images/Product-01.jpg';
      let category = catElem ? catElem.textContent.trim() : 'Organic';
      let id = 'prod_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

      addToCart({ id, name, price, image: img, category, quantity: 1 });
    });
  });

  // Attach Add to Cart to single product forms
  document.querySelectorAll('.w-commerce-commerceaddtocartform, .single-add-to-cart-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const qtyInput = form.querySelector('input[type="number"], .product-quantity');
      const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
      const titleElem = document.querySelector('.product-single-title, h1, .product-title');
      const priceElem = document.querySelector('.product-price, .discount-price, .product-price-area');
      const imgElem = document.querySelector('.product-single-image, .product-lightbox img');

      let name = titleElem ? titleElem.textContent.trim() : 'Calabrese Broccoli';
      let priceText = priceElem ? priceElem.textContent : '$13.00';
      let match = priceText.match(/\$([0-9]+(?:\.[0-9]+)?)/);
      let price = match ? parseFloat(match[1]) : 13.00;
      let img = imgElem ? imgElem.getAttribute('src') : 'assets/images/Product-01.jpg';
      let id = 'prod_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

      addToCart({ id, name, price, image: img, category: 'Vegetable', quantity: qty });
    });
  });

  updateCartUI();
}

/* ==========================================================================
   Search Overlay Modal
   ========================================================================== */
const ORGANIC_PRODUCTS_DATA = [
  { name: 'Calabrese Broccoli', category: 'Vegetable', price: 13.00, oldPrice: 20.00, img: 'assets/images/product-image-4.jpg' },
  { name: 'Fresh Banana', category: 'Fresh Fruit', price: 14.00, oldPrice: 20.00, img: 'assets/images/product-image-12.jpg' },
  { name: 'White Nuts', category: 'Millets & Nuts', price: 15.00, oldPrice: 20.00, img: 'assets/images/product-image-11.jpg' },
  { name: 'Vegan Red Tomato', category: 'Vegetable', price: 17.00, oldPrice: 20.00, img: 'assets/images/product-image-3.jpg' },
  { name: 'Mung Bean', category: 'Health & Fresh', price: 11.00, oldPrice: 20.00, img: 'assets/images/Product-01.jpg' },
  { name: 'Brown Hazelnut', category: 'Nuts & Seeds', price: 12.00, oldPrice: 20.00, img: 'assets/images/product-image-6.jpg' },
  { name: 'Organic Eggs', category: 'Fresh Farm', price: 17.00, oldPrice: 20.00, img: 'assets/images/product-image-4.jpg' },
  { name: 'Zelco Suprt Raw Organic', category: 'Fresh & Spices', price: 15.00, oldPrice: 20.00, img: 'assets/images/product-image-12.jpg' },
  { name: 'Mung Bean Sprouts', category: 'Health & Fresh', price: 11.00, oldPrice: 20.00, img: 'assets/images/Product-01.jpg' },
  { name: 'White Hazelnut', category: 'Nuts & Seeds', price: 12.00, oldPrice: 20.00, img: 'assets/images/product-image-6.jpg' },
  { name: 'Fresh Corn', category: 'Vegetable', price: 17.00, oldPrice: 20.00, img: 'assets/images/product-image-4.jpg' },
  { name: 'Organic Almonds', category: 'Nuts & Seeds', price: 15.00, oldPrice: 20.00, img: 'assets/images/product-image-11.jpg' }
];

function initSearchModal() {
  if (!document.getElementById('search-modal')) {
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.className = 'search-modal-overlay';
    modal.innerHTML = `
      <div class="search-modal-content">
        <div class="search-modal-header">
          <h3>Search Organick Store</h3>
          <button type="button" class="search-modal-close" aria-label="Close search">&times;</button>
        </div>
        <div class="search-input-box">
          <input type="text" id="search-input" placeholder="Type organic product name (e.g. broccoli, nuts, tomato)..." autofocus>
          <span class="search-icon-inline">🔍</span>
        </div>
        <div class="search-results-list" id="search-results">
          <p class="search-hint">Start typing to search 100% natural and certified organic products...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modal = document.getElementById('search-modal');
  const closeBtn = modal.querySelector('.search-modal-close');
  const input = document.getElementById('search-input');
  const resultsBox = document.getElementById('search-results');

  // Trigger from search icon in header
  const searchTriggers = document.querySelectorAll('.search-icon, .search-button, [data-search-trigger]');
  searchTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 100);
      renderSearchResults(input.value.trim());
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  input.addEventListener('input', () => {
    renderSearchResults(input.value.trim());
  });

  function renderSearchResults(query) {
    if (!query) {
      resultsBox.innerHTML = '<p class="search-hint">Start typing to search 100% natural and certified organic products...</p>';
      return;
    }

    const filtered = ORGANIC_PRODUCTS_DATA.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      resultsBox.innerHTML = `<div class="search-empty">No organic products found matching "<strong>${query}</strong>". Try broccoli, tomato, or bananas!</div>`;
      return;
    }

    resultsBox.innerHTML = filtered.map(p => `
      <div class="search-item-row" data-name="${p.name}">
        <img src="${p.img}" alt="${p.name}" class="search-item-thumb">
        <div class="search-item-info">
          <span class="search-item-badge">${p.category}</span>
          <h4 class="search-item-title">${p.name}</h4>
          <span class="search-item-price">$${p.price.toFixed(2)}</span>
        </div>
        <button type="button" class="primary-button dark-button search-add-btn" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}" data-cat="${p.category}">Add to Cart</button>
      </div>
    `).join('');

    resultsBox.querySelectorAll('.search-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const image = btn.dataset.img;
        const category = btn.dataset.cat;
        const id = 'prod_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        addToCart({ id, name, price, image, category, quantity: 1 });
      });
    });
  }
}

/* ==========================================================================
   Mobile Menu Drawer
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.menu-button, .w-nav-button');
  const navMenu = document.querySelector('.nav-menu, .w-nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-open');
    toggleBtn.classList.toggle('active');
    const isOpen = navMenu.classList.contains('mobile-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when clicking nav link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('mobile-open');
      toggleBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ==========================================================================
   Category Filter Tabs (Shop & Home)
   ========================================================================== */
function initCategoryFilters() {
  const filterWrap = document.querySelector('.category-filter-wrap');
  if (!filterWrap) return;

  const buttons = filterWrap.querySelectorAll('.filter-tab-btn');
  const items = document.querySelectorAll('.product-collection-item, .product-item');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const catElem = item.querySelector('.product-category-wrap, .product-category');
        const catText = catElem ? catElem.textContent.toLowerCase().trim() : '';

        if (filter === 'all' || catText.includes(filter.toLowerCase())) {
          item.style.display = '';
          item.classList.add('fade-in');
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Testimonials Slider
   ========================================================================== */
function initTestimonialsSlider() {
  const slider = document.querySelector('.testimonial-slider, .testimonial-section');
  if (!slider) return;

  const slides = [
    {
      name: 'Sara Taylor',
      role: 'Consumer',
      quote: 'Simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      rating: 5,
      avatar: 'assets/images/testimonial-client-image-1.jpg'
    },
    {
      name: 'Chris Jordan',
      role: 'Organic Store Manager',
      quote: 'The organic vegetables and fruits provided by Organick have completely transformed my health and diet. The farm-to-table freshness is guaranteed, certified, and utterly delicious!',
      rating: 5,
      avatar: 'assets/images/testimonial-client-image-2.jpg'
    },
    {
      name: 'Elena Rostova',
      role: 'Nutritionist & Chef',
      quote: 'As a culinary consultant, pure ingredients are everything. Organick delivers pesticide-free, nutrient-rich produce on schedule with wonderful packaging and caring support.',
      rating: 5,
      avatar: 'assets/images/testimonial-client-image-1.jpg'
    }
  ];

  let currentSlide = 0;
  const quoteElem = slider.querySelector('.testimonial-client-quote, .testimonial-quote');
  const nameElem = slider.querySelector('.testimonial-client-name, .testimonial-author h1, .testimonial-author h3');
  const roleElem = slider.querySelector('.testimonial-client-role, .testimonial-author p, .testimonial-author span');
  const avatarElem = slider.querySelector('.testimonial-client-image, .testimonial-avatar');

  const dotsContainer = slider.querySelector('.slider-dots, .testimonial-dots');

  function renderSlide(idx) {
    if (quoteElem) quoteElem.textContent = slides[idx].quote;
    if (nameElem) nameElem.textContent = slides[idx].name;
    if (roleElem) roleElem.textContent = slides[idx].role;
    if (avatarElem) avatarElem.src = slides[idx].avatar;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.dot').forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === idx);
      });
    }
  }

  if (dotsContainer) {
    dotsContainer.innerHTML = slides.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></span>`).join('');
    dotsContainer.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
        currentSlide = parseInt(dot.dataset.idx);
        renderSlide(currentSlide);
      });
    });
  }

  // Auto advance every 6 seconds
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide(currentSlide);
  }, 6000);
}

/* ==========================================================================
   Animated Numbers Counter
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.progress-content h2, .counter-num');
  if (counters.length === 0) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const raw = counter.textContent.trim();
          const hasPercent = raw.includes('%');
          const hasPlus = raw.includes('+');
          const target = parseInt(raw.replace(/[^0-9]/g, '')) || 100;
          let count = 0;
          const speed = Math.max(10, Math.floor(target / 40));

          const interval = setInterval(() => {
            count += speed;
            if (count >= target) {
              count = target;
              clearInterval(interval);
            }
            counter.textContent = `${count}${hasPercent ? '%' : ''}${hasPlus ? '+' : ''}`;
          }, 30);
        });
      }
    });
  }, { threshold: 0.3 });

  const progressSection = document.querySelector('.progress-area, .progress-section');
  if (progressSection) observer.observe(progressSection);
}

/* ==========================================================================
   Newsletter Subscription
   ========================================================================== */
function initNewsletter() {
  const forms = document.querySelectorAll('.subscribe-form, .newsletter-form, form[action*="newsletter"]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.includes('@')) {
        showToast('Thank you for subscribing to Organick fresh news!');
        input.value = '';
      } else {
        showToast('Please enter a valid email address.', 'error');
      }
    });
  });
}

/* ==========================================================================
   Contact Form
   ========================================================================== */
function initContactForm() {
  const form = document.querySelector('.contact-form, #contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"], [name="FullName"]');
    const email = form.querySelector('[name="email"], [name="Email"]');
    const msg = form.querySelector('[name="message"], [name="Message"]');

    if (!name || !name.value.trim() || !email || !email.value.includes('@')) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    showToast('Your message has been sent successfully! Our organic team will reply soon.');
    form.reset();
  });
}

/* ==========================================================================
   Product Quick View Modal
   ========================================================================== */
function initProductQuickView() {
  const cards = document.querySelectorAll('.product-image-wrap');
  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.setAttribute('title', 'Click to view product details');
    card.addEventListener('click', (e) => {
      // Don't trigger if clicked on add to cart button
      if (e.target.closest('.add-to-cart-btn')) return;

      const parent = card.closest('.product-item, .product-collection-item');
      if (!parent) return;

      const title = parent.querySelector('.product-title, h3, h4')?.textContent.trim() || 'Organic Product';
      const cat = parent.querySelector('.product-category-wrap, .product-category')?.textContent.trim() || 'Organic';
      const img = parent.querySelector('img')?.getAttribute('src') || 'assets/images/Product-01.jpg';
      const price = parent.querySelector('.product-price, .discount-price, .product-price-area')?.textContent || '$13.00';

      openProductModal({ title, cat, img, price });
    });
  });

  function openProductModal(data) {
    let modal = document.getElementById('product-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'product-modal';
      modal.className = 'product-modal-overlay';
      modal.innerHTML = `
        <div class="product-modal-content">
          <button type="button" class="product-modal-close">&times;</button>
          <div class="product-modal-grid">
            <div class="product-modal-image-col">
              <span class="product-modal-badge"></span>
              <img src="" alt="" class="product-modal-img">
            </div>
            <div class="product-modal-info-col">
              <h2 class="product-modal-title"></h2>
              <div class="product-modal-rating">★★★★★ <span>(5.0 customer reviews)</span></div>
              <div class="product-modal-price"></div>
              <p class="product-modal-desc">
                Simply dummy text of the printing and typesetting industry. 100% certified organic, harvested directly from pesticide-free sustainable family farms with rich soil nutrients.
              </p>
              <div class="product-modal-actions">
                <input type="number" class="modal-qty-input" value="1" min="1" max="99">
                <button type="button" class="primary-button dark-button modal-add-btn">Add to Cart</button>
              </div>
              <ul class="product-modal-highlights">
                <li>✓ 100% Certified Organic Food</li>
                <li>✓ Pesticide & Chemical Free</li>
                <li>✓ Farm Fresh Daily Harvest</li>
              </ul>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.product-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    modal.querySelector('.product-modal-badge').textContent = data.cat;
    modal.querySelector('.product-modal-img').src = data.img;
    modal.querySelector('.product-modal-img').alt = data.title;
    modal.querySelector('.product-modal-title').textContent = data.title;
    modal.querySelector('.product-modal-price').textContent = data.price;

    const addBtn = modal.querySelector('.modal-add-btn');
    const qtyInput = modal.querySelector('.modal-qty-input');
    qtyInput.value = 1;

    addBtn.onclick = () => {
      let match = data.price.match(/\$([0-9]+(?:\.[0-9]+)?)/);
      let priceVal = match ? parseFloat(match[1]) : 13.00;
      let qty = parseInt(qtyInput.value) || 1;
      let id = 'prod_' + data.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      addToCart({ id, name: data.title, price: priceVal, image: data.img, category: data.cat, quantity: qty });
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/* ==========================================================================
   Back To Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top-btn';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
