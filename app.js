/**
 * FOIL STAMPING PRODUCTION MANAGER - CORE APPLICATION LOGIC
 * High-performance client-side Single Page Application script.
 * Synchronized with Google Sheets (K-based + Progressive Quantity + Independent Die Quantities).
 */

(function () {
  'use strict';

  // --- STATE DEFINITION & LOCAL STORAGE KEYS ---
  const STORAGE_KEY = 'foil_stamping_manager_state_v7'; // Reset storage for default vandang account distribution

  let state = {
    theme: 'dark',
    currentUser: null,  // Currently logged-in account
    accounts: [],       // Registered user accounts
    craftsmen: [],
    jobs: [],
    activities: []
  };

  // --- SAMPLE SEED DATA ---
  const sampleCraftsmen = [
    { id: 'cm_giang', name: 'Giang', phone: '', role: 'Thợ ép chính' },
    { id: 'cm_thy', name: 'Thy', phone: '', role: 'Thợ chính (Ép & Bế)' },
    { id: 'cm_ngan', name: 'Ngân', phone: '', role: 'Thợ ép chính' },
    { id: 'cm_hung', name: 'Hưng', phone: '', role: 'Thợ chính (Ép & Bế)' },
    { id: 'cm_yen', name: 'Yến', phone: '', role: 'Thợ ép chính' },
    { id: 'cm_thao', name: 'Thảo', phone: '', role: 'Thợ bế hộp' },
    { id: 'cm_vandang', name: 'Nguyễn Văn Đặng', phone: '', role: 'Thợ ép chính' }
  ];

  // Seed default accounts linked to craftsmen or admin
  const sampleAccounts = [
    { id: 'acc_admin', username: 'admin', password: '123', name: 'Quản trị viên', isSystemAdmin: true, roleEpKim: true, roleBe: true },
    { id: 'acc_giang', username: 'giang', password: '123', name: 'Giang', isSystemAdmin: false, roleEpKim: true, roleBe: false, craftsmanId: 'cm_giang' },
    { id: 'acc_thy', username: 'thy', password: '123', name: 'Thy', isSystemAdmin: false, roleEpKim: true, roleBe: true, craftsmanId: 'cm_thy' },
    { id: 'acc_ngan', username: 'ngan', password: '123', name: 'Ngân', isSystemAdmin: false, roleEpKim: true, roleBe: false, craftsmanId: 'cm_ngan' },
    { id: 'acc_hung', username: 'hung', password: '123', name: 'Hưng', isSystemAdmin: false, roleEpKim: true, roleBe: true, craftsmanId: 'cm_hung' },
    { id: 'acc_yen', username: 'yen', password: '123', name: 'Yến', isSystemAdmin: false, roleEpKim: true, roleBe: false, craftsmanId: 'cm_yen' },
    { id: 'acc_thao', username: 'thao', password: '123', name: 'Thảo', isSystemAdmin: false, roleEpKim: false, roleBe: true, craftsmanId: 'cm_thao' },
    { id: 'acc_vandang', username: 'vandang', password: '123', name: 'Nguyễn Văn Đặng', isSystemAdmin: false, roleEpKim: true, roleBe: false, craftsmanId: 'cm_vandang' }
  ];

  // Raw seed jobs, mapped to 'ep-kim' or 'be'
  const sampleJobsRaw = [
    { id: 'job_1', orderCode: 'DH-001', name: 'card novaland', dies: 2, qtyPerDie: '200', craftsmanId: 'cm_giang', jobType: 'ep-kim', dateCreated: '2026-04-28T08:00:00.000Z' },
    { id: 'job_2', orderCode: 'DH-002', name: 'Card novagroup', dies: 2, qtyPerDie: '200', craftsmanId: 'cm_giang', jobType: 'ep-kim', dateCreated: '2026-04-28T08:00:00.000Z' },
    { id: 'job_3', orderCode: 'DH-003', name: 'Card ESTIQUE', dies: 1, qtyPerDie: '200', craftsmanId: 'cm_thy', jobType: 'ep-kim', dateCreated: '2026-05-07T08:00:00.000Z' },
    { id: 'job_4', orderCode: 'DH-004', name: 'Card WYNNLEY', dies: 1, qtyPerDie: '200', craftsmanId: 'cm_ngan', jobType: 'ep-kim', dateCreated: '2026-05-07T08:00:00.000Z' },
    { id: 'job_5', orderCode: 'DH-005', name: "Card M'LUXE", dies: 1, qtyPerDie: '1000', craftsmanId: 'cm_thy', jobType: 'ep-kim', dateCreated: '2026-05-08T08:00:00.000Z' },
    { id: 'job_6', orderCode: 'DH-006', name: 'card Office Wonder PKC', dies: 2, qtyPerDie: '300', craftsmanId: 'cm_giang', jobType: 'be', dateCreated: '2026-05-09T08:00:00.000Z' },
    { id: 'job_7', orderCode: 'DH-007', name: 'Card ESTIQUE', dies: 1, qtyPerDie: '300', craftsmanId: 'cm_thy', jobType: 'be', dateCreated: '2026-05-12T08:00:00.000Z' },
    { id: 'job_8', orderCode: 'DH-008', name: 'Thẻ DeAndre', dies: 1, qtyPerDie: '800', craftsmanId: 'cm_hung', jobType: 'ep-kim', dateCreated: '2026-05-13T08:00:00.000Z' },
    { id: 'job_9', orderCode: 'DH-009', name: 'Card QUINCE madamkieu', dies: 3, qtyPerDie: '700', craftsmanId: 'cm_yen', jobType: 'ep-kim', dateCreated: '2026-05-13T08:00:00.000Z' },
    { id: 'job_10', orderCode: 'DH-010', name: 'Áo ly CHEESE', dies: 1, qtyPerDie: '5500', craftsmanId: 'cm_hung', jobType: 'ep-kim', dateCreated: '2026-05-15T08:00:00.000Z' },
    { id: 'job_11', orderCode: 'DH-011', name: 'Card MOUNTAIN CRANE', dies: 3, qtyPerDie: '200', craftsmanId: 'cm_ngan', jobType: 'ep-kim', dateCreated: '2026-05-18T08:00:00.000Z' },
    { id: 'job_12', orderCode: 'DH-012', name: 'Card M.C.I Global', dies: 1, qtyPerDie: '100', craftsmanId: 'cm_ngan', jobType: 'ep-kim', dateCreated: '2026-05-18T08:00:00.000Z' },
    { id: 'job_13', orderCode: 'DH-013', name: 'Card AQUAPAK', dies: 1, qtyPerDie: '200', craftsmanId: 'cm_thao', jobType: 'be', dateCreated: '2026-05-20T08:00:00.000Z' },
    { id: 'job_14', orderCode: 'DH-014', name: 'Thẻ DeAndre VICTOR', dies: 1, qtyPerDie: '200', craftsmanId: 'cm_hung', jobType: 'ep-kim', dateCreated: '2026-05-20T08:00:00.000Z' },
    { id: 'job_15', orderCode: 'DH-015', name: 'Áo ly MATCHA COCO', dies: 1, qtyPerDie: '3000', craftsmanId: 'cm_thao', jobType: 'be', dateCreated: '2026-05-20T08:00:00.000Z' },
    { id: 'job_16', orderCode: 'DH-016', name: 'Card GOLD COAST', dies: 1, qtyPerDie: '500', craftsmanId: 'cm_thy', jobType: 'ep-kim', dateCreated: '2026-05-23T08:00:00.000Z' }
  ];

  const sampleActivities = [
    { text: 'Đồng bộ hóa hệ thống phân quyền nhân sự & Phân hệ Bế (Diecut).', time: new Date().toISOString(), type: 'success' },
    { text: 'Tự động khởi tạo 7 tài khoản thợ và admin có mật khẩu là 123.', time: new Date(Date.now() - 2 * 60 * 1000).toISOString(), type: 'primary' }
  ];

  // --- PROGRESSIVE ALLOWANCE CALCULATOR ---
  
  function parseQtyPerDie(qtyStr) {
    if (qtyStr === null || qtyStr === undefined) return 0;
    qtyStr = qtyStr.toString().trim().replace(/[^0-9\.,]/g, '');
    if (!qtyStr) return 0;
    return parseFloat(qtyStr.replace(',', '.'));
  }

  // Progressive allowance formula for die-cutting (Bế)
  function calculateBeAllowancePerDie(qtyStr, baseWage = 20000) {
    const qty = parseQtyPerDie(qtyStr);
    if (qty <= 3000) {
      return baseWage;
    } else {
      return baseWage + 10 * (qty - 3000);
    }
  }

  // Unified Progressive allowance formula per die:
  function calculateAllowancePerDie(qtyStr, baseWage = 30000, jobType = 'ep-kim') {
    if (jobType === 'be') {
      return calculateBeAllowancePerDie(qtyStr, 20000);
    }
    const qty = parseQtyPerDie(qtyStr);
    if (qty <= 3000) {
      return baseWage;
    } else {
      return baseWage + 15 * (qty - 3000);
    }
  }

  // --- LOCAL STORAGE HANDLING ---
  function loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        state = JSON.parse(data);
        if (!state.accounts) state.accounts = [];
        if (!state.craftsmen) state.craftsmen = [];
        if (!state.jobs) state.jobs = [];
        if (!state.activities) state.activities = [];
      } else {
        // First run: Seed data and dynamically calculate progressive wages
        state.theme = 'dark';
        state.currentUser = null;
        state.accounts = sampleAccounts;
        state.craftsmen = sampleCraftsmen;
        
        state.jobs = sampleJobsRaw.map(j => {
          const qtyList = Array(j.dies).fill(j.qtyPerDie);
          
          let totalWage = 0;
          qtyList.forEach(q => {
            totalWage += calculateAllowancePerDie(q, 30000, j.jobType);
          });

          return {
            id: j.id,
            orderCode: j.orderCode,
            name: j.name,
            color: j.jobType === 'ep-kim' ? 'Vàng bóng' : 'Bế thường',
            dies: j.dies,
            jobType: j.jobType,
            qtyList: qtyList,
            qtyPerDie: qtyList.join(' | '),
            craftsmanId: j.craftsmanId,
            wage: totalWage, // Total wage of all dies combined
            status: 'completed',
            dateCreated: j.dateCreated,
            dateCompleted: j.dateCreated
          };
        });

        state.activities = sampleActivities;
        saveState();
      }
    } catch (e) {
      console.error('Không thể tải dữ liệu từ localStorage', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Không thể lưu dữ liệu vào localStorage', e);
    }
  }

  function addActivity(text, type = 'primary') {
    state.activities.unshift({
      text,
      time: new Date().toISOString(),
      type
    });
    if (state.activities.length > 20) {
      state.activities.pop();
    }
    saveState();
    renderRecentActivities();
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    loadState();
    applyTheme();
    initNavigation();
    initDropdowns();
    setReportDates();
    
    // Initial Render
    // Check if session exists or trigger login overlay
    applyUserPermissions();
  });

  // --- AUTH SYSTEM (LOGIN / LOGOUT) ---
  function login(e) {
    if (e) e.preventDefault();
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;

    const acc = state.accounts.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
    if (acc) {
      state.currentUser = acc;
      saveState();
      
      document.getElementById('appLoginOverlay').classList.remove('active');
      document.getElementById('loginForm').reset();
      
      addActivity(`Đăng nhập thành công: ${acc.name} (${acc.isSystemAdmin ? 'Admin' : 'Thợ'})`, 'success');
      
      applyUserPermissions();
      switchView('dashboard');
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  }

  function logout() {
    state.currentUser = null;
    saveState();
    
    document.getElementById('appLoginOverlay').classList.add('active');
    document.getElementById('loginUsername').focus();
    
    addActivity('Đã đăng xuất khỏi hệ thống', 'primary');
  }

  function applyUserPermissions() {
    const cur = state.currentUser;
    if (!cur) {
      document.getElementById('appLoginOverlay').classList.add('active');
      return;
    }

    document.getElementById('appLoginOverlay').classList.remove('active');
    
    // Set current user label in sidebar footer
    const label = document.getElementById('currentUserLabel');
    if (label) {
      label.textContent = cur.name + (cur.isSystemAdmin ? ' (Admin)' : '');
    }

    // Configure sidebar menu items visibility
    const mDashboard = document.getElementById('menu-dashboard');
    const mJobs = document.getElementById('menu-jobs');
    const mBeJobs = document.getElementById('menu-be-jobs');
    const mCraftsmen = document.getElementById('menu-craftsmen');
    const mPayroll = document.getElementById('menu-payroll');
    const mAccounts = document.getElementById('menu-accounts');
    const mBackup = document.getElementById('menu-backup');

    const dashboardLayout = document.getElementById('dashboard-layout-container');
    const dashboardActivity = document.getElementById('dashboard-activity-panel');

    if (cur.isSystemAdmin) {
      if (mDashboard) mDashboard.style.display = 'block';
      if (mJobs) mJobs.style.display = 'block';
      if (mBeJobs) mBeJobs.style.display = 'block';
      if (mCraftsmen) mCraftsmen.style.display = 'block';
      if (mPayroll) mPayroll.style.display = 'block';
      if (mAccounts) mAccounts.style.display = 'block';
      if (mBackup) mBackup.style.display = 'block';

      if (dashboardActivity) dashboardActivity.style.display = 'flex';
      if (dashboardLayout) dashboardLayout.style.gridTemplateColumns = '2fr 1fr';
    } else {
      if (mDashboard) mDashboard.style.display = 'block';
      if (mJobs) mJobs.style.display = cur.roleEpKim ? 'block' : 'none';
      if (mBeJobs) mBeJobs.style.display = cur.roleBe ? 'block' : 'none';
      
      if (mCraftsmen) mCraftsmen.style.display = 'none';
      if (mPayroll) mPayroll.style.display = 'none';
      if (mAccounts) mAccounts.style.display = 'none';
      if (mBackup) mBackup.style.display = 'none';

      if (dashboardActivity) dashboardActivity.style.display = 'none';
      if (dashboardLayout) dashboardLayout.style.gridTemplateColumns = '1fr';
    }

    // Re-render everything to respect data filters
    renderDashboard();
    renderJobsTable();
    renderBeJobsTable();
    renderCraftsmenTable();
    renderAccountsTable();
    renderPayroll();
  }

  // --- THEME SYSTEM ---
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const sunIcon = document.getElementById('sunIcon');
    if (state.theme === 'light') {
      sunIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
    } else {
      sunIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m14.071-4.071l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />`;
    }
  }

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    applyTheme();
  });

  // --- NAVIGATION MANAGER ---
  let currentView = 'dashboard';

  function initNavigation() {
    const navItems = document.querySelectorAll('.menu-list .menu-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        switchView(targetView);
        
        const sidebar = document.getElementById('appSidebar');
        sidebar.classList.remove('mobile-active');
      });
    });

    const menuToggle = document.getElementById('menuToggleBtn');
    menuToggle.addEventListener('click', () => {
      const sidebar = document.getElementById('appSidebar');
      sidebar.classList.toggle('mobile-active');
    });

    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('appSidebar');
      const menuToggle = document.getElementById('menuToggleBtn');
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('mobile-active')) {
          sidebar.classList.remove('mobile-active');
        }
      }
    });
  }

  function switchView(viewName) {
    currentView = viewName;
    
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.remove('active'));
    
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    if (viewName === 'dashboard') {
      renderDashboard();
    } else if (viewName === 'jobs') {
      renderJobsTable();
    } else if (viewName === 'be-jobs') {
      renderBeJobsTable();
    } else if (viewName === 'craftsmen') {
      renderCraftsmenTable();
    } else if (viewName === 'accounts') {
      renderAccountsTable();
    } else if (viewName === 'payroll') {
      renderPayroll();
    }
  }

  // --- WELCOME HEADER GREETING ---
  function setWelcomeHeader() {
    const welcome = document.getElementById('welcomeText');
    if (!welcome) return;
    
    const cur = state.currentUser;
    const userName = cur ? cur.name : '';
    
    const hour = new Date().getHours();
    let greeting = 'Xin chào';
    if (hour < 12) greeting = 'Chào buổi sáng';
    else if (hour < 18) greeting = 'Chào buổi chiều';
    else greeting = 'Chào buổi tối';
    
    if (userName) {
      welcome.textContent = `${greeting}, ${userName}!`;
    } else {
      welcome.textContent = `${greeting}!`;
    }
  }

  // --- DROPDOWN INITIALIZER ---
  function initDropdowns() {
    populateCraftsmenDropdowns('ep-kim');
  }

  function populateCraftsmenDropdowns(jobType = 'ep-kim') {
    const jobFormCraftsman = document.getElementById('jobFormCraftsman');
    const filterJobCraftsman = document.getElementById('filterJobCraftsman');
    const filterBeJobCraftsman = document.getElementById('filterBeJobCraftsman');
    
    if (jobFormCraftsman) {
      jobFormCraftsman.innerHTML = '<option value="">-- Chọn thợ phụ trách --</option>';
      
      const eligibleCraftsmen = state.accounts.filter(acc => {
        if (acc.isSystemAdmin) return false;
        return jobType === 'be' ? acc.roleBe : acc.roleEpKim;
      });

      eligibleCraftsmen.forEach(c => {
        const optionHtml = `<option value="${c.craftsmanId}">${c.name}</option>`;
        jobFormCraftsman.insertAdjacentHTML('beforeend', optionHtml);
      });
    }

    if (filterJobCraftsman) {
      filterJobCraftsman.innerHTML = '<option value="all">Tất cả thợ</option>';
      state.accounts.filter(acc => !acc.isSystemAdmin && acc.roleEpKim).forEach(c => {
        const optionHtml = `<option value="${c.craftsmanId}">${c.name}</option>`;
        filterJobCraftsman.insertAdjacentHTML('beforeend', optionHtml);
      });
    }

    if (filterBeJobCraftsman) {
      filterBeJobCraftsman.innerHTML = '<option value="all">Tất cả thợ</option>';
      state.accounts.filter(acc => !acc.isSystemAdmin && acc.roleBe).forEach(c => {
        const optionHtml = `<option value="${c.craftsmanId}">${c.name}</option>`;
        filterBeJobCraftsman.insertAdjacentHTML('beforeend', optionHtml);
      });
    }
  }

  // --- FORMATTING UTILITIES ---
  function formatCurrency(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Hôm qua';
    return formatDate(isoString);
  }

  // --- DASHBOARD RENDERER ---
  function renderDashboard() {
    setWelcomeHeader();
    const totalJobs = state.jobs.length;
    const pendingJobs = state.jobs.filter(j => j.status === 'pending').length;
    
    let totalDies = 0;
    let totalPayroll = 0;

    state.jobs.forEach(j => {
      if (j.status === 'completed') {
        const dies = j.dies || 1;
        totalDies += dies;
        totalPayroll += j.wage || 0;
      }
    });

    document.getElementById('stat-total-jobs').textContent = totalJobs;
    document.getElementById('stat-total-sheets').textContent = totalDies.toLocaleString('vi-VN') + ' K';
    document.getElementById('stat-pending-jobs').textContent = pendingJobs;
    document.getElementById('stat-total-payroll').textContent = formatCurrency(totalPayroll);

    renderProductivityChart();
    renderRecentActivities();
  }

  function renderProductivityChart() {
    const container = document.getElementById('productivityChartContainer');
    if (!container) return;

    const data = state.craftsmen.map(c => {
      let dies = 0;
      state.jobs.forEach(j => {
        if (j.craftsmanId === c.id && j.status === 'completed') {
          dies += (j.dies || 1);
        }
      });
      return {
        name: c.name,
        dies: dies
      };
    });

    const maxDies = Math.max(...data.map(d => d.dies), 0);

    if (maxDies === 0) {
      container.innerHTML = `
        <div class="chart-empty">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Chưa có dữ liệu sản lượng hoàn thành của thợ.</span>
        </div>`;
      return;
    }

    let chartHtml = `<div class="chart-bars-wrapper">`;
    data.forEach(d => {
      const heightPercent = maxDies > 0 ? (d.dies / maxDies) * 90 : 0;
      chartHtml += `
        <div class="chart-bar-group">
          <div class="chart-bar-fill" style="height: ${heightPercent}%; background: linear-gradient(to top, var(--info), #22d3ee);">
            <div class="chart-bar-tooltip">${d.dies} K (khuôn)</div>
          </div>
          <div class="chart-bar-label" title="${d.name}">${d.name}</div>
        </div>`;
    });
    chartHtml += `</div>`;
    
    container.innerHTML = chartHtml;
  }

  function renderRecentActivities() {
    const list = document.getElementById('recentActivityList');
    if (!list) return;

    if (state.activities.length === 0) {
      list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center;">Chưa có hoạt động nào.</p>`;
      return;
    }

    list.innerHTML = state.activities.map(act => `
      <div class="activity-item">
        <div class="activity-marker ${act.type || 'primary'}"></div>
        <div class="activity-details">
          <span class="activity-text">${act.text}</span>
          <span class="activity-time">${formatTimeAgo(act.time)}</span>
        </div>
      </div>
    `).join('');
  }

  // --- JOBS VIEW RENDERER & ACTIONS ---
  let jobsFilter = {
    search: '',
    status: 'all',
    craftsman: 'all'
  };

  function renderJobsTable() {
    const tbody = document.getElementById('jobsTableBody');
    if (!tbody) return;

    const filteredJobs = state.jobs.filter(j => {
      // Must be foil stamping type
      if (j.jobType && j.jobType !== 'ep-kim') return false;
      
      // Filter by logged-in craftsman
      if (state.currentUser && !state.currentUser.isSystemAdmin) {
        if (j.craftsmanId !== state.currentUser.craftsmanId) return false;
      }

      const matchSearch = j.name.toLowerCase().includes(jobsFilter.search.toLowerCase()) || 
                          (j.orderCode && j.orderCode.toLowerCase().includes(jobsFilter.search.toLowerCase()));
      const matchStatus = jobsFilter.status === 'all' || j.status === jobsFilter.status;
      const matchCraftsman = jobsFilter.craftsman === 'all' || j.craftsmanId === jobsFilter.craftsman;
      return matchSearch && matchStatus && matchCraftsman;
    });

    filteredJobs.sort((a, b) => new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0));

    if (filteredJobs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy bài ép kim nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredJobs.map(j => {
      const craftsman = state.craftsmen.find(c => c.id === j.craftsmanId);
      const craftsmanName = craftsman ? craftsman.name : '<span style="color: var(--danger);">Chưa phân công</span>';
      
      let statusBadge = '';
      if (j.status === 'pending') statusBadge = '<span class="badge badge-pending">Chờ xử lý</span>';
      else if (j.status === 'active') statusBadge = '<span class="badge badge-active">Đang làm</span>';
      else if (j.status === 'completed') statusBadge = '<span class="badge badge-completed">Đã xong</span>';

      let actionButtons = '';
      if (j.status !== 'completed') {
        actionButtons += `
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; background-color: var(--success-bg); color: var(--success); border-color: rgba(16, 185, 129, 0.2);" onclick="window.app.quickCompleteJob('${j.id}')" title="Xong bài">
            ✓ Xong bài
          </button>`;
      }

      actionButtons += `
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.openEditJobModal('${j.id}')" title="Sửa">
          ✏️
        </button>
        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.deleteJob('${j.id}')" title="Xóa">
          🗑️
        </button>`;

      const dateDisplay = j.dateCompleted ? formatDate(j.dateCompleted) : formatDate(j.dateCreated);

      // Render quantities and allowances for each die
      let qtyDisplay = '';
      if (j.qtyList && j.qtyList.length > 1) {
        qtyDisplay = j.qtyList.map((q, idx) => {
          const parsed = parseQtyPerDie(q);
          const dieAllowance = calculateAllowancePerDie(q, 30000);
          const progressiveMark = parsed > 3000 ? ' <strong style="color: var(--success);">+</strong>' : '';
          return `<div>Khuôn ${idx + 1}: <strong>${parsed.toLocaleString('vi-VN')}</strong> lượt (<span style="color: var(--info); font-weight: 500;">+${formatCurrency(dieAllowance)}</span>)${progressiveMark}</div>`;
        }).join('');
      } else {
        const singleQty = (j.qtyList && j.qtyList[0]) || j.qtyPerDie;
        const parsed = parseQtyPerDie(singleQty);
        const dieAllowance = calculateAllowancePerDie(singleQty, 30000);
        const progressiveMark = parsed > 3000 ? ' <strong style="color: var(--success); font-size:0.75rem;">(Lũy tiến)</strong>' : '';
        qtyDisplay = `<div><strong>${parsed.toLocaleString('vi-VN')}</strong> lượt (<span style="color: var(--info); font-weight: 500;">${formatCurrency(dieAllowance)}</span>)${progressiveMark}</div>`;
      }

      return `
        <tr>
          <td><strong>${dateDisplay}</strong></td>
          <td><span class="badge badge-secondary" style="font-family: monospace; font-size: 0.85rem; background-color: var(--border-color); color: var(--text-primary); border: 1px solid var(--border-color);">${j.orderCode || '-'}</span></td>
          <td><div style="font-weight: 600;">${j.name}</div></td>
          <td style="text-align: center; font-weight: bold; color: var(--info); font-size: 1.05rem;">${j.dies}</td>
          <td>${qtyDisplay}</td>
          <td><strong>${craftsmanName}</strong></td>
          <td style="text-align: right; font-weight: bold; color: var(--success);">${formatCurrency(j.wage || 0)}</td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterJobs() {
    const search = document.getElementById('searchJobInput');
    const status = document.getElementById('filterJobStatus');
    const craftsman = document.getElementById('filterJobCraftsman');

    jobsFilter.search = search ? search.value : '';
    jobsFilter.status = status ? status.value : 'all';
    jobsFilter.craftsman = craftsman ? craftsman.value : 'all';

    renderJobsTable();
  }

  // --- JOB DIALOG / DYNAMIC INPUTS ---
  
  function generateDieInputs(qtyList = []) {
    const container = document.getElementById('jobFormDiesContainer');
    if (!container) return;

    // If empty, guarantee at least 1 die
    if (qtyList.length === 0) {
      qtyList = [''];
    }
    
    // Set hidden input value for dies count (K)
    const hiddenDies = document.getElementById('jobFormDies');
    if (hiddenDies) {
      hiddenDies.value = qtyList.length;
    }
    
    container.innerHTML = '';
    
    qtyList.forEach((val, i) => {
      // Excel style die row: "Khuôn X" | "Số lượng: [input]" | "Phụ cấp: 30.000đ" | [Trash Button if i > 0]
      const html = `
        <div class="die-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
          <span style="font-weight: 600; min-width: 75px; font-size: 0.9rem; color: var(--text-primary);">Khuôn ${i + 1}</span>
          <div style="flex-grow: 1; display: flex; align-items: center; gap: 8px; min-width: 200px;">
            <span style="font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">Số lượng:</span>
            <input type="text" class="form-control die-qty-input" data-index="${i}" value="${val}" placeholder="Ví dụ: 3000" required style="padding: 8px 12px; height: 38px;" oninput="window.app.updateFormWages()">
          </div>
          <div style="display: flex; align-items: center; gap: 8px; width: 150px; justify-content: flex-end;">
            <span style="font-size: 0.8rem; color: var(--info); font-weight: bold; background-color: rgba(6, 182, 212, 0.08); padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid rgba(6, 182, 212, 0.15); display: inline-block; white-space: nowrap;" id="dieWagePreview_${i}">0đ</span>
            ${i > 0 ? `
              <button type="button" class="btn btn-danger" style="padding: 6px 8px; border-radius: var(--radius-sm); height: 32px; min-width: 32px; display: inline-flex;" onclick="window.app.removeDieInput(${i})" title="Xóa khuôn">
                🗑️
              </button>
            ` : `<div style="width: 32px;"></div>`}
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });
    
    updateFormWages();
  }

  function getTypedQtyList() {
    const inputs = document.querySelectorAll('.die-qty-input');
    const qtyList = [];
    inputs.forEach(input => {
      qtyList.push(input.value);
    });
    return qtyList;
  }

  function addDieInput() {
    const qtyList = getTypedQtyList();
    qtyList.push('');
    generateDieInputs(qtyList);
  }

  function removeDieInput(index) {
    const qtyList = getTypedQtyList();
    qtyList.splice(index, 1);
    generateDieInputs(qtyList);
  }

  function updateFormWages() {
    const inputs = document.querySelectorAll('.die-qty-input');
    let totalWages = 0;

    inputs.forEach(input => {
      const idx = input.getAttribute('data-index');
      const qtyStr = input.value;
      const dieWage = calculateAllowancePerDie(qtyStr, 30000);
      
      totalWages += dieWage;

      // Update individual preview
      const preview = document.getElementById(`dieWagePreview_${idx}`);
      if (preview) {
        preview.textContent = formatCurrency(dieWage);
      }
    });

    // Update main total label
    const totalLabel = document.getElementById('jobFormTotalWageDisplay');
    if (totalLabel) {
      totalLabel.textContent = formatCurrency(totalWages);
    }
  }

  // --- JOB DIALOGS & CRUD ACTIONS ---
  let jobModalType = 'ep-kim';

  function openAddJobModal() {
    jobModalType = 'ep-kim';
    document.getElementById('jobForm').reset();
    document.getElementById('jobFormId').value = '';
    document.getElementById('jobFormCode').value = '';
    document.getElementById('jobFormStatus').value = 'completed';
    document.getElementById('jobFormDies').value = 1;
    
    document.getElementById('jobFormDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('jobModalTitle').textContent = 'Thêm bài ép kim mới';
    
    const nameLabel = document.querySelector('label[for="jobFormName"]');
    if (nameLabel) nameLabel.textContent = 'Tên bài ép kim *';

    populateCraftsmenDropdowns('ep-kim');

    if (state.currentUser && !state.currentUser.isSystemAdmin) {
      document.getElementById('jobFormCraftsman').value = state.currentUser.craftsmanId || '';
      document.getElementById('jobFormCraftsman').disabled = true;
    } else {
      document.getElementById('jobFormCraftsman').disabled = false;
    }

    generateDieInputs(['']);
    document.getElementById('jobModal').classList.add('active');
  }

  function openAddBeJobModal() {
    jobModalType = 'be';
    document.getElementById('jobForm').reset();
    document.getElementById('jobFormId').value = '';
    document.getElementById('jobFormCode').value = '';
    document.getElementById('jobFormStatus').value = 'completed';
    document.getElementById('jobFormDies').value = 1;
    
    document.getElementById('jobFormDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('jobModalTitle').textContent = 'Thêm bài bế hộp mới';
    
    const nameLabel = document.querySelector('label[for="jobFormName"]');
    if (nameLabel) nameLabel.textContent = 'Tên bài bế hộp *';

    populateCraftsmenDropdowns('be');

    if (state.currentUser && !state.currentUser.isSystemAdmin) {
      document.getElementById('jobFormCraftsman').value = state.currentUser.craftsmanId || '';
      document.getElementById('jobFormCraftsman').disabled = true;
    } else {
      document.getElementById('jobFormCraftsman').disabled = false;
    }

    generateDieInputs(['']);
    document.getElementById('jobModal').classList.add('active');
  }

  function openEditJobModal(jobId) {
    const j = state.jobs.find(x => x.id === jobId);
    if (!j) return;

    jobModalType = j.jobType || 'ep-kim';
    
    document.getElementById('jobFormId').value = j.id;
    document.getElementById('jobFormCode').value = j.orderCode || '';
    document.getElementById('jobFormName').value = j.name;
    document.getElementById('jobFormDies').value = j.dies;
    document.getElementById('jobFormStatus').value = j.status;
    
    const targetDate = j.dateCompleted || j.dateCreated || new Date().toISOString();
    document.getElementById('jobFormDate').value = targetDate.split('T')[0];

    const nameLabel = document.querySelector('label[for="jobFormName"]');
    if (jobModalType === 'be') {
      document.getElementById('jobModalTitle').textContent = 'Chỉnh sửa bài bế';
      if (nameLabel) nameLabel.textContent = 'Tên bài bế hộp *';
    } else {
      document.getElementById('jobModalTitle').textContent = 'Chỉnh sửa bài ép';
      if (nameLabel) nameLabel.textContent = 'Tên bài ép kim *';
    }

    populateCraftsmenDropdowns(jobModalType);
    
    document.getElementById('jobFormCraftsman').value = j.craftsmanId;
    if (state.currentUser && !state.currentUser.isSystemAdmin) {
      document.getElementById('jobFormCraftsman').disabled = true;
    } else {
      document.getElementById('jobFormCraftsman').disabled = false;
    }

    generateDieInputs(j.qtyList || [j.qtyPerDie]);
    document.getElementById('jobModal').classList.add('active');
  }

  function closeJobModal() {
    document.getElementById('jobModal').classList.remove('active');
  }

  function saveJob(e) {
    e.preventDefault();
    
    const id = document.getElementById('jobFormId').value;
    const orderCode = document.getElementById('jobFormCode').value;
    const name = document.getElementById('jobFormName').value;
    const dies = parseInt(document.getElementById('jobFormDies').value);
    const craftsmanId = document.getElementById('jobFormCraftsman').value;
    const status = document.getElementById('jobFormStatus').value;
    const dateVal = document.getElementById('jobFormDate').value;
    
    const targetISO = new Date(dateVal + 'T12:00:00.000Z').toISOString();

    const inputs = document.querySelectorAll('.die-qty-input');
    const qtyList = [];
    let calculatedTotalWage = 0;

    inputs.forEach(input => {
      const q = input.value;
      qtyList.push(q);
      calculatedTotalWage += calculateAllowancePerDie(q, 30000, jobModalType);
    });

    const qtyPerDie = qtyList.join(' | ');

    if (id) {
      const jIdx = state.jobs.findIndex(x => x.id === id);
      if (jIdx !== -1) {
        const oldJob = state.jobs[jIdx];
        
        state.jobs[jIdx] = {
          ...oldJob,
          orderCode,
          name,
          dies,
          qtyList,
          qtyPerDie,
          craftsmanId,
          wage: calculatedTotalWage,
          status,
          dateCreated: targetISO,
          dateCompleted: status === 'completed' ? targetISO : null
        };
        addActivity(`Đã sửa bài ${jobModalType === 'be' ? 'bế' : 'ép'}: ${name}`, 'primary');
      }
    } else {
      const newJob = {
        id: 'job_' + Date.now(),
        orderCode,
        name,
        dies,
        jobType: jobModalType,
        color: jobModalType === 'be' ? 'Bế thường' : 'Vàng bóng',
        qtyList,
        qtyPerDie,
        craftsmanId,
        wage: calculatedTotalWage,
        status,
        dateCreated: targetISO,
        dateCompleted: status === 'completed' ? targetISO : null
      };
      state.jobs.push(newJob);
      addActivity(`Đã thêm bài ${jobModalType === 'be' ? 'bế' : 'ép'} mới: ${name} (${dies} K)`, 'success');
    }

    saveState();
    closeJobModal();
    renderDashboard();
    renderJobsTable();
    renderBeJobsTable();
  }

  function quickCompleteJob(jobId) {
    const jIdx = state.jobs.findIndex(x => x.id === jobId);
    if (jIdx !== -1) {
      const job = state.jobs[jIdx];
      state.jobs[jIdx] = {
        ...job,
        status: 'completed',
        dateCompleted: new Date().toISOString()
      };
      
      const craftsman = state.craftsmen.find(c => c.id === job.craftsmanId);
      const craftsmanName = craftsman ? craftsman.name : 'thợ';

      addActivity(`Thợ ${craftsmanName} đã hoàn thành bài: ${job.name}`, 'success');
      saveState();
      renderDashboard();
      renderJobsTable();
      renderBeJobsTable();
    }
  }

  function deleteJob(jobId) {
    const j = state.jobs.find(x => x.id === jobId);
    if (!j) return;

    if (confirm(`Bạn có chắc chắn muốn xóa bài "${j.name}"?`)) {
      state.jobs = state.jobs.filter(x => x.id !== jobId);
      addActivity(`Đã xóa bài: ${j.name}`, 'danger');
      saveState();
      renderDashboard();
      renderJobsTable();
      renderBeJobsTable();
    }
  }

  // --- DIE-CUTTING (BẾ) JOBS VIEW RENDERER & ACTIONS ---
  let beJobsFilter = {
    search: '',
    status: 'all',
    craftsman: 'all'
  };

  function renderBeJobsTable() {
    const tbody = document.getElementById('beJobsTableBody');
    if (!tbody) return;

    const filteredJobs = state.jobs.filter(j => {
      // Must be die-cutting type
      if (j.jobType !== 'be') return false;
      
      // Filter by logged-in craftsman
      if (state.currentUser && !state.currentUser.isSystemAdmin) {
        if (j.craftsmanId !== state.currentUser.craftsmanId) return false;
      }

      const matchSearch = j.name.toLowerCase().includes(beJobsFilter.search.toLowerCase()) || 
                          (j.orderCode && j.orderCode.toLowerCase().includes(beJobsFilter.search.toLowerCase()));
      const matchStatus = beJobsFilter.status === 'all' || j.status === beJobsFilter.status;
      const matchCraftsman = beJobsFilter.craftsman === 'all' || j.craftsmanId === beJobsFilter.craftsman;
      return matchSearch && matchStatus && matchCraftsman;
    });

    filteredJobs.sort((a, b) => new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0));

    if (filteredJobs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy bài bế hộp nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredJobs.map(j => {
      const craftsman = state.craftsmen.find(c => c.id === j.craftsmanId);
      const craftsmanName = craftsman ? craftsman.name : '<span style="color: var(--danger);">Chưa phân công</span>';
      
      let statusBadge = '';
      if (j.status === 'pending') statusBadge = '<span class="badge badge-pending">Chờ xử lý</span>';
      else if (j.status === 'active') statusBadge = '<span class="badge badge-active">Đang làm</span>';
      else if (j.status === 'completed') statusBadge = '<span class="badge badge-completed">Đã xong</span>';

      let actionButtons = '';
      if (j.status !== 'completed') {
        actionButtons += `
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; background-color: var(--success-bg); color: var(--success); border-color: rgba(16, 185, 129, 0.2);" onclick="window.app.quickCompleteJob('${j.id}')" title="Xong bài">
            ✓ Xong bài
          </button>`;
      }

      actionButtons += `
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.openEditJobModal('${j.id}')" title="Sửa">
          ✏️
        </button>
        <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.deleteJob('${j.id}')" title="Xóa">
          🗑️
        </button>`;

      const dateDisplay = j.dateCompleted ? formatDate(j.dateCompleted) : formatDate(j.dateCreated);

      // Render quantities and allowances for each die
      let qtyDisplay = '';
      if (j.qtyList && j.qtyList.length > 1) {
        qtyDisplay = j.qtyList.map((q, idx) => {
          const parsed = parseQtyPerDie(q);
          const dieAllowance = calculateAllowancePerDie(q, 20000, 'be');
          const progressiveMark = parsed > 3000 ? ' <strong style="color: var(--success);">+</strong>' : '';
          return `<div>Khuôn ${idx + 1}: <strong>${parsed.toLocaleString('vi-VN')}</strong> lượt bế (<span style="color: var(--info); font-weight: 500;">+${formatCurrency(dieAllowance)}</span>)${progressiveMark}</div>`;
        }).join('');
      } else {
        const singleQty = (j.qtyList && j.qtyList[0]) || j.qtyPerDie;
        const parsed = parseQtyPerDie(singleQty);
        const dieAllowance = calculateAllowancePerDie(singleQty, 20000, 'be');
        const progressiveMark = parsed > 3000 ? ' <strong style="color: var(--success); font-size:0.75rem;">(Lũy tiến)</strong>' : '';
        qtyDisplay = `<div><strong>${parsed.toLocaleString('vi-VN')}</strong> lượt bế (<span style="color: var(--info); font-weight: 500;">${formatCurrency(dieAllowance)}</span>)${progressiveMark}</div>`;
      }

      return `
        <tr>
          <td><strong>${dateDisplay}</strong></td>
          <td><span class="badge badge-secondary" style="font-family: monospace; font-size: 0.85rem; background-color: var(--border-color); color: var(--text-primary); border: 1px solid var(--border-color);">${j.orderCode || '-'}</span></td>
          <td><div style="font-weight: 600;">${j.name}</div></td>
          <td style="text-align: center; font-weight: bold; color: var(--info); font-size: 1.05rem;">${j.dies}</td>
          <td>${qtyDisplay}</td>
          <td><strong>${craftsmanName}</strong></td>
          <td style="text-align: right; font-weight: bold; color: var(--success);">${formatCurrency(j.wage || 0)}</td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterBeJobs() {
    const search = document.getElementById('searchBeJobInput');
    const status = document.getElementById('filterBeJobStatus');
    const craftsman = document.getElementById('filterBeJobCraftsman');

    beJobsFilter.search = search ? search.value : '';
    beJobsFilter.status = status ? status.value : 'all';
    beJobsFilter.craftsman = craftsman ? craftsman.value : 'all';

    renderBeJobsTable();
  }

  // --- CRAFTSMEN VIEW RENDERER ---
  function renderCraftsmenTable() {
    const tbody = document.getElementById('craftsmenTableBody');
    if (!tbody) return;

    if (state.craftsmen.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">Không có thợ nào. Vui lòng thêm thợ mới.</td></tr>`;
      return;
    }

    tbody.innerHTML = state.craftsmen.map((c, index) => {
      const assignedJobs = state.jobs.filter(j => j.craftsmanId === c.id);
      const completedJobs = assignedJobs.filter(j => j.status === 'completed');
      const activeJobs = assignedJobs.filter(j => j.status === 'active');
      
      let totalDies = 0;
      let totalWages = 0;

      completedJobs.forEach(j => {
        const dies = j.dies || 1;
        totalDies += dies;
        totalWages += j.wage || 0;
      });

      return `
        <tr>
          <td><strong>${index + 1}</strong></td>
          <td><div style="font-weight: 600; font-size: 0.95rem;">${c.name}</div></td>
          <td>${c.phone || '-'}</td>
          <td><span style="font-size: 0.85rem; color: var(--text-secondary);">${c.role || '-'}</span></td>
          <td style="text-align: center;"><span class="badge badge-active">${activeJobs.length}</span></td>
          <td style="text-align: center;"><span class="badge badge-completed">${completedJobs.length}</span></td>
          <td style="text-align: center; font-weight: bold; color: var(--info);">${totalDies} K</td>
          <td style="text-align: right; font-weight: bold; color: var(--success);">${formatCurrency(totalWages)}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.openEditCraftsmanModal('${c.id}')" title="Sửa">
                ✏️
              </button>
              <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.deleteCraftsman('${c.id}')" title="Xóa">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- CRAFTSMAN DIALOG/MODAL CONTROLS ---
  function openAddCraftsmanModal() {
    document.getElementById('craftsmanForm').reset();
    document.getElementById('craftsmanFormId').value = '';
    document.getElementById('craftsmanModalTitle').textContent = 'Thêm thợ ép kim mới';
    document.getElementById('craftsmanModal').classList.add('active');
  }

  function openEditCraftsmanModal(craftsmanId) {
    const c = state.craftsmen.find(x => x.id === craftsmanId);
    if (!c) return;

    document.getElementById('craftsmanFormId').value = c.id;
    document.getElementById('craftsmanFormName').value = c.name;
    document.getElementById('craftsmanFormPhone').value = c.phone || '';
    document.getElementById('craftsmanFormRole').value = c.role || '';

    document.getElementById('craftsmanModalTitle').textContent = 'Chỉnh sửa thông tin thợ';
    document.getElementById('craftsmanModal').classList.add('active');
  }

  function closeCraftsmanModal() {
    document.getElementById('craftsmanModal').classList.remove('active');
  }

  function saveCraftsman(e) {
    e.preventDefault();

    const id = document.getElementById('craftsmanFormId').value;
    const name = document.getElementById('craftsmanFormName').value;
    const phone = document.getElementById('craftsmanFormPhone').value;
    const role = document.getElementById('craftsmanFormRole').value;

    if (id) {
      // Edit
      const cIdx = state.craftsmen.findIndex(x => x.id === id);
      if (cIdx !== -1) {
        state.craftsmen[cIdx] = {
          ...state.craftsmen[cIdx],
          name,
          phone,
          role
        };
        addActivity(`Đã sửa thông tin thợ: ${name}`, 'primary');
      }
    } else {
      // Add
      const newCraftsman = {
        id: 'cm_' + Date.now(),
        name,
        phone,
        role
      };
      state.craftsmen.push(newCraftsman);
      addActivity(`Đã thêm thợ ép mới: ${name}`, 'success');
    }

    saveState();
    closeCraftsmanModal();
    renderCraftsmenTable();
    populateCraftsmenDropdowns();
  }

  function deleteCraftsman(craftsmanId) {
    const c = state.craftsmen.find(x => x.id === craftsmanId);
    if (!c) return;

    if (confirm(`Bạn có chắc muốn xóa thợ "${c.name}"? Các bài ép liên quan sẽ ở trạng thái Chưa phân công.`)) {
      state.craftsmen = state.craftsmen.filter(x => x.id !== craftsmanId);
      
      state.jobs = state.jobs.map(j => {
        if (j.craftsmanId === craftsmanId) {
          return { ...j, craftsmanId: '' };
        }
        return j;
      });

      addActivity(`Đã xóa thợ: ${c.name}`, 'danger');
      saveState();
      renderCraftsmenTable();
      populateCraftsmenDropdowns();
    }
  }

  // --- ACCOUNTS MANAGEMENT (ADMIN) ---
  function renderAccountsTable() {
    const tbody = document.getElementById('accountsTableBody');
    if (!tbody) return;

    if (!state.accounts || state.accounts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Không có tài khoản nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = state.accounts.map(acc => {
      const isEpKimChecked = acc.roleEpKim ? '✅' : '❌';
      const isBeChecked = acc.roleBe ? '✅' : '❌';
      const adminBadge = acc.isSystemAdmin ? '<span class="badge badge-completed">Admin</span>' : '<span class="badge badge-secondary">Thợ</span>';
      
      const canDelete = acc.username !== 'admin';
      const actionButtons = `
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.openEditAccountModal('${acc.id}')" title="Sửa">
          ✏️
        </button>
        ${canDelete ? `
          <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.8rem;" onclick="window.app.deleteAccount('${acc.id}')" title="Xóa">
            🗑️
          </button>
        ` : ''}
      `;

      return `
        <tr>
          <td><div style="font-weight: 600; font-size: 0.95rem;">${acc.name}</div></td>
          <td><span style="font-family: monospace; font-size: 0.9rem; color: var(--text-secondary);">${acc.username}</span></td>
          <td style="text-align: center;">${isEpKimChecked}</td>
          <td style="text-align: center;">${isBeChecked}</td>
          <td>${adminBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openAddAccountModal() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountFormId').value = '';
    document.getElementById('accountFormUsername').disabled = false;
    document.getElementById('accountModalTitle').textContent = 'Thêm tài khoản mới';
    document.getElementById('accountModal').classList.add('active');
  }

  function openEditAccountModal(accountId) {
    const acc = state.accounts.find(x => x.id === accountId);
    if (!acc) return;

    document.getElementById('accountFormId').value = acc.id;
    document.getElementById('accountFormName').value = acc.name;
    document.getElementById('accountFormUsername').value = acc.username;
    document.getElementById('accountFormUsername').disabled = acc.username === 'admin';
    document.getElementById('accountFormPassword').value = acc.password;
    document.getElementById('accountFormRoleEpKim').checked = !!acc.roleEpKim;
    document.getElementById('accountFormRoleBe').checked = !!acc.roleBe;
    document.getElementById('accountFormIsAdmin').checked = !!acc.isSystemAdmin;

    document.getElementById('accountModalTitle').textContent = 'Chỉnh sửa tài khoản';
    document.getElementById('accountModal').classList.add('active');
  }

  function closeAccountModal() {
    document.getElementById('accountModal').classList.remove('active');
  }

  function saveAccount(e) {
    e.preventDefault();

    const id = document.getElementById('accountFormId').value;
    const name = document.getElementById('accountFormName').value.trim();
    const username = document.getElementById('accountFormUsername').value.trim().toLowerCase();
    const password = document.getElementById('accountFormPassword').value;
    const roleEpKim = document.getElementById('accountFormRoleEpKim').checked;
    const roleBe = document.getElementById('accountFormRoleBe').checked;
    const isSystemAdmin = document.getElementById('accountFormIsAdmin').checked;

    const existing = state.accounts.find(x => x.username === username && x.id !== id);
    if (existing) {
      alert('Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }

    if (id) {
      // Edit
      const accIdx = state.accounts.findIndex(x => x.id === id);
      if (accIdx !== -1) {
        const oldAcc = state.accounts[accIdx];
        let craftsmanId = oldAcc.craftsmanId;

        if (!isSystemAdmin && !craftsmanId) {
          craftsmanId = 'cm_' + Date.now();
        }

        if (!isSystemAdmin) {
          const cIdx = state.craftsmen.findIndex(x => x.id === craftsmanId);
          const roleDesc = (roleEpKim && roleBe) ? 'Thợ chính (Ép & Bế)' : (roleEpKim ? 'Thợ ép kim' : (roleBe ? 'Thợ bế hộp' : 'Chưa phân loại'));
          if (cIdx !== -1) {
            state.craftsmen[cIdx].name = name;
            state.craftsmen[cIdx].role = roleDesc;
          } else {
            state.craftsmen.push({
              id: craftsmanId,
              name: name,
              phone: '',
              role: roleDesc
            });
          }
        }

        state.accounts[accIdx] = {
          ...oldAcc,
          name,
          username,
          password,
          roleEpKim,
          roleBe,
          isSystemAdmin,
          craftsmanId: isSystemAdmin ? null : craftsmanId
        };
        addActivity(`Đã sửa tài khoản: ${name}`, 'primary');
      }
    } else {
      // Add
      const accountId = 'acc_' + Date.now();
      let craftsmanId = null;

      if (!isSystemAdmin) {
        craftsmanId = 'cm_' + Date.now();
        const roleDesc = (roleEpKim && roleBe) ? 'Thợ chính (Ép & Bế)' : (roleEpKim ? 'Thợ ép kim' : (roleBe ? 'Thợ bế hộp' : 'Chưa phân loại'));
        state.craftsmen.push({
          id: craftsmanId,
          name: name,
          phone: '',
          role: roleDesc
        });
      }

      state.accounts.push({
        id: accountId,
        name,
        username,
        password,
        roleEpKim,
        roleBe,
        isSystemAdmin,
        craftsmanId
      });
      addActivity(`Đã tạo tài khoản mới: ${name}`, 'success');
    }

    saveState();
    closeAccountModal();
    renderAccountsTable();
    renderCraftsmenTable();
    populateCraftsmenDropdowns();
  }

  function deleteAccount(accountId) {
    const acc = state.accounts.find(x => x.id === accountId);
    if (!acc) return;

    if (acc.username === 'admin') {
      alert('Không thể xóa tài khoản Admin tối cao!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${acc.name}"? Thợ liên kết cũng sẽ bị xóa.`)) {
      state.accounts = state.accounts.filter(x => x.id !== accountId);
      
      if (acc.craftsmanId) {
        state.craftsmen = state.craftsmen.filter(x => x.id !== acc.craftsmanId);
        state.jobs = state.jobs.map(j => {
          if (j.craftsmanId === acc.craftsmanId) {
            return { ...j, craftsmanId: '' };
          }
          return j;
        });
      }

      addActivity(`Đã xóa tài khoản: ${acc.name}`, 'danger');
      saveState();
      renderAccountsTable();
      renderCraftsmenTable();
      populateCraftsmenDropdowns();
    }
  }

  // --- REPORTS & PAYROLL CALCULATIONS ---
  let reportPeriod = 'all';

  function setReportDates() {
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    if (!startInput || !endInput) return;

    const todayStr = new Date().toISOString().split('T')[0];
    startInput.value = todayStr;
    endInput.value = todayStr;
  }

  function changeReportPeriod(period) {
    reportPeriod = period;

    const periods = ['today', 'week', 'month', 'all'];
    periods.forEach(p => {
      const btn = document.getElementById(`btn-period-${p}`);
      if (btn) {
        if (p === period) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    renderPayroll();
  }

  function renderPayroll() {
    const tbody = document.getElementById('payrollTableBody');
    const totalWagesVal = document.getElementById('payrollTotalValue');
    const periodLabel = document.getElementById('payrollPeriodLabel');
    if (!tbody || !totalWagesVal) return;

    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');

    let startDate, endDate;
    let label = 'Báo cáo: ';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reportPeriod === 'today') {
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      label += 'Hôm nay (' + formatDate(startDate.toISOString()) + ')';
    } else if (reportPeriod === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      label += '7 ngày gần đây (' + formatDate(startDate.toISOString()) + ' - ' + formatDate(endDate.toISOString()) + ')';
    } else if (reportPeriod === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      label += 'Tháng này (' + formatDate(startDate.toISOString()) + ' - ' + formatDate(endDate.toISOString()) + ')';
    } else if (reportPeriod === 'all') {
      startDate = new Date(0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      label += 'Tất cả thời gian';
    } else if (reportPeriod === 'custom') {
      startDate = new Date(startInput.value);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endInput.value);
      endDate.setHours(23, 59, 59, 999);
      label += 'Tùy chọn (' + formatDate(startDate.toISOString()) + ' - ' + formatDate(endDate.toISOString()) + ')';
    }

    if (periodLabel) periodLabel.textContent = label;

    const filteredJobs = state.jobs.filter(j => {
      if (j.status !== 'completed') return false;
      const completedDate = new Date(j.dateCompleted || j.dateCreated);
      return completedDate >= startDate && completedDate <= endDate;
    });

    let overallTotalWages = 0;

    const payrollData = state.craftsmen.map(c => {
      const cJobs = filteredJobs.filter(j => j.craftsmanId === c.id);
      
      let totalDies = 0;
      let wages = 0;
      let epKimJobsCount = 0;
      let beJobsCount = 0;
      let epKimDies = 0;
      let beDies = 0;
      let epKimWages = 0;
      let beWages = 0;

      cJobs.forEach(j => {
        const dies = j.dies || 1;
        totalDies += dies;
        wages += (j.wage || 0);

        if (j.jobType === 'be') {
          beJobsCount++;
          beDies += dies;
          beWages += (j.wage || 0);
        } else {
          epKimJobsCount++;
          epKimDies += dies;
          epKimWages += (j.wage || 0);
        }
      });

      overallTotalWages += wages;

      return {
        name: c.name,
        jobsCount: cJobs.length,
        totalDies,
        wages,
        epKimJobsCount,
        beJobsCount,
        epKimDies,
        beDies,
        epKimWages,
        beWages
      };
    });

    totalWagesVal.textContent = formatCurrency(overallTotalWages);

    if (payrollData.every(x => x.jobsCount === 0)) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">Không có bài hoàn thành nào trong thời gian này.</td></tr>`;
      return;
    }

    tbody.innerHTML = payrollData.map(d => {
      return `
        <tr>
          <td>
            <div style="font-weight: 600; font-size: 0.95rem;">${d.name}</div>
          </td>
          <td style="text-align: center;">
            <div><strong>${d.jobsCount}</strong> bài</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
              ${d.epKimJobsCount > 0 ? `Ép: ${d.epKimJobsCount}` : ''}
              ${d.epKimJobsCount > 0 && d.beJobsCount > 0 ? ' | ' : ''}
              ${d.beJobsCount > 0 ? `Bế: ${d.beJobsCount}` : ''}
              ${d.epKimJobsCount === 0 && d.beJobsCount === 0 ? 'Không có bài' : ''}
            </div>
          </td>
          <td style="text-align: center;">
            <div style="font-weight: bold; color: var(--info);">${d.totalDies} K</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
              ${d.epKimDies > 0 ? `Ép: ${d.epKimDies}K` : ''}
              ${d.epKimDies > 0 && d.beDies > 0 ? ' | ' : ''}
              ${d.beDies > 0 ? `Bế: ${d.beDies}K` : ''}
            </div>
          </td>
          <td style="text-align: right;">
            <div style="font-weight: bold; color: var(--success);">${formatCurrency(d.wages)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
              ${d.epKimWages > 0 ? `Ép: ${formatCurrency(d.epKimWages)}` : ''}
              ${d.epKimWages > 0 && d.beWages > 0 ? '<br>' : ''}
              ${d.beWages > 0 ? `Bế: ${formatCurrency(d.beWages)}` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- EXPORT CSV PAYROLL ---
  function exportPayrollCSV() {
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    
    let startDate = reportPeriod === 'all' ? new Date(0) : new Date(startInput.value);
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date(endInput.value);
    endDate.setHours(23, 59, 59, 999);

    const filteredJobs = state.jobs.filter(j => {
      if (j.status !== 'completed') return false;
      const date = new Date(j.dateCompleted || j.dateCreated);
      return date >= startDate && date <= endDate;
    });

    let csvContent = '\uFEFF';
    csvContent += 'Báo cáo sản lượng & Tính phụ cấp công thợ (Ép kim & Bế hộp)\n';
    csvContent += `Thời gian: từ ${formatDate(startDate.toISOString())} đến ${formatDate(endDate.toISOString())}\n\n`;
    csvContent += 'Tên thợ,Số bài hoàn thành,Số bài ép kim,Số bài bế,Tổng khuôn (K),Khuôn ép kim,Khuôn bế,Tổng phụ cấp (đ),Phụ cấp ép kim (đ),Phụ cấp bế (đ)\n';

    state.craftsmen.forEach(c => {
      const cJobs = filteredJobs.filter(j => j.craftsmanId === c.id);
      let totalDies = 0, wages = 0;
      let epKimJobs = 0, beJobs = 0;
      let epKimDies = 0, beDies = 0;
      let epKimWages = 0, beWages = 0;

      cJobs.forEach(j => {
        const dies = j.dies || 1;
        totalDies += dies;
        wages += (j.wage || 0);
        if (j.jobType === 'be') {
          beJobs++;
          beDies += dies;
          beWages += (j.wage || 0);
        } else {
          epKimJobs++;
          epKimDies += dies;
          epKimWages += (j.wage || 0);
        }
      });
      
      csvContent += `"${c.name}",${cJobs.length},${epKimJobs},${beJobs},${totalDies},${epKimDies},${beDies},${wages},${epKimWages},${beWages}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-cong-tho-${reportPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addActivity('Đã tải báo cáo Excel công thợ (.csv)', 'primary');
  }

  // --- BACKUP & RESTORE UTILITIES ---
  function exportDataJSON() {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `saoluu-xưởng-epkim-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addActivity('Đã tải tệp tin sao lưu dữ liệu xưởng (.json)', 'primary');
  }

  function importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedState = JSON.parse(e.target.result);
        
        if (importedState.craftsmen && Array.isArray(importedState.craftsmen) &&
            importedState.jobs && Array.isArray(importedState.jobs)) {
          
          state = {
            theme: importedState.theme || 'dark',
            currentUser: null,
            accounts: importedState.accounts || sampleAccounts,
            craftsmen: importedState.craftsmen,
            jobs: importedState.jobs,
            activities: importedState.activities || []
          };

          saveState();
          alert('Khôi phục dữ liệu xưởng thành công! Vui lòng đăng nhập lại.');
          addActivity('Khôi phục toàn bộ dữ liệu từ tệp tin sao lưu.', 'success');
          
          applyTheme();
          populateCraftsmenDropdowns();
          applyUserPermissions();
          switchView('dashboard');
        } else {
          alert('Lỗi: Cấu trúc tệp tin sao lưu không hợp lệ.');
        }
      } catch (err) {
        alert('Lỗi: Không thể đọc tệp sao lưu. Đảm bảo đây là tệp tin .json hợp lệ.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // --- EXPOSE INTERFACES TO WINDOW OBJECT ---
  window.app = {
    // Auth & Permissions
    login,
    logout,

    // Dynamic Input Helpers
    generateDieInputs,
    addDieInput,
    removeDieInput,
    updateFormWages,
    parseQtyPerDie,
    calculateAllowancePerDie,

    // Nav & Filters
    filterJobs,
    filterBeJobs,
    changeReportPeriod,

    // Job Modals & CRUD
    openAddJobModal,
    openAddBeJobModal,
    openEditJobModal,
    closeJobModal,
    saveJob,
    quickCompleteJob,
    deleteJob,

    // Craftsman Modals & CRUD
    openAddCraftsmanModal,
    openEditCraftsmanModal,
    closeCraftsmanModal,
    saveCraftsman,
    deleteCraftsman,

    // Accounts Modals & CRUD
    openAddAccountModal,
    openEditAccountModal,
    closeAccountModal,
    saveAccount,
    deleteAccount,

    // Backup & Reports
    exportPayrollCSV,
    exportDataJSON,
    importDataJSON
  };

})();
