// ===== ADMIN DATA (loaded from API) =====
let COURSES = [];
let USERS = [];
let ORDERS = [];
let adminToken = localStorage.getItem('sf_admin_token');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  if (!adminToken) { showAdminLogin(); return; }
  setToken(adminToken);
  try {
    await loadAllData();
    initSidebar();
    initRouting();
    renderDashboard();
    renderCourses();
    renderUsers();
    renderOrders();
    renderCharts();
    initModals();
    initSearch();
  } catch (err) {
    console.error('Auth failed:', err);
    localStorage.removeItem('sf_admin_token');
    showAdminLogin();
  }
});

function showAdminLogin() {
  document.getElementById('adminApp').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-primary);">
      <div style="width:100%;max-width:400px;padding:40px;background:var(--bg-card);border-radius:16px;border:1px solid var(--border-color);">
        <h2 style="font-family:var(--font-display);text-align:center;margin-bottom:8px;">🔐 Admin Login</h2>
        <p style="text-align:center;color:var(--text-muted);margin-bottom:24px;font-size:0.9rem;">Sign in to access the admin panel</p>
        <form id="adminLoginForm">
          <div class="form-group"><label>Email</label><input type="email" id="adminEmail" placeholder="admin@skillforge.com" required></div>
          <div class="form-group"><label>Password</label><input type="password" id="adminPass" placeholder="••••••••" required></div>
          <div id="adminLoginError" style="color:var(--danger);font-size:0.85rem;margin-bottom:12px;display:none;"></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Sign In</button>
        </form>
      </div>
    </div>`;
  document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPass').value;
    const errEl = document.getElementById('adminLoginError');
    try {
      const data = await api.login(email, password);
      if (data.user.role !== 'admin' && data.user.role !== 'instructor') {
        errEl.textContent = 'Admin or instructor access required.';
        errEl.style.display = 'block';
        return;
      }
      adminToken = data.token;
      localStorage.setItem('sf_admin_token', data.token);
      setToken(data.token);
      location.reload();
    } catch (err) {
      errEl.textContent = err.message || 'Login failed';
      errEl.style.display = 'block';
    }
  });
}

async function loadAllData() {
  const [courses, users, orders] = await Promise.all([
    api.getCourses(),
    api.getUsers(),
    api.getOrders()
  ]);
  COURSES = courses.map((c, i) => ({ ...c, id: c._id, numId: i + 1 }));
  USERS = users.map(u => ({ ...u, id: u._id }));
  ORDERS = orders.map(o => ({ ...o, id: o.orderId || o._id }));
}

// ===== SIDEBAR & ROUTING =====
function initSidebar() {
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.addEventListener('click', () => showSection(link.dataset.section));
  });
  document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('sf_admin_token');
    removeToken();
    location.reload();
  });
}

function initRouting() {
  const hash = window.location.hash.slice(1);
  if (hash) showSection(hash);
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.slice(1);
    if (h) showSection(h);
  });
}

function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  const section = document.getElementById('section-' + id);
  const link = document.querySelector(`.sidebar__link[data-section="${id}"]`);
  if (section) section.classList.add('active');
  if (link) link.classList.add('active');
  window.location.hash = id;
}

// ===== DASHBOARD =====
function renderDashboard() {
  const totalRevenue = COURSES.reduce((s, c) => s + (c.revenue || 0), 0);
  const totalStudents = COURSES.reduce((s, c) => s + (c.students || 0), 0);
  document.getElementById('statCourses').textContent = COURSES.length;
  document.getElementById('statOrders').textContent = ORDERS.length;
  document.getElementById('statRevenue').textContent = '$' + (totalRevenue / 1000).toFixed(0) + 'k';
  document.getElementById('statUsers').textContent = USERS.length;
  renderRecentOrders();
  renderTopCourses();
}

function renderRecentOrders() {
  const tbody = document.getElementById('recentOrdersBody');
  if (!tbody) return;
  tbody.innerHTML = ORDERS.slice(0, 5).map(o => `
    <tr>
      <td><span class="order-id">${o.orderId || o.id}</span></td>
      <td><div class="user-cell"><div class="avatar-sm" style="background:${o.avatar || '#7c3aed'}">${(o.customer || '?')[0]}</div>${o.customer}</div></td>
      <td>${o.course}</td>
      <td>$${(o.amount || 0).toFixed(2)}</td>
      <td><span class="badge badge--${o.status === 'completed' ? 'success' : o.status === 'pending' ? 'warning' : 'danger'}">${o.status}</span></td>
    </tr>`).join('');
}

function renderTopCourses() {
  const container = document.getElementById('topCoursesBody');
  if (!container) return;
  const top = [...COURSES].sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 5);
  container.innerHTML = top.map((c, i) => `
    <div class="top-course">
      <div class="top-course__rank">${i + 1}</div>
      <div class="top-course__img" style="background:${c.image}"></div>
      <div class="top-course__info">
        <div class="top-course__title">${c.title}</div>
        <div class="top-course__meta">${c.instructor} · ${(c.students / 1000).toFixed(0)}k students</div>
      </div>
      <div class="top-course__revenue">$${((c.revenue || 0) / 1000).toFixed(1)}k</div>
    </div>`).join('');
}

// ===== CHARTS =====
function renderCharts() {
  renderRevenueChart();
  renderCategoryChart();
  renderUserGrowthChart();
}

function renderRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.offsetWidth;
  const h = canvas.height = 200;
  const data = [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45];
  const max = Math.max(...data);
  const barW = (w - 60) / data.length;
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#7c3aed');
  gradient.addColorStop(1, '#2563eb');
  data.forEach((v, i) => {
    const barH = (v / max) * (h - 40);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(30 + i * barW + 4, h - barH - 20, barW - 8, barH, 4);
    ctx.fill();
  });
}

function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = Math.min(canvas.parentElement.offsetWidth, 200);
  canvas.width = size; canvas.height = size;
  const categories = {};
  COURSES.forEach(c => { categories[c.category] = (categories[c.category] || 0) + 1; });
  const colors = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#2563eb', '#ef4444', '#8b5cf6', '#06b6d4'];
  const entries = Object.entries(categories);
  let startAngle = 0;
  entries.forEach(([cat, count], i) => {
    const slice = (count / COURSES.length) * Math.PI * 2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.arc(size / 2, size / 2, size / 2 - 10, startAngle, startAngle + slice);
    ctx.fill();
    startAngle += slice;
  });
}

function renderUserGrowthChart() {
  const canvas = document.getElementById('userGrowthChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.offsetWidth;
  const h = canvas.height = 200;
  const data = [50, 80, 120, 200, 350, 500, 650, 800, 1000, 1200, 1500, 1800];
  const max = Math.max(...data);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = 30 + (i * (w - 60)) / (data.length - 1);
    const y = h - 20 - (v / max) * (h - 40);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// ===== COURSES TABLE =====
function renderCourses(filter = {}) {
  let filtered = [...COURSES];
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(c => c.title.toLowerCase().includes(s) || c.instructor.toLowerCase().includes(s));
  }
  if (filter.status) filtered = filtered.filter(c => c.status === filter.status);

  const tbody = document.getElementById('coursesTableBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:28px;border-radius:6px;background:${c.image};flex-shrink:0;"></div><div><div style="font-weight:600;font-size:0.9rem;">${c.title}</div><div style="font-size:0.8rem;color:var(--text-muted);">${c.instructor}</div></div></div></td>
      <td>${c.category}</td>
      <td>$${(c.price || 0).toFixed(2)}</td>
      <td>${(c.students || 0).toLocaleString()}</td>
      <td>★ ${c.rating || 0}</td>
      <td><span class="badge badge--${c.status === 'published' ? 'success' : 'warning'}">${c.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn--ghost btn--sm" onclick="openCourseContentModal('${c._id}')">📚</button>
          <button class="btn btn--ghost btn--sm" onclick="editCourse('${c._id}')">✏️</button>
          <button class="btn btn--ghost btn--sm" onclick="deleteCourse('${c._id}')">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== USERS TABLE =====
function renderUsers(filter = {}) {
  let filtered = [...USERS];
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }
  if (filter.role) filtered = filtered.filter(u => u.role === filter.role);

  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td><div class="user-cell"><div class="avatar-sm" style="background:${u.avatar || '#7c3aed'}">${(u.name || '?')[0]}</div><div><div style="font-weight:600;">${u.name}</div><div style="font-size:0.8rem;color:var(--text-muted);">${u.email}</div></div></div></td>
      <td><span class="badge badge--${u.role === 'admin' ? 'primary' : u.role === 'instructor' ? 'info' : 'default'}">${u.role}</span></td>
      <td>${(u.purchasedCourses || []).length}</td>
      <td>${new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
      <td><span class="badge badge--${u.status === 'active' ? 'success' : 'danger'}">${u.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn--ghost btn--sm" onclick="editUser('${u._id}')">✏️</button>
          <button class="btn btn--ghost btn--sm" onclick="deleteUser('${u._id}')">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== ORDERS TABLE =====
function renderOrders(filter = {}) {
  let filtered = [...ORDERS];
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(o => (o.customer || '').toLowerCase().includes(s) || (o.course || '').toLowerCase().includes(s));
  }
  if (filter.status) filtered = filtered.filter(o => o.status === filter.status);

  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><span class="order-id">${o.orderId || o.id}</span></td>
      <td><div class="user-cell"><div class="avatar-sm" style="background:${o.avatar || '#7c3aed'}">${(o.customer || '?')[0]}</div>${o.customer}</div></td>
      <td>${o.course}</td>
      <td>${new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
      <td>$${(o.amount || 0).toFixed(2)}</td>
      <td>${o.payment || 'N/A'}</td>
      <td><span class="badge badge--${o.status === 'completed' ? 'success' : o.status === 'pending' ? 'warning' : 'danger'}">${o.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn--ghost btn--sm" onclick="viewOrder('${o._id}')">👁</button>
        </div>
      </td>
    </tr>`).join('');
}

