// ===== COURSE DATA (loaded from API) =====
let COURSES = [];

const CATEGORIES = [
  { name: "Development", icon: "💻", color: "linear-gradient(135deg, #667eea, #764ba2)", count: "2,400+" },
  { name: "Design", icon: "🎨", color: "linear-gradient(135deg, #4facfe, #00f2fe)", count: "1,800+" },
  { name: "Data Science", icon: "📊", color: "linear-gradient(135deg, #f093fb, #f5576c)", count: "1,200+" },
  { name: "Business", icon: "💼", color: "linear-gradient(135deg, #89f7fe, #66a6ff)", count: "950+" },
  { name: "Marketing", icon: "📣", color: "linear-gradient(135deg, #ff9a9e, #fecfef)", count: "800+" },
  { name: "AI & ML", icon: "🤖", color: "linear-gradient(135deg, #a1c4fd, #c2e9fb)", count: "600+" },
  { name: "Cloud", icon: "☁️", color: "linear-gradient(135deg, #fbc2eb, #a6c1ee)", count: "550+" },
  { name: "Security", icon: "🔒", color: "linear-gradient(135deg, #d299c2, #fef9d7)", count: "400+" }
];

const TESTIMONIALS = [
  { name: "Jessica Williams", role: "Software Engineer at Google", avatar: "#7c3aed", text: "SkillForge helped me transition from a non-tech background to a software engineering role at Google. The courses are incredibly well-structured and practical." },
  { name: "Michael Chen", role: "Data Scientist at Netflix", avatar: "#ec4899", text: "The data science track on SkillForge is world-class. I completed 5 courses and each one gave me skills I use daily in my work at Netflix." },
  { name: "Aisha Patel", role: "UX Designer at Spotify", avatar: "#10b981", text: "I went from knowing nothing about design to landing my dream job at Spotify. The community support and instructor feedback were game-changers." }
];

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('sf_cart') || '[]');
let currentPage = 'home';
let currentCourseId = null;
let filters = { category: 'all', level: 'all', price: 'all', rating: 'all', search: '', sort: 'popular' };
let currentUser = null;
let purchasedCourses = [];
let purchaseHistory = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  // Load courses from API
  try {
    const apiCourses = await api.getCourses();
    COURSES = apiCourses.map((c, i) => ({
      ...c,
      id: c._id,
      // Fill in frontend-only display fields with defaults if not present in DB
      originalPrice: c.originalPrice || Math.round(c.price * 2.2),
      reviews: c.reviews || Math.floor((c.students || 0) * 0.16),
      duration: c.duration || '30 hours',
      lessons: c.lessons || 40,
      level: c.level || 'Beginner',
      badge: c.badge || null,
      curriculum: c.curriculum || [],
      reviewsList: c.reviewsList || []
    }));
  } catch (err) {
    console.warn('Could not load courses from API, using empty list:', err.message);
  }

  // Restore user session from token
  const token = getToken();
  if (token) {
    try {
      const profile = await api.getProfile();
      currentUser = profile;
      purchasedCourses = (profile.purchasedCourses || []).map(id => String(id));

      // Load purchase history
      try {
        const orders = await api.getMyOrders();
        purchaseHistory = orders.map(o => ({
          orderId: o.orderId || o._id,
          courseId: o.courseId,
          courseTitle: o.course,
          price: o.amount,
          date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: o.status
        }));
      } catch { purchaseHistory = []; }
    } catch (err) {
      console.warn('Session expired:', err.message);
      removeToken();
    }
  }

  initNavbar();
  initRouter();
  initAuthModal();
  initAnimations();
  renderCategories();
  renderFeaturedCourses();
  renderTestimonials();
  initCatalog();
  updateCartBadge();
  animateStats();
  initUserDropdown();
  updateAuthUI();
});

// ===== ROUTER =====
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      const page = link.dataset.page;
      if (page) { e.preventDefault(); window.location.hash = page; }
    });
  });
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  const page = parts[0];
  if (page === 'course' && parts[1]) {
    showPage('course-detail');
    renderCourseDetail(parts[1]);
  } else {
    showPage(page);
    if (page === 'catalog') renderCatalog();
    if (page === 'cart') renderCart();
    if (page === 'checkout') renderCheckout();
    if (page === 'profile') renderProfile();
    if (page === 'my-courses') renderMyCourses();
    if (page === 'purchase-history') renderPurchaseHistory();
  }
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  currentPage = pageId;
  document.querySelectorAll('.navbar__link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileMenu();
  setTimeout(initAnimations, 100);
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
  document.getElementById('hamburgerBtn').addEventListener('click', toggleMobileMenu);
  document.getElementById('cartNavBtn').addEventListener('click', () => { window.location.hash = 'cart'; });
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('hamburgerBtn').classList.toggle('active');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburgerBtn').classList.remove('active');
}