// ===== SEARCH & FILTERS =====
function initSearch() {
  document.getElementById('courseSearch')?.addEventListener('input', (e) => renderCourses({ search: e.target.value }));
  document.getElementById('courseStatusFilter')?.addEventListener('change', (e) => renderCourses({ status: e.target.value || undefined }));
  document.getElementById('userSearch')?.addEventListener('input', (e) => renderUsers({ search: e.target.value }));
  document.getElementById('userRoleFilter')?.addEventListener('change', (e) => renderUsers({ role: e.target.value || undefined }));
  document.getElementById('orderSearch')?.addEventListener('input', (e) => renderOrders({ search: e.target.value }));
  document.getElementById('orderStatusFilter')?.addEventListener('change', (e) => renderOrders({ status: e.target.value || undefined }));
}

// ===== MODALS =====
function initModals() {
  document.getElementById('addCourseBtn')?.addEventListener('click', () => openCourseModal());
  document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal());
}

function openModal(html, wide = false) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = html;
  content.style.maxWidth = wide ? '800px' : '500px';
  overlay.classList.add('open');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

function openCourseModal(course = null) {
  openModal(`
    <div class="modal__header"><h2>${course ? 'Edit' : 'Add'} Course</h2><button class="modal__close" onclick="closeModal()">&times;</button></div>
    <div class="form-group"><label>Title *</label><input type="text" id="mCourseTitle" value="${course?.title || ''}" placeholder="Course title"></div>
    <div class="form-row-2col">
      <div class="form-group"><label>Instructor *</label><input type="text" id="mCourseInstructor" value="${course?.instructor || ''}" placeholder="Instructor name"></div>
      <div class="form-group"><label>Category</label><input type="text" id="mCourseCategory" value="${course?.category || 'Development'}" placeholder="Category"></div>
    </div>
    <div class="form-row-2col">
      <div class="form-group"><label>Price ($)</label><input type="number" id="mCoursePrice" value="${course?.price || 0}" step="0.01"></div>
      <div class="form-group"><label>Rating</label><input type="number" id="mCourseRating" value="${course?.rating || 4.5}" step="0.1" min="0" max="5"></div>
    </div>
    <div class="form-group"><label>Status</label><select id="mCourseStatus"><option${course?.status === 'published' ? ' selected' : ''}>published</option><option${course?.status === 'draft' ? ' selected' : ''}>draft</option></select></div>
    <div class="form-group"><label>Description</label><textarea id="mCourseDesc" rows="3" placeholder="Course description">${course?.description || ''}</textarea></div>
    <div class="modal__actions">
      <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn--primary" onclick="saveCourse('${course?._id || ''}')">Save Course</button>
    </div>`);
}