// ===== AUTH MODAL =====
function initAuthModal() {
  const modal = document.getElementById('authModal');
  const openLogin = () => { modal.classList.add('open'); showAuthTab('login'); };
  const openSignup = () => { modal.classList.add('open'); showAuthTab('signup'); };
  document.getElementById('loginBtn').addEventListener('click', openLogin);
  document.getElementById('signupBtn').addEventListener('click', openSignup);
  document.getElementById('mobileLoginBtn')?.addEventListener('click', openLogin);
  document.getElementById('mobileSignupBtn')?.addEventListener('click', openSignup);
  document.getElementById('ctaSignupBtn')?.addEventListener('click', openSignup);
  document.getElementById('authModalClose').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
  document.querySelectorAll('[data-auth-tab]').forEach(tab => {
    tab.addEventListener('click', () => showAuthTab(tab.dataset.authTab));
  });

  // Login form — calls real API
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      currentUser = data.user;
      purchasedCourses = (data.user.purchasedCourses || []).map(id => String(id));
      // Load purchase history
      try {
        const orders = await api.getMyOrders();
        purchaseHistory = orders.map(o => ({
          orderId: o.orderId || o._id,
          courseId: o.courseId,
          courseTitle: o.course,
          price: o.amount,
          date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: o.status
        }));
      } catch { purchaseHistory = []; }
      updateAuthUI();
      modal.classList.remove('open');
      showToast('Welcome back, ' + data.user.name + '!', 'success');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  });

  // Signup form — calls real API
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('signupFirst').value;
    const lastName = document.getElementById('signupLast').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = `${firstName} ${lastName}`.trim();
    try {
      const data = await api.register(name, email, password);
      setToken(data.token);
      currentUser = data.user;
      purchasedCourses = [];
      purchaseHistory = [];
      updateAuthUI();
      modal.classList.remove('open');
      showToast('Account created! Welcome to SkillForge, ' + name + '.', 'success');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  });

  document.getElementById('contactForm')?.addEventListener('submit', (e) => { e.preventDefault(); showToast('Message sent! We\'ll get back to you soon.', 'success'); e.target.reset(); });
}

// ===== USER STATE =====
function logoutUser() {
  currentUser = null;
  purchasedCourses = [];
  purchaseHistory = [];
  removeToken();
  updateAuthUI();
  window.location.hash = 'home';
  showToast('You have been logged out.', 'info');
}

function updateAuthUI() {
  const guest = document.getElementById('navGuest');
  const user = document.getElementById('navUser');
  if (currentUser) {
    guest.style.display = 'none';
    user.style.display = 'flex';
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userAvatarNav').textContent = initials;
    document.getElementById('userNameNav').textContent = currentUser.name.split(' ')[0];
  } else {
    guest.style.display = 'flex';
    user.style.display = 'none';
  }
}

function initUserDropdown() {
  const btn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  dropdown.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = link.dataset.page;
      dropdown.classList.remove('open');
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    dropdown.classList.remove('open');
    logoutUser();
  });
}

function isCourseOwned(courseId) {
  return purchasedCourses.includes(String(courseId));
}

function getCourseProgress(courseId) {
  try {
    const saved = JSON.parse(localStorage.getItem('sf_learn_progress') || '{}');
    const completed = Object.values(saved).filter(v => v).length;
    const total = 35;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  } catch (e) { return { completed: 0, total: 35, pct: 0 }; }
}

function showAuthTab(tab) {
  document.querySelectorAll('[data-auth-tab]').forEach(t => t.classList.toggle('active', t.dataset.authTab === tab));
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}

// ===== ANIMATIONS =====
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.anim-fade-up:not(.visible)').forEach(el => observer.observe(el));
}

function animateStats() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current.toLocaleString();
        }, 30);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__number').forEach(el => observer.observe(el));
}

// ===== RENDER: CATEGORIES =====
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = CATEGORIES.map((cat, i) => `
    <div class="category-card anim-fade-up ${i > 0 ? 'anim-delay-' + Math.min(i, 4) : ''}" onclick="filterByCategory('${cat.name}')">
      <div class="category-card__icon" style="background: ${cat.color};">${cat.icon}</div>
      <div class="category-card__name">${cat.name}</div>
      <div class="category-card__count">${cat.count} courses</div>
    </div>
  `).join('');
}

function filterByCategory(category) {
  filters.category = category;
  window.location.hash = 'catalog';
  setTimeout(() => {
    const radios = document.querySelectorAll('#filterCategories input');
    radios.forEach(r => r.checked = r.value === category);
    renderCatalog();
  }, 100);
}

// ===== RENDER: COURSE CARD =====
function renderCourseCard(course) {
  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  return `
    <div class="course-card anim-fade-up" onclick="window.location.hash='course/${course.id}'">
      <div style="position:relative;">
        <div class="course-card__img-placeholder" style="background: ${course.image};">${course.badge ? `<span class="course-card__badge">${course.badge}</span>` : ''}</div>
      </div>
      <div class="course-card__body">
        <div class="course-card__category">${course.category}</div>
        <h3 class="course-card__title">${course.title}</h3>
        <div class="course-card__instructor">${course.instructor}</div>
        <div class="course-card__meta">
          <span class="course-card__rating">★ ${course.rating} <span style="color:var(--text-muted)">(${((course.reviews || 0) / 1000).toFixed(1)}k)</span></span>
          <span>${course.duration || ''}</span>
          <span>${course.level || ''}</span>
        </div>
        <div class="course-card__footer">
          <div>
            <span class="course-card__price">$${course.price}</span>
            ${course.originalPrice ? `<span class="course-card__price--original">$${course.originalPrice}</span>` : ''}
          </div>
          <button class="course-card__add-btn" onclick="event.stopPropagation(); addToCart('${course.id}');">Add to Cart</button>
        </div>
      </div>
    </div>`;
}

// ===== RENDER: FEATURED COURSES =====
function renderFeaturedCourses() {
  const grid = document.getElementById('featuredCoursesGrid');
  const featured = COURSES.filter(c => c.badge).slice(0, 6);
  if (featured.length === 0 && COURSES.length > 0) {
    grid.innerHTML = COURSES.slice(0, 6).map(c => renderCourseCard(c)).join('');
  } else {
    grid.innerHTML = featured.map(c => renderCourseCard(c)).join('');
  }
  setTimeout(initAnimations, 50);
}

// ===== RENDER: TESTIMONIALS =====
function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  grid.innerHTML = TESTIMONIALS.map((t, i) => `
    <div class="testimonial-card anim-fade-up ${i > 0 ? 'anim-delay-' + i : ''}">
      <div class="testimonial-card__stars">★★★★★</div>
      <p class="testimonial-card__text">"${t.text}"</p>
      <div class="testimonial-card__author">
        <div class="testimonial-card__avatar" style="background: ${t.avatar};">${t.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div class="testimonial-card__name">${t.name}</div>
          <div class="testimonial-card__role">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== CATALOG =====
function initCatalog() {
  const catBody = document.getElementById('filterCategories');
  catBody.innerHTML = `<label class="checkbox"><input type="radio" name="category" value="all" checked> All Categories</label>` +
    CATEGORIES.map(c => `<label class="checkbox"><input type="radio" name="category" value="${c.name}"> ${c.name}</label>`).join('');

  const lvlBody = document.getElementById('filterLevels');
  lvlBody.innerHTML = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((l, i) => `<label class="checkbox"><input type="radio" name="level" value="${i === 0 ? 'all' : l}" ${i === 0 ? 'checked' : ''}> ${l}</label>`).join('');

  document.getElementById('filterCategories').addEventListener('change', (e) => { filters.category = e.target.value; renderCatalog(); });
  document.getElementById('filterLevels').addEventListener('change', (e) => { filters.level = e.target.value; renderCatalog(); });
  document.getElementById('filterPrice').addEventListener('change', (e) => { filters.price = e.target.value; renderCatalog(); });
  document.getElementById('filterRating').addEventListener('change', (e) => { filters.rating = e.target.value; renderCatalog(); });
  document.getElementById('sortSelect').addEventListener('change', (e) => { filters.sort = e.target.value; renderCatalog(); });
  document.getElementById('searchInput').addEventListener('input', (e) => { filters.search = e.target.value.toLowerCase(); renderCatalog(); });
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    filters = { category: 'all', level: 'all', price: 'all', rating: 'all', search: '', sort: 'popular' };
    document.querySelectorAll('.catalog-sidebar input[value="all"]').forEach(r => r.checked = true);
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'popular';
    renderCatalog();
  });
  document.getElementById('filterToggle')?.addEventListener('click', () => {
    document.getElementById('catalogSidebar').classList.toggle('mobile-open');
  });
}

function renderCatalog() {
  let filtered = [...COURSES];
  if (filters.category !== 'all') filtered = filtered.filter(c => c.category === filters.category);
  if (filters.level !== 'all') filtered = filtered.filter(c => c.level === filters.level);
  if (filters.price !== 'all') {
    if (filters.price === 'free') filtered = filtered.filter(c => c.price === 0);
    else if (filters.price === '0-50') filtered = filtered.filter(c => c.price > 0 && c.price < 50);
    else if (filters.price === '50-100') filtered = filtered.filter(c => c.price >= 50 && c.price <= 100);
    else if (filters.price === '100+') filtered = filtered.filter(c => c.price > 100);
  }
  if (filters.rating !== 'all') filtered = filtered.filter(c => c.rating >= parseFloat(filters.rating));
  if (filters.search) filtered = filtered.filter(c => c.title.toLowerCase().includes(filters.search) || c.instructor.toLowerCase().includes(filters.search) || c.category.toLowerCase().includes(filters.search));
  switch (filters.sort) {
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'newest': filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    default: filtered.sort((a, b) => (b.students || 0) - (a.students || 0));
  }
  document.getElementById('courseCount').textContent = `${filtered.length} course${filtered.length !== 1 ? 's' : ''} found`;
  document.getElementById('catalogCoursesGrid').innerHTML = filtered.length ? filtered.map(c => renderCourseCard(c)).join('') : `<div style="grid-column:1/-1; text-align:center; padding:60px 20px;"><h3 style="margin-bottom:8px;">No courses found</h3><p style="color:var(--text-secondary)">Try adjusting your filters or search terms</p></div>`;
  setTimeout(initAnimations, 50);
}

// ===== COURSE DETAIL =====
function renderCourseDetail(id) {
  const course = COURSES.find(c => c.id === id || c._id === id);
  if (!course) { window.location.hash = 'catalog'; return; }
  currentCourseId = id;
  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;
  const checkSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
  const content = document.getElementById('courseDetailContent');
  content.innerHTML = `
    <div class="course-detail-hero"><div class="container">
      <div class="cd-info">
        <div class="cd-info__breadcrumb"><a href="#home" data-page="home">Home</a> / <a href="#catalog" data-page="catalog">Courses</a> / <span>${course.title}</span></div>
        <span class="cd-info__category">${course.category}</span>
        <h1 class="cd-info__title">${course.title}</h1>
        <p class="cd-info__desc">${course.description || ''}</p>
        <div class="cd-info__meta">
          <span class="cd-info__rating">★ ${course.rating} <span style="color:var(--text-muted)">(${((course.reviews || 0) / 1000).toFixed(1)}k reviews)</span></span>
          <span class="cd-info__meta-item">${((course.students || 0) / 1000).toFixed(0)}k students</span>
          <span class="cd-info__meta-item">${course.duration || ''} total</span>
          <span class="cd-info__meta-item">${course.level || ''}</span>
        </div>
        <p style="color:var(--text-secondary); font-size:0.9rem;">Created by <strong style="color:var(--accent-1);">${course.instructor}</strong></p>
      </div>
      <div class="cd-purchase-card">
        <div class="cd-purchase-card__preview" style="background: ${course.image};"><div class="cd-purchase-card__play"><svg width="24" height="24" viewBox="0 0 24 24" fill="var(--bg-primary)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
        ${isCourseOwned(course.id) ? `
        <div style="padding:12px 0; text-align:center;"><span style="color:var(--success); font-weight:600;">✅ You own this course</span></div>
        <a href="learn.html?id=${course.id}" class="btn btn--primary btn--full btn--lg" style="justify-content:center;">▶ Continue Learning</a>
        ` : `
        <div class="cd-purchase-card__price">$${course.price}${course.originalPrice ? `<span class="cd-purchase-card__original">$${course.originalPrice}</span>` : ''}</div>
        ${discount ? `<div class="cd-purchase-card__discount">${discount}% off — Limited time offer!</div>` : ''}
        <button class="btn btn--primary btn--full btn--lg" onclick="addToCart('${course.id}'); window.location.hash='cart';">Buy Now</button>
        <button class="btn btn--outline btn--full" style="margin-top:10px;" onclick="addToCart('${course.id}');">Add to Cart</button>
        `}
        <ul class="cd-purchase-card__features">
          <li>${checkSvg} ${course.duration || '30 hours'} on-demand video</li>
          <li>${checkSvg} ${course.lessons || 40} downloadable resources</li>
          <li>${checkSvg} Full lifetime access</li>
          <li>${checkSvg} Access on mobile and TV</li>
          <li>${checkSvg} Certificate of completion</li>
          <li>${checkSvg} 30-day money-back guarantee</li>
        </ul>
      </div>
    </div></div>
    <div class="course-detail-body"><div class="container">
      <div class="cd-section">
        <h2 class="cd-section__title">📚 Course Curriculum</h2>
        <div class="curriculum-list">
          ${(course.curriculum || []).map((mod, mi) => `
            <div class="curriculum-module">
              <div class="curriculum-module__header" onclick="this.nextElementSibling.classList.toggle('open')">
                <span>Section ${mi + 1}: ${mod.module || mod.title || 'Module'}</span>
                <span style="font-size:0.85rem; color:var(--text-muted);">${(mod.lessons || []).length} lessons</span>
              </div>
              <div class="curriculum-module__lessons${mi === 0 ? ' open' : ''}">
                ${(mod.lessons || []).map((l, li) => `<div class="curriculum-lesson"><span><span class="curriculum-lesson__icon">▶</span> ${typeof l === 'string' ? l : (l.title || 'Lesson')}</span><span style="color:var(--text-muted); font-size:0.8rem;">${5 + Math.floor(Math.random() * 20)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}</span></div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="cd-section">
        <h2 class="cd-section__title">👨‍🏫 About the Instructor</h2>
        <div style="display:flex; gap:20px; align-items:center; padding:24px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--border-radius-lg);">
          <div style="width:72px; height:72px; border-radius:50%; background:var(--gradient-primary); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:700; color:#fff; flex-shrink:0;">${course.instructor.split(' ').map(n => n[0]).join('')}</div>
          <div><h4 style="font-size:1.1rem; margin-bottom:4px;">${course.instructor}</h4><p style="color:var(--text-secondary); font-size:0.9rem;">Top-rated instructor with ${((course.students || 0) / 1000).toFixed(0)}k+ students and ${((course.reviews || 0) / 1000).toFixed(1)}k+ reviews. Passionate about creating the best learning experiences.</p></div>
        </div>
      </div>
      ${(course.reviewsList || []).length ? `
      <div class="cd-section">
        <h2 class="cd-section__title">⭐ Student Reviews</h2>
        ${course.reviewsList.map(r => `
          <div class="review-card">
            <div class="review-card__header">
              <div class="review-card__avatar" style="background:${r.avatar};">${r.name.split(' ').map(n => n[0]).join('')}</div>
              <div><div class="review-card__name">${r.name}</div><div class="review-card__date">${r.date}</div></div>
            </div>
            <div class="review-card__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <p class="review-card__text">${r.text}</p>
          </div>`).join('')}
      </div>` : ''}
    </div></div>`;
  content.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = link.dataset.page; });
  });
}

// ===== CART =====
function addToCart(courseId) {
  courseId = String(courseId);
  if (cart.find(item => String(item.id) === courseId)) { showToast('Course already in cart!', 'info'); return; }
  cart.push({ id: courseId, qty: 1 });
  saveCart();
  updateCartBadge();
  showToast('Course added to cart!', 'success');
}

function removeFromCart(courseId) {
  courseId = String(courseId);
  cart = cart.filter(item => String(item.id) !== courseId);
  saveCart();
  updateCartBadge();
  renderCart();
  showToast('Course removed from cart.', 'info');
}

function saveCart() { localStorage.setItem('sf_cart', JSON.stringify(cart)); }
function updateCartBadge() { document.getElementById('cartBadge').textContent = cart.length; }

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const course = COURSES.find(c => String(c.id) === String(item.id));
    return sum + (course ? course.price : 0);
  }, 0);
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><div class="cart-empty__icon">🛒</div><h3 class="cart-empty__title">Your cart is empty</h3><p class="cart-empty__desc">Explore our courses and find something to learn!</p><a href="#catalog" class="btn btn--primary btn--lg" data-page="catalog">Browse Courses</a></div>`;
    summary.innerHTML = '';
    container.querySelector('[data-page]')?.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = 'catalog'; });
    return;
  }
  container.innerHTML = cart.map(item => {
    const course = COURSES.find(c => String(c.id) === String(item.id));
    if (!course) return '';
    return `<div class="cart-item">
      <div class="cart-item__img" style="background:${course.image};"></div>
      <div><div class="cart-item__title">${course.title}</div><div class="cart-item__instructor">by ${course.instructor}</div><button class="cart-item__remove" onclick="removeFromCart('${course.id}')">✕ Remove</button></div>
      <div class="cart-item__price">$${course.price.toFixed(2)}</div>
    </div>`;
  }).join('');

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  summary.innerHTML = `
    <h3 class="cart-summary__title">Order Summary</h3>
    <div class="cart-summary__row"><span>Subtotal (${cart.length} items)</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="cart-summary__row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
    <div class="coupon-input"><input type="text" placeholder="Coupon code"><button class="btn btn--outline btn--sm" onclick="showToast('Coupon applied: 10% off!','success')">Apply</button></div>
    <div class="cart-summary__total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <button class="btn btn--primary btn--full btn--lg" onclick="window.location.hash='checkout'" style="margin-top:16px;">Proceed to Checkout</button>
    <a href="#catalog" class="btn btn--ghost btn--full" data-page="catalog" style="margin-top:8px;" onclick="event.preventDefault(); window.location.hash='catalog';">Continue Shopping</a>`;
}