function openUserModal(user = null) {
  openModal(`
    <div class="modal__header"><h2>${user ? 'Edit' : 'Add'} User</h2><button class="modal__close" onclick="closeModal()">&times;</button></div>
    <div class="form-row-2col">
      <div class="form-group"><label>Name *</label><input type="text" id="mUserName" value="${user?.name || ''}"></div>
      <div class="form-group"><label>Email *</label><input type="email" id="mUserEmail" value="${user?.email || ''}"></div>
    </div>
    ${!user ? '<div class="form-group"><label>Password *</label><input type="password" id="mUserPassword" placeholder="Min 6 characters"></div>' : ''}
    <div class="form-row-2col">
      <div class="form-group"><label>Role</label><select id="mUserRole"><option${user?.role === 'student' ? ' selected' : ''}>student</option><option${user?.role === 'instructor' ? ' selected' : ''}>instructor</option><option${user?.role === 'admin' ? ' selected' : ''}>admin</option></select></div>
      <div class="form-group"><label>Status</label><select id="mUserStatus"><option${user?.status === 'active' ? ' selected' : ''}>active</option><option${user?.status === 'inactive' ? ' selected' : ''}>inactive</option></select></div>
    </div>
    <div class="modal__actions">
      <button class="btn btn--outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn--primary" onclick="saveUser('${user?._id || ''}')">Save User</button>
    </div>`);
}

// ===== CRUD OPERATIONS =====
async function saveCourse(id) {
  const title = document.getElementById('mCourseTitle').value;
  const instructor = document.getElementById('mCourseInstructor').value;
  if (!title || !instructor) { showToast('Please fill in all required fields.', 'error'); return; }
  const data = {
    title, instructor,
    category: document.getElementById('mCourseCategory').value,
    price: parseFloat(document.getElementById('mCoursePrice').value) || 0,
    rating: parseFloat(document.getElementById('mCourseRating').value) || 4.5,
    status: document.getElementById('mCourseStatus').value,
    description: document.getElementById('mCourseDesc')?.value || '',
    image: 'linear-gradient(135deg, #667eea, #764ba2)'
  };
  try {
    if (id) {
      await api.updateCourse(id, data);
      showToast('Course updated successfully!', 'success');
    } else {
      await api.createCourse(data);
      showToast('Course created successfully!', 'success');
    }
    await loadAllData();
    closeModal();
    renderCourses();
    renderTopCourses();
    renderDashboard();
  } catch (err) { showToast(err.message, 'error'); }
}

function editCourse(id) { openCourseModal(COURSES.find(c => c._id === id)); }

async function deleteCourse(id) {
  if (!confirm('Delete this course?')) return;
  try {
    await api.deleteCourse(id);
    await loadAllData();
    renderCourses();
    renderTopCourses();
    renderDashboard();
    showToast('Course deleted.', 'info');
  } catch (err) { showToast(err.message, 'error'); }
}