// ===== CHECKOUT =====
let selectedPayment = 'bKash';
let paymentPhone = '';

function renderCheckout() {
  if (cart.length === 0) { window.location.hash = 'cart'; return; }
  if (!currentUser) {
    showToast('Please log in to checkout.', 'info');
    document.getElementById('authModal').classList.add('open');
    showAuthTab('login');
    return;
  }
  const subtotal = getCartTotal(); const tax = subtotal * 0.05; const total = subtotal + tax;
  const container = document.getElementById('checkoutContent');
  container.innerHTML = `
    <div>
      <div class="checkout-steps">
        <div class="checkout-step active" id="step1">1. Billing</div>
        <div class="checkout-step" id="step2">2. Payment</div>
        <div class="checkout-step" id="step3">3. OTP</div>
        <div class="checkout-step" id="step4">4. Done</div>
      </div>
      <div class="checkout-form" id="checkoutFormArea">
        <!-- STEP 1: BILLING -->
        <div id="billingStep">
          <h3>Billing Information</h3>
          <div class="form-row-2col"><div class="form-group"><label>Full Name</label><input type="text" id="billingName" value="${currentUser.name || ''}" placeholder="Your full name" required></div><div class="form-group"><label>Email</label><input type="email" id="billingEmail" value="${currentUser.email || ''}" placeholder="you@example.com" required></div></div>
          <div class="form-group"><label>Phone Number</label><input type="tel" id="billingPhone" placeholder="01XXXXXXXXX" pattern="01[3-9][0-9]{8}" required></div>
          <div class="form-group"><label>Country</label><select id="billingCountry"><option selected>Bangladesh</option><option>India</option><option>Pakistan</option><option>United States</option><option>United Kingdom</option></select></div>
          <button class="btn btn--primary btn--lg" onclick="goToPaymentStep()">Continue to Payment</button>
        </div>

        <!-- STEP 2: PAYMENT METHOD -->
        <div id="paymentStep" style="display:none;">
          <h3>Choose Payment Method</h3>
          <div class="payment-methods">
            <label class="payment-card payment-card--bkash selected" data-method="bKash">
              <input type="radio" name="paymentMethod" value="bKash" checked>
              <div class="payment-card__logo">
                <div class="payment-card__icon payment-card__icon--bkash">b</div>
                <div>
                  <div class="payment-card__name">bKash</div>
                  <div class="payment-card__desc">Mobile Banking</div>
                </div>
              </div>
              <div class="payment-card__check">✓</div>
            </label>
            <label class="payment-card payment-card--nagad" data-method="Nagad">
              <input type="radio" name="paymentMethod" value="Nagad">
              <div class="payment-card__logo">
                <div class="payment-card__icon payment-card__icon--nagad">N</div>
                <div>
                  <div class="payment-card__name">Nagad</div>
                  <div class="payment-card__desc">Digital Payment</div>
                </div>
              </div>
              <div class="payment-card__check">✓</div>
            </label>
          </div>
          <div class="form-group" style="margin-top:20px;">
            <label>Payment Phone Number</label>
            <input type="tel" id="payPhone" placeholder="01XXXXXXXXX" pattern="01[3-9][0-9]{8}" required>
          </div>
          <div class="form-group">
            <label>PIN</label>
            <input type="password" id="payPin" placeholder="Enter your 4-digit PIN" maxlength="4" pattern="[0-9]{4}" required>
          </div>
          <div style="display:flex; gap:12px;">
            <button class="btn btn--outline" onclick="goToBillingStep()">Back</button>
            <button class="btn btn--primary btn--lg" id="payNowBtn" onclick="goToOtpStep()">Pay ৳${total.toFixed(2)}</button>
          </div>
        </div>

        <!-- STEP 3: OTP VERIFICATION -->
        <div id="otpStep" style="display:none;">
          <div style="text-align:center; padding:10px 0 20px;">
            <div class="otp-icon" id="otpMethodIcon">b</div>
            <h3 style="margin-bottom:4px;">Verify Payment</h3>
            <p style="color:var(--text-secondary); font-size:.95rem;">An OTP has been sent to <strong id="otpPhoneDisplay">01X...XXX</strong></p>
          </div>
          <div class="form-group">
            <label>Enter 4-digit OTP</label>
            <div class="otp-inputs" id="otpInputs">
              <input type="text" maxlength="1" class="otp-input" data-otp="0" inputmode="numeric">
              <input type="text" maxlength="1" class="otp-input" data-otp="1" inputmode="numeric">
              <input type="text" maxlength="1" class="otp-input" data-otp="2" inputmode="numeric">
              <input type="text" maxlength="1" class="otp-input" data-otp="3" inputmode="numeric">
            </div>
          </div>
          <button class="btn btn--primary btn--lg btn--full" id="verifyOtpBtn" onclick="completeOrder()">Verify & Complete Payment</button>
          <div style="text-align:center; margin-top:16px;">
            <span style="color:var(--text-secondary); font-size:.9rem;" id="otpTimer">Resend OTP in 30s</span>
          </div>
        </div>

        <!-- STEP 4: CONFIRMATION -->
        <div id="confirmationStep" style="display:none; text-align:center; padding:30px 20px;">
          <div style="font-size:3.5rem; margin-bottom:16px;">🎉</div>
          <h2 style="font-family:var(--font-display); margin-bottom:8px;">Payment Successful!</h2>
          <p style="color:var(--text-secondary); margin-bottom:24px;">Your courses are now unlocked. Happy learning!</p>
          <div class="receipt-box" id="receiptBox"></div>
          <a href="#my-courses" class="btn btn--primary btn--lg" style="margin-top:20px;">Start Learning →</a>
        </div>
      </div>
    </div>
    <aside class="cart-summary">
      <h3 class="cart-summary__title">Order Summary</h3>
      ${cart.map(item => { const c = COURSES.find(x => String(x.id) === String(item.id)); return c ? `<div class="cart-summary__row"><span style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.title}</span><span>৳${c.price.toFixed(2)}</span></div>` : ''; }).join('')}
      <div class="cart-summary__row"><span>Tax (5%)</span><span>৳${tax.toFixed(2)}</span></div>
      <div class="cart-summary__total"><span>Total</span><span>৳${total.toFixed(2)}</span></div>
    </aside>`;

  // Payment method selection
  document.querySelectorAll('.payment-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input[type=radio]').checked = true;
      selectedPayment = card.dataset.method;
    });
  });

  // OTP input auto-focus
  setTimeout(() => {
    document.querySelectorAll('.otp-input').forEach((inp, i, all) => {
      inp.addEventListener('input', () => {
        if (inp.value && i < all.length - 1) all[i + 1].focus();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && i > 0) all[i - 1].focus();
      });
    });
  }, 100);
}