async function saveUser(id) {
  const name = document.getElementById('mUserName').value;
  const email = document.getElementById('mUserEmail').value;
  if (!name || !email) { showToast('Please fill in all required fields.', 'error'); return; }
  const data = {
    name, email,
    role: document.getElementById('mUserRole').value,
    status: document.getElementById('mUserStatus').value
  };
  try {
    if (id) {
      await api.updateUser(id, data);
      showToast('User updated successfully!', 'success');
    } else {
      const password = document.getElementById('mUserPassword')?.value;
      if (!password || password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
      await api.createUser({ ...data, password });
      showToast('User created successfully!', 'success');
    }
    await loadAllData();
    closeModal();
    renderUsers();
    renderDashboard();
  } catch (err) { showToast(err.message, 'error'); }
}

function editUser(id) { openUserModal(USERS.find(u => u._id === id)); }

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    await api.deleteUser(id);
    await loadAllData();
    renderUsers();
    renderDashboard();
    showToast('User deleted.', 'info');
  } catch (err) { showToast(err.message, 'error'); }
}

function viewOrder(id) {
  const o = ORDERS.find(x => x._id === id);
  if (!o) return;
  openModal(`
    <div class="modal__header"><h2>Order ${o.orderId || o.id}</h2><button class="modal__close" onclick="closeModal()">&times;</button></div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Customer</span><br><strong>${o.customer}</strong></div>
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Email</span><br><strong>${o.customerEmail || o.email || 'N/A'}</strong></div>
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Course</span><br><strong>${o.course}</strong></div>
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Date</span><br><strong>${new Date(o.createdAt || Date.now()).toLocaleDateString()}</strong></div>
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Amount</span><br><strong style="font-size:1.2rem;">$${o.amount}</strong></div>
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Payment</span><br><strong>${o.payment}</strong></div>
      <div><span style="color:var(--text-muted); font-size:0.85rem;">Status</span><br><span class="badge badge--${o.status === 'completed' ? 'success' : o.status === 'pending' ? 'warning' : 'danger'}">${o.status}</span></div>
    </div>
    <div class="modal__actions"><button class="btn btn--outline" onclick="closeModal()">Close</button></div>`);
}