function goToPaymentStep() {
  const phone = document.getElementById('billingPhone').value.trim();
  if (!phone || !/^01[3-9][0-9]{8}$/.test(phone)) {
    showToast('Please enter a valid Bangladeshi phone number (01XXXXXXXXX)', 'error');
    return;
  }
  document.getElementById('billingStep').style.display = 'none';
  document.getElementById('paymentStep').style.display = 'block';
  document.getElementById('step1').classList.remove('active'); document.getElementById('step1').classList.add('completed');
  document.getElementById('step2').classList.add('active');
  document.getElementById('payPhone').value = phone;
}

function goToBillingStep() {
  document.getElementById('paymentStep').style.display = 'none';
  document.getElementById('billingStep').style.display = 'block';
  document.getElementById('step1').classList.add('active'); document.getElementById('step1').classList.remove('completed');
  document.getElementById('step2').classList.remove('active');
}

function goToOtpStep() {
  const phone = document.getElementById('payPhone').value.trim();
  const pin = document.getElementById('payPin').value.trim();
  if (!phone || !/^01[3-9][0-9]{8}$/.test(phone)) {
    showToast('Please enter a valid phone number', 'error'); return;
  }
  if (!pin || pin.length !== 4) {
    showToast('Please enter your 4-digit PIN', 'error'); return;
  }
  paymentPhone = phone;

  document.getElementById('paymentStep').style.display = 'none';
  document.getElementById('otpStep').style.display = 'block';
  document.getElementById('step2').classList.remove('active'); document.getElementById('step2').classList.add('completed');
  document.getElementById('step3').classList.add('active');

  // Show masked phone
  document.getElementById('otpPhoneDisplay').textContent = phone.slice(0, 3) + '****' + phone.slice(-3);

  // Update icon color
  const otpIcon = document.getElementById('otpMethodIcon');
  if (selectedPayment === 'Nagad') {
    otpIcon.textContent = 'N';
    otpIcon.style.background = 'linear-gradient(135deg, #F6921E, #ED1C24)';
  } else {
    otpIcon.textContent = 'b';
    otpIcon.style.background = 'linear-gradient(135deg, #E2136E, #C7115A)';
  }

  // OTP timer
  let sec = 30;
  const timerEl = document.getElementById('otpTimer');
  const interval = setInterval(() => {
    sec--;
    timerEl.textContent = sec > 0 ? `Resend OTP in ${sec}s` : '';
    if (sec <= 0) {
      clearInterval(interval);
      timerEl.innerHTML = '<button class="btn btn--ghost btn--sm" onclick="showToast(\'OTP resent!\',\'success\')">Resend OTP</button>';
    }
  }, 1000);

  // Auto-focus first OTP input
  setTimeout(() => document.querySelector('.otp-input')?.focus(), 200);
}