// ===== EXPORT =====
function exportOrdersCSV() {
  let csv = 'Order ID,Customer,Course,Date,Amount,Payment,Status\n';
  ORDERS.forEach(o => { csv += `${o.orderId || o.id},${o.customer},${o.course},${new Date(o.createdAt || Date.now()).toLocaleDateString()},$${o.amount},${o.payment},${o.status}\n`; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'orders_export.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Orders exported as CSV!', 'success');
}

// ===== COURSE CONTENT MANAGEMENT =====
let currentContentCourseId = null;
let currentContent = { modules: [], resources: [] };

async function openCourseContentModal(courseId) {
  const course = COURSES.find(c => c._id === courseId);
  if (!course) return;
  currentContentCourseId = courseId;
  try {
    currentContent = await api.getContent(courseId);
    if (!currentContent.modules) currentContent.modules = [];
    if (!currentContent.resources) currentContent.resources = [];
  } catch {
    currentContent = { modules: [], resources: [] };
  }
  renderCourseContentModal(course, currentContent);
}

function renderCourseContentModal(course, content) {
  const totalLessons = content.modules.reduce((s, m) => s + (m.lessons || []).length, 0);
  const totalDuration = content.modules.reduce((s, m) => s + (m.lessons || []).reduce((ls, l) => ls + (parseInt(l.duration) || 0), 0), 0);

  openModal(`
    <div class="modal__header" style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:48px;height:48px;border-radius:12px;background:${course.image};flex-shrink:0;"></div>
            <div>
                <h2 style="font-size:1.15rem;margin:0;">${course.title}</h2>
                <span style="font-size:0.8rem;color:var(--text-muted);">${totalLessons} lessons · ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m total</span>
            </div>
        </div>
        <button class="modal__close" onclick="closeModal()">&times;</button>
    </div>

    <div style="display:flex;gap:4px;margin-bottom:20px;background:var(--bg-card);padding:4px;border-radius:10px;">
        <button class="content-tab active" onclick="switchContentTab(this, 'modulesPanel')" style="flex:1;padding:10px;border:none;border-radius:8px;background:var(--btn-primary-bg, var(--gradient-primary));color:#fff;cursor:pointer;font-weight:600;font-size:0.85rem;">📚 Modules & Lessons</button>
        <button class="content-tab" onclick="switchContentTab(this, 'resourcesPanel')" style="flex:1;padding:10px;border:none;border-radius:8px;background:transparent;color:var(--text-muted);cursor:pointer;font-weight:600;font-size:0.85rem;">📦 Resources</button>
    </div>

    <div id="modulesPanel">
        <div id="modulesList">${content.modules.map((mod, mi) => renderModuleBlock(course._id, mod, mi)).join('')}</div>
        ${content.modules.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:24px;font-size:0.9rem;">No modules yet. Add your first module to start building the curriculum.</p>' : ''}
        <button class="btn btn--outline btn--full" style="margin-top:16px;border-style:dashed;" onclick="addModule('${course._id}')">+ Add Module</button>
    </div>

    <div id="resourcesPanel" style="display:none;">
        <div id="resourcesList">${content.resources.map((r, ri) => renderResourceBlock(course._id, r, ri)).join('')}</div>
        ${content.resources.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:24px;font-size:0.9rem;">No resources yet. Add downloadable files for students.</p>' : ''}
        <button class="btn btn--outline btn--full" style="margin-top:16px;border-style:dashed;" onclick="addResource('${course._id}')">+ Add Resource</button>
    </div>

    <div class="modal__actions" style="margin-top:24px;border-top:1px solid var(--border-color);padding-top:16px;">
        <button class="btn btn--outline" onclick="closeModal()">Close</button>
        <span style="font-size:0.8rem;color:var(--text-muted);">Changes save to database</span>
    </div>`, true);
}

function renderModuleBlock(courseId, mod, mi) {
  return `
    <div class="module-block" style="margin-bottom:12px;border:1px solid var(--border-color);border-radius:12px;overflow:hidden;background:var(--bg-primary);">
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--bg-card);cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
            <span style="font-weight:700;color:var(--accent-1);font-size:0.8rem;flex-shrink:0;">M${mi + 1}</span>
            <span style="flex:1;font-weight:600;font-size:0.9rem;">${mod.title || 'Untitled Module'}</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${(mod.lessons || []).length} lessons</span>
            <button onclick="event.stopPropagation();deleteModule('${courseId}', ${mi})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.8rem;padding:4px 8px;" title="Delete module">🗑</button>
        </div>
        <div style="padding:12px 16px;">
            <div class="form-group" style="margin-bottom:10px;">
                <input type="text" value="${mod.title || ''}" placeholder="Module title"
                    onchange="updateModuleTitle('${courseId}', ${mi}, this.value)" style="font-weight:600;">
            </div>
            <div id="lessons-${mi}">
                ${(mod.lessons || []).map((les, li) => renderLessonRow(courseId, mi, les, li)).join('')}
            </div>
            <button class="btn btn--outline btn--sm" style="margin-top:8px;border-style:dashed;width:100%;justify-content:center;" onclick="addLesson('${courseId}', ${mi})">+ Add Lesson</button>
        </div>
    </div>`;
}

function renderLessonRow(courseId, mi, les, li) {
  const typeOptions = ['video', 'quiz', 'exercise', 'reading'].map(t =>
    `<option ${les.type === t ? 'selected' : ''}>${t}</option>`
  ).join('');
  const typeIcons = { video: '🎬', quiz: '❓', exercise: '💻', reading: '📖' };
  return `
    <div style="display:grid;grid-template-columns:auto 1fr 100px 80px 32px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;">
        <span style="color:var(--text-muted);font-size:0.75rem;width:28px;text-align:center;">${typeIcons[les.type] || '📄'}</span>
        <input type="text" value="${les.title || ''}" placeholder="Lesson title"
            onchange="updateLesson('${courseId}', ${mi}, ${li}, 'title', this.value)" style="padding:6px 10px;font-size:0.85rem;">
        <select onchange="updateLesson('${courseId}', ${mi}, ${li}, 'type', this.value)" style="padding:6px;font-size:0.8rem;">${typeOptions}</select>
        <input type="text" value="${les.duration || ''}" placeholder="mm:ss"
            onchange="updateLesson('${courseId}', ${mi}, ${li}, 'duration', this.value)" style="padding:6px 10px;font-size:0.8rem;text-align:center;">
        <button onclick="deleteLesson('${courseId}', ${mi}, ${li})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.75rem;" title="Delete lesson">✕</button>
    </div>
    ${les.type === 'video' ? `
    <div style="padding:4px 0 8px 36px;">
        <input type="text" value="${les.videoUrl || ''}" placeholder="Video URL"
            onchange="updateLesson('${courseId}', ${mi}, ${li}, 'videoUrl', this.value)" style="padding:5px 10px;font-size:0.8rem;width:100%;">
    </div>` : ''}`;
}

function renderResourceBlock(courseId, res, ri) {
  return `
    <div style="display:grid;grid-template-columns:1fr 120px 120px 32px;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
        <input type="text" value="${res.title || ''}" placeholder="Resource name"
            onchange="updateResource('${courseId}', ${ri}, 'title', this.value)" style="padding:6px 10px;font-size:0.85rem;">
        <select onchange="updateResource('${courseId}', ${ri}, 'type', this.value)" style="padding:6px;font-size:0.8rem;">
            ${['pdf', 'code', 'zip', 'image', 'link', 'doc', 'spreadsheet'].map(t => `<option ${res.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <input type="text" value="${res.url || ''}" placeholder="File URL"
            onchange="updateResource('${courseId}', ${ri}, 'url', this.value)" style="padding:6px 10px;font-size:0.8rem;">
        <button onclick="deleteResource('${courseId}', ${ri})" style="background:none;border:none;color:var(--danger);cursor:pointer;">✕</button>
    </div>`;
}

function switchContentTab(btn, panelId) {
  document.querySelectorAll('.content-tab').forEach(t => {
    t.style.background = 'transparent';
    t.style.color = 'var(--text-muted)';
    t.classList.remove('active');
  });
  btn.style.background = 'var(--gradient-primary)';
  btn.style.color = '#fff';
  btn.classList.add('active');
  document.getElementById('modulesPanel').style.display = panelId === 'modulesPanel' ? 'block' : 'none';
  document.getElementById('resourcesPanel').style.display = panelId === 'resourcesPanel' ? 'block' : 'none';
}

// Module operations
async function addModule(courseId) {
  try {
    await api.addModule(courseId, { title: 'Module ' + ((currentContent.modules?.length || 0) + 1), lessons: [] });
    openCourseContentModal(courseId);
    showToast('Module added!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function updateModuleTitle(courseId, mi, value) {
  try { await api.updateModule(courseId, mi, { title: value }); } catch (err) { showToast(err.message, 'error'); }
}

async function deleteModule(courseId, mi) {
  try {
    await api.deleteModule(courseId, mi);
    openCourseContentModal(courseId);
    showToast('Module deleted.', 'info');
  } catch (err) { showToast(err.message, 'error'); }
}

// Lesson operations
async function addLesson(courseId, mi) {
  try {
    await api.addLesson(courseId, mi, { title: '', type: 'video', duration: '' });
    openCourseContentModal(courseId);
    showToast('Lesson added!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function updateLesson(courseId, mi, li, field, value) {
  try {
    await api.updateLesson(courseId, mi, li, { [field]: value });
    if (field === 'type') openCourseContentModal(courseId);
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteLesson(courseId, mi, li) {
  try {
    await api.deleteLesson(courseId, mi, li);
    openCourseContentModal(courseId);
    showToast('Lesson deleted.', 'info');
  } catch (err) { showToast(err.message, 'error'); }
}

// Resource operations
async function addResource(courseId) {
  try {
    await api.addResource(courseId, { title: '', type: 'pdf', url: '' });
    openCourseContentModal(courseId);
    showToast('Resource added!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function updateResource(courseId, ri, field, value) {
  try { await api.updateResource(courseId, ri, { [field]: value }); } catch (err) { showToast(err.message, 'error'); }
}

async function deleteResource(courseId, ri) {
  try {
    await api.deleteResource(courseId, ri);
    openCourseContentModal(courseId);
    showToast('Resource deleted.', 'info');
  } catch (err) { showToast(err.message, 'error'); }
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3000);
}