async function completeOrder() {
  // Validate OTP (accept any 4 digits for simulation)
  const otpDigits = Array.from(document.querySelectorAll('.otp-input')).map(i => i.value).join('');
  if (otpDigits.length !== 4) {
    showToast('Please enter the 4-digit OTP', 'error');
    return;
  }

  // Show loading state
  const btn = document.getElementById('verifyOtpBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  let lastOrder = null;

  // Purchase each course via API
  for (const item of cart) {
    try {
      lastOrder = await api.purchase(item.id, selectedPayment, paymentPhone);
      if (!purchasedCourses.includes(String(item.id))) {
        purchasedCourses.push(String(item.id));
      }
    } catch (err) {
      console.warn('Purchase error for course', item.id, err.message);
      showToast(err.message || 'Payment failed', 'error');
      btn.disabled = false;
      btn.textContent = 'Verify & Complete Payment';
      return;
    }
  }

  // Refresh purchase history
  try {
    const orders = await api.getMyOrders();
    purchaseHistory = orders.map(o => ({
      orderId: o.orderId || o._id,
      courseId: o.courseId,
      courseTitle: o.course,
      price: o.amount,
      date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: o.status,
      payment: o.payment,
      transactionId: o.transactionId
    }));
  } catch { }

  // Show confirmation
  document.getElementById('otpStep').style.display = 'none';
  document.getElementById('confirmationStep').style.display = 'block';
  document.getElementById('step3').classList.remove('active'); document.getElementById('step3').classList.add('completed');
  document.getElementById('step4').classList.add('active');

  // Show receipt
  const total = getCartTotal() * 1.05;
  const txnId = lastOrder?.transactionId || 'N/A';
  const methodColor = selectedPayment === 'bKash' ? '#E2136E' : '#F6921E';
  document.getElementById('receiptBox').innerHTML = `
    <div class="receipt-row"><span>Payment Method</span><span style="color:${methodColor};font-weight:600;">${selectedPayment}</span></div>
    <div class="receipt-row"><span>Phone</span><span>${paymentPhone}</span></div>
    <div class="receipt-row"><span>Transaction ID</span><span style="font-family:monospace;font-size:.85rem;">${txnId}</span></div>
    <div class="receipt-row"><span>Amount Paid</span><span style="font-weight:700;">৳${total.toFixed(2)}</span></div>
    <div class="receipt-row"><span>Status</span><span class="badge badge--success">Completed</span></div>
  `;

  cart = []; saveCart(); updateCartBadge();
  showToast('Payment successful! Welcome to your new courses.', 'success');
}

// ===== PROFILE PAGE =====
function renderProfile() {
  if (!currentUser) { window.location.hash = 'home'; showToast('Please log in to view your profile.', 'info'); return; }
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const ownedCourses = COURSES.filter(c => purchasedCourses.includes(String(c.id)));
  const totalSpent = purchaseHistory.reduce((s, p) => s + (p.price || 0), 0);
  const progress = getCourseProgress();
  document.getElementById('profileContent').innerHTML = `
    <aside class="profile-sidebar">
      <div class="profile-card">
        <div class="profile-card__avatar">${initials}</div>
        <div class="profile-card__name">${currentUser.name}</div>
        <div class="profile-card__email">${currentUser.email}</div>
        <div class="profile-card__stat">
          <div class="profile-card__stat-item">
            <div class="profile-card__stat-number">${ownedCourses.length}</div>
            <div class="profile-card__stat-label">Courses</div>
          </div>
          <div class="profile-card__stat-item">
            <div class="profile-card__stat-number">${progress.completed}</div>
            <div class="profile-card__stat-label">Completed</div>
          </div>
          <div class="profile-card__stat-item">
            <div class="profile-card__stat-number">$${totalSpent.toFixed(0)}</div>
            <div class="profile-card__stat-label">Invested</div>
          </div>
        </div>
      </div>
      <nav class="profile-nav">
        <a href="#my-courses" class="profile-nav__item" onclick="event.preventDefault();window.location.hash='my-courses';">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          My Courses
        </a>
        <a href="#purchase-history" class="profile-nav__item" onclick="event.preventDefault();window.location.hash='purchase-history';">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Purchase History
        </a>
      </nav>
    </aside>
    <div class="profile-content">
      <div class="profile-section">
        <div class="profile-section__title">👤 Personal Information</div>
        <div class="profile-form">
          <div class="form-row-2col">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="profileName" value="${currentUser.name}">
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="profileEmail" value="${currentUser.email}">
            </div>
          </div>
          <div class="form-row-2col">
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000">
            </div>
            <div class="form-group">
              <label>Member Since</label>
              <input type="text" value="${new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}" disabled style="opacity:0.5;">
            </div>
          </div>
          <button class="btn btn--primary" onclick="saveProfile()">Save Changes</button>
        </div>
      </div>
      <div class="profile-section">
        <div class="profile-section__title">📚 Recent Courses</div>
        ${ownedCourses.length > 0 ? `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${ownedCourses.slice(0, 3).map(c => {
    const p = getCourseProgress(c.id);
    return `<div style="display:flex;align-items:center;gap:16px;padding:14px;background:var(--bg-primary);border-radius:var(--border-radius);border:1px solid var(--border-color);">
              <div style="width:60px;height:42px;border-radius:8px;background:${c.image};flex-shrink:0;"></div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.title}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">${c.instructor}</div>
              </div>
              <a href="learn.html?id=${c.id}" class="btn btn--primary btn--sm">Continue</a>
            </div>`;
  }).join('')}
        </div>
        ${ownedCourses.length > 3 ? `<div style="text-align:center;margin-top:16px;"><a href="#my-courses" class="btn btn--outline btn--sm" onclick="event.preventDefault();window.location.hash='my-courses';">View All Courses →</a></div>` : ''}
        ` : `<p style="color:var(--text-muted);text-align:center;padding:24px;">You haven't purchased any courses yet. <a href="#catalog" style="color:var(--accent-1);" onclick="event.preventDefault();window.location.hash='catalog';">Browse courses</a></p>`}
      </div>
    </div>
  `;
}

async function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  if (name && email) {
    try {
      const updated = await api.updateProfile({ name, email });
      currentUser.name = updated.name || name;
      currentUser.email = updated.email || email;
      updateAuthUI();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  }
}

// ===== MY COURSES PAGE =====
function renderMyCourses() {
  if (!currentUser) { window.location.hash = 'home'; showToast('Please log in to view your courses.', 'info'); return; }
  const container = document.getElementById('myCoursesContent');
  const owned = COURSES.filter(c => purchasedCourses.includes(String(c.id)));
  if (owned.length === 0) {
    container.innerHTML = `
      <div class="my-courses-empty">
        <div class="my-courses-empty__icon">📚</div>
        <h3 class="my-courses-empty__title">No courses yet</h3>
        <p class="my-courses-empty__desc">Start your learning journey by enrolling in a course!</p>
        <a href="#catalog" class="btn btn--primary btn--lg" onclick="event.preventDefault();window.location.hash='catalog';">Browse Courses</a>
      </div>`;
    return;
  }
  const progress = getCourseProgress();
  container.innerHTML = `<div class="my-courses-grid">${owned.map(c => {
    const isCompleted = progress.pct === 100;
    return `
    <div class="my-course-card">
      <div class="my-course-card__banner" style="background:${c.image};">
        <span class="my-course-card__badge ${isCompleted ? 'my-course-card__badge--completed' : 'my-course-card__badge--progress'}">
          ${isCompleted ? '✅ Completed' : '📖 In Progress'}
        </span>
      </div>
      <div class="my-course-card__body">
        <div class="my-course-card__title">${c.title}</div>
        <div class="my-course-card__instructor">by ${c.instructor}</div>
        <div class="my-course-card__progress">
          <div class="my-course-card__progress-bar">
            <div class="my-course-card__progress-fill" style="width:${progress.pct}%;"></div>
          </div>
          <div class="my-course-card__progress-text">
            <span>${progress.pct}% complete</span>
            <span>${progress.completed}/${progress.total} lessons</span>
          </div>
        </div>
        <div class="my-course-card__actions">
          <a href="learn.html?id=${c.id}" class="btn btn--primary">Continue Learning</a>
          <a href="#course/${c.id}" class="btn btn--outline" onclick="event.preventDefault();window.location.hash='course/${c.id}';">Details</a>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

// ===== PURCHASE HISTORY =====
function renderPurchaseHistory() {
  if (!currentUser) { window.location.hash = 'home'; showToast('Please log in to view purchase history.', 'info'); return; }
  const container = document.getElementById('purchaseHistoryContent');
  if (purchaseHistory.length === 0) {
    container.innerHTML = '<div class="purchase-history-empty"><p style="font-size:3rem;margin-bottom:16px;">🧾</p><h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;margin-bottom:8px;color:var(--text-primary);">No purchases yet</h3><p>Your purchase history will appear here after you buy a course.</p></div>';
    return;
  }
  container.innerHTML = `
    <div class="purchase-history">
      <table class="purchase-table">
        <thead>
          <tr><th>Order ID</th><th>Course</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${purchaseHistory.map(p => `
            <tr>
              <td style="font-family:monospace;font-size:0.8rem;">${p.orderId}</td>
              <td style="font-weight:500;color:var(--text-primary);max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.courseTitle}</td>
              <td>${p.date}</td>
              <td style="font-weight:600;color:var(--text-primary);">$${(p.price || 0).toFixed(2)}</td>
              <td><span class="purchase-status purchase-status--${p.status}">${p.status === 'completed' ? '✅ Completed' : '↩️ Refunded'}</span></td>
              <td><a href="learn.html" class="btn btn--primary btn--sm">Learn</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3000);
}
