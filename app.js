// Work Log Tracker Application Logic with User Authentication, Month Management, 5 PM Email Reminders & User Profile Settings

// Storage Keys
const STORAGE_KEY_TASKS = 'work_tracker_tasks_v5';
const STORAGE_KEY_USERS = 'work_tracker_users_v5';
const STORAGE_KEY_PROJECTS = 'work_tracker_projects_v5';
const STORAGE_KEY_SESSION = 'work_tracker_session_v5';
const STORAGE_KEY_REMINDER_CFG = 'work_tracker_reminder_cfg_v5';

// Helper: Get Current Year-Month String (e.g. "2026-09")
function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Current Year-Month (Auto-calculated from system date)
const CURRENT_MONTH = getCurrentYearMonth();

// Default Team Members with PINs and Emails
const DEFAULT_USERS = [
  { name: 'Srijith', email: 'srijith@example.com', pin: '1234', role: 'admin', color: 'bg-emerald-600' },
  { name: 'Sri mathi', email: 'srimathi@example.com', pin: '1234', role: 'member', color: 'bg-indigo-600' },
  { name: 'Akila', email: 'akila@example.com', pin: '1234', role: 'member', color: 'bg-sky-500' },
  { name: 'Jayaraj', email: 'jayaraj@example.com', pin: '1234', role: 'member', color: 'bg-amber-600' }
];

// Default Projects
const DEFAULT_PROJECTS = [
  'DHIGROWTH & TITAN STAY/NEST PILOT',
  'DHIGROWTH',
  'TITAN STAY/NEST PILOT',
  'WHATSAPP AUTOMATION',
  'SEO OPTIMIZATION',
  'INTERNAL PORTAL'
];

// Default Initial Tasks (Auto-assigned to current month)
const DEFAULT_TASKS = [
  {
    id: 'task-init-1',
    user: 'Srijith',
    date: `${CURRENT_MONTH}-01`,
    tasks: 'WHATSAPP AUTOMATION & DHIGROWTH SEO CHANGES',
    startTime: '10:00',
    endTime: '18:30',
    workTimeFormatted: '10 AM TO 6:30 PM',
    hours: 8.5,
    projectName: 'DHIGROWTH & TITAN STAY/NEST PILOT'
  },
  {
    id: 'task-init-2',
    user: 'Sri mathi',
    date: `${CURRENT_MONTH}-01`,
    tasks: 'GOOGLE ADS CAMPAIGN SETUP & AUDIT',
    startTime: '10:00',
    endTime: '18:30',
    workTimeFormatted: '10 AM TO 6:30 PM',
    hours: 8.5,
    projectName: 'DHIGROWTH'
  },
  {
    id: 'task-init-3',
    user: 'Akila',
    date: `${CURRENT_MONTH}-01`,
    tasks: 'TITAN STAY/NEST PILOT CONTENT UPDATES & SEO',
    startTime: '10:00',
    endTime: '18:30',
    workTimeFormatted: '10 AM TO 6:30 PM',
    hours: 8.5,
    projectName: 'TITAN STAY/NEST PILOT'
  },
  {
    id: 'task-init-4',
    user: 'Jayaraj',
    date: `${CURRENT_MONTH}-01`,
    tasks: 'WEBSITE PERFORMANCE & AUTOMATION TESTING',
    startTime: '10:00',
    endTime: '18:30',
    workTimeFormatted: '10 AM TO 6:30 PM',
    hours: 8.5,
    projectName: 'DHIGROWTH & TITAN STAY/NEST PILOT'
  }
];

// App State
let users = [];
let projects = [];
let tasks = [];
let reminderConfig = {
  senderEmail: '',
  appPassword: '',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  enabled: true
};
let currentLoggedInUser = null; // { name, pin, role, email, color }
let selectedUser = 'ALL'; // 'ALL' or specific user name
let selectedMonth = CURRENT_MONTH; // Auto-defaults to current month (e.g. "2026-09")
let searchQuery = '';
let selectedProject = '';
let selectedUserThemeColor = 'bg-emerald-600';

// DOM Elements
const currentMonthYearBadge = document.getElementById('currentMonthYearBadge');
const userTabsContainer = document.getElementById('userTabsContainer');
const workTableBody = document.getElementById('workTableBody');
const emptyState = document.getElementById('emptyState');
const currentViewTitle = document.getElementById('currentViewTitle');
const filteredCountBadge = document.getElementById('filteredCountBadge');
const searchInput = document.getElementById('searchInput');
const projectFilterSelect = document.getElementById('projectFilterSelect');
const projectDatalist = document.getElementById('projectDatalist');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

// Month Navigator Elements
const monthPicker = document.getElementById('monthPicker');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const allMonthsBtn = document.getElementById('allMonthsBtn');

// Header Auth & Settings Elements
const openUserSettingsBtn = document.getElementById('openUserSettingsBtn');
const switchUserBtn = document.getElementById('switchUserBtn');
const headerUserName = document.getElementById('headerUserName');
const headerUserAvatar = document.getElementById('headerUserAvatar');

// Stats Elements
const statTotalEntries = document.getElementById('statTotalEntries');
const statTotalHours = document.getElementById('statTotalHours');
const statActiveProjects = document.getElementById('statActiveProjects');
const statTotalUsers = document.getElementById('statTotalUsers');

// Task Modal Elements
const taskModal = document.getElementById('taskModal');
const taskModalContainer = document.getElementById('taskModalContainer');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const taskIdInput = document.getElementById('taskId');
const taskUserSelect = document.getElementById('taskUserSelect');
const taskDateInput = document.getElementById('taskDate');
const taskProjectInput = document.getElementById('taskProject');
const quickAddProjectBtn = document.getElementById('quickAddProjectBtn');
const taskStartTimeInput = document.getElementById('taskStartTime');
const taskEndTimeInput = document.getElementById('taskEndTime');
const taskDescInput = document.getElementById('taskDesc');
const calcHoursBadge = document.getElementById('calcHoursBadge');
const openAddTaskModalBtn = document.getElementById('openAddTaskModalBtn');
const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
const cancelTaskModalBtn = document.getElementById('cancelTaskModalBtn');

// User Modal Elements
const userModal = document.getElementById('userModal');
const userModalContainer = document.getElementById('userModalContainer');
const addUserBtn = document.getElementById('addUserBtn');
const closeUserModalBtn = document.getElementById('closeUserModalBtn');
const addUserForm = document.getElementById('addUserForm');
const newUserNameInput = document.getElementById('newUserNameInput');
const newUserEmailInput = document.getElementById('newUserEmailInput');
const newUserPinInput = document.getElementById('newUserPinInput');
const userListContainer = document.getElementById('userListContainer');

// Project Modal Elements
const projectModal = document.getElementById('projectModal');
const projectModalContainer = document.getElementById('projectModalContainer');
const manageProjectsBtn = document.getElementById('manageProjectsBtn');
const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
const addProjectForm = document.getElementById('addProjectForm');
const newProjectNameInput = document.getElementById('newProjectNameInput');
const projectListContainer = document.getElementById('projectListContainer');

// Email Reminders Modal Elements
const remindersModal = document.getElementById('remindersModal');
const remindersModalContainer = document.getElementById('remindersModalContainer');
const openRemindersBtn = document.getElementById('openRemindersBtn');
const closeRemindersModalBtn = document.getElementById('closeRemindersModalBtn');
const memberEmailsList = document.getElementById('memberEmailsList');
const smtpSenderEmail = document.getElementById('smtpSenderEmail');
const smtpPassword = document.getElementById('smtpPassword');
const smtpHost = document.getElementById('smtpHost');
const testSendReminderBtn = document.getElementById('testSendReminderBtn');
const saveReminderSettingsBtn = document.getElementById('saveReminderSettingsBtn');
const reminderStatusAlert = document.getElementById('reminderStatusAlert');
const reminderStatusText = document.getElementById('reminderStatusText');

// User Settings Modal Elements
const userSettingsModal = document.getElementById('userSettingsModal');
const userSettingsModalContainer = document.getElementById('userSettingsModalContainer');
const closeUserSettingsModalBtn = document.getElementById('closeUserSettingsModalBtn');
const cancelUserSettingsBtn = document.getElementById('cancelUserSettingsBtn');
const userSettingsForm = document.getElementById('userSettingsForm');
const settingsAvatarBadge = document.getElementById('settingsAvatarBadge');
const settingsUserNameDisplay = document.getElementById('settingsUserNameDisplay');
const settingsRoleBadge = document.getElementById('settingsRoleBadge');
const settingsUserRoleLabel = document.getElementById('settingsUserRoleLabel');
const settingsUserEmailInput = document.getElementById('settingsUserEmailInput');
const settingsCurrentPin = document.getElementById('settingsCurrentPin');
const settingsNewPin = document.getElementById('settingsNewPin');
const settingsConfirmPin = document.getElementById('settingsConfirmPin');
const settingsFeedbackAlert = document.getElementById('settingsFeedbackAlert');
const settingsFeedbackText = document.getElementById('settingsFeedbackText');

// Login Overlay Elements
const loginOverlay = document.getElementById('loginOverlay');
const loginUserGrid = document.getElementById('loginUserGrid');
const loginForm = document.getElementById('loginForm');
const loginSelectedUserInput = document.getElementById('loginSelectedUser');
const loginPinInput = document.getElementById('loginPinInput');
const loginErrorMsg = document.getElementById('loginErrorMsg');
const loginErrorText = document.getElementById('loginErrorText');
const loginAddMemberBtn = document.getElementById('loginAddMemberBtn');

// Export Buttons
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportDocxBtn = document.getElementById('exportDocxBtn');

// Initialize App
function initApp() {
  loadData();
  setupEventListeners();
  checkAuthSession();
  setupClientSideReminderCheck();
}

// Load data from LocalStorage and backend config
function loadData() {
  const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
  const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
  const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
  const savedCfg = localStorage.getItem(STORAGE_KEY_REMINDER_CFG);

  if (savedUsers) {
    users = JSON.parse(savedUsers);
    users = users.map((u, i) => {
      if (typeof u === 'string') {
        const colors = ['bg-emerald-600', 'bg-indigo-600', 'bg-sky-500', 'bg-amber-600', 'bg-purple-600'];
        return { name: u, email: `${u.toLowerCase().replace(/\s+/g, '')}@example.com`, pin: '1234', role: i === 0 ? 'admin' : 'member', color: colors[i % colors.length] };
      }
      if (!u.email) {
        u.email = `${u.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
      }
      if (u.name.toLowerCase() === 'akila' && (u.color === 'bg-rose-600' || !u.color)) {
        u.color = 'bg-sky-500';
      }
      return u;
    });
  } else {
    users = [...DEFAULT_USERS];
  }

  projects = savedProjects ? JSON.parse(savedProjects) : [...DEFAULT_PROJECTS];
  tasks = savedTasks ? JSON.parse(savedTasks) : [...DEFAULT_TASKS];
  if (savedCfg) {
    reminderConfig = { ...reminderConfig, ...JSON.parse(savedCfg) };
  }

  // Fetch backend saved reminder config if available
  fetch('/api/get-config')
    .then(r => r.json())
    .then(data => {
      if (data && data.senderEmail) {
        reminderConfig = { ...reminderConfig, ...data };
        if (data.memberEmails) {
          users.forEach(u => {
            if (data.memberEmails[u.name]) {
              u.email = data.memberEmails[u.name];
            }
          });
        }
        saveData();
      }
    })
    .catch(() => {});

  // Sync projects with tasks
  tasks.forEach(t => {
    if (t.projectName && !projects.includes(t.projectName.trim())) {
      projects.push(t.projectName.trim());
    }
  });

  saveData();
}

// Save data to LocalStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEY_REMINDER_CFG, JSON.stringify(reminderConfig));
}

// Check Active Authentication Session
function checkAuthSession() {
  const savedSession = localStorage.getItem(STORAGE_KEY_SESSION);
  if (savedSession) {
    const user = users.find(u => u.name === savedSession);
    if (user) {
      setLoggedInUser(user);
      return;
    }
  }

  // Not authenticated -> Show Login Overlay
  showLoginScreen();
}

// Show Login Screen
function showLoginScreen() {
  loginOverlay.classList.remove('hidden');
  renderLoginUserGrid();
  loginPinInput.value = '';
  loginErrorMsg.classList.add('hidden');
  lucide.createIcons();
}

// Render Member Selection Cards in Login Overlay
function renderLoginUserGrid() {
  loginUserGrid.innerHTML = '';

  const currentlySelected = loginSelectedUserInput.value || (users[0] ? users[0].name : '');
  loginSelectedUserInput.value = currentlySelected;

  users.forEach(user => {
    const isSelected = user.name === currentlySelected;
    const card = document.createElement('div');
    card.className = `login-user-card p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
      isSelected 
        ? 'selected bg-emerald-50/80 border-emerald-500 shadow-sm' 
        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
    }`;
    
    card.innerHTML = `
      <div class="w-9 h-9 rounded-xl ${user.color || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
        ${user.name.charAt(0).toUpperCase()}
      </div>
      <div class="truncate text-left">
        <span class="text-xs font-bold text-slate-800 block truncate">${escapeHtml(user.name)}</span>
        <span class="text-[10px] text-slate-400 font-medium block truncate">${escapeHtml(user.email || 'No email')}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      loginSelectedUserInput.value = user.name;
      loginErrorMsg.classList.add('hidden');
      renderLoginUserGrid();
      loginPinInput.focus();
    });

    loginUserGrid.appendChild(card);
  });
}

// Log in user
function loginUser(userName, pin) {
  const user = users.find(u => u.name === userName);
  if (!user) {
    showLoginError('User not found. Please choose a valid member.');
    return;
  }

  const expectedPin = user.pin || '1234';
  if (pin !== expectedPin) {
    showLoginError(`Incorrect PIN entered for ${user.name}.`);
    loginPinInput.focus();
    return;
  }

  // Successfully Authenticated
  setLoggedInUser(user);
}

// Set Logged In User State
function setLoggedInUser(user) {
  currentLoggedInUser = user;
  selectedUserThemeColor = user.color || 'bg-emerald-600';
  localStorage.setItem(STORAGE_KEY_SESSION, user.name);

  // Hide login overlay
  loginOverlay.classList.add('hidden');

  // Update Header User Profile
  headerUserName.textContent = user.name;
  headerUserAvatar.textContent = user.name.charAt(0).toUpperCase();
  headerUserAvatar.className = `w-6 h-6 rounded-full ${user.color || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-[11px] shadow-xs`;

  // Default view to current user's work log
  selectedUser = user.name;

  renderAll();
  lucide.createIcons();
}

// Log out user / Switch Account
function logoutUser() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
  currentLoggedInUser = null;
  showLoginScreen();
}

// Show Login Error
function showLoginError(msg) {
  loginErrorText.textContent = msg;
  loginErrorMsg.classList.remove('hidden');
  loginPinInput.classList.add('border-rose-400');
  setTimeout(() => {
    loginPinInput.classList.remove('border-rose-400');
  }, 1000);
}

// Update Header Month Badge and Navigator
function updateMonthDisplay() {
  if (selectedMonth === 'ALL') {
    currentMonthYearBadge.textContent = 'All Months Overview';
    monthPicker.value = '';
    allMonthsBtn.classList.add('bg-slate-900', 'text-white');
    allMonthsBtn.classList.remove('bg-slate-200/60', 'text-slate-600');
  } else {
    const [year, month] = selectedMonth.split('-').map(Number);
    const dateObj = new Date(year, month - 1, 1);
    const formattedMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    currentMonthYearBadge.textContent = `${formattedMonth} Works`;
    monthPicker.value = selectedMonth;
    allMonthsBtn.classList.remove('bg-slate-900', 'text-white');
    allMonthsBtn.classList.add('bg-slate-200/60', 'text-slate-600');
  }
}

// Navigate Month Forward / Backward
function navigateMonth(offset) {
  if (selectedMonth === 'ALL') {
    selectedMonth = getCurrentYearMonth();
  }
  const [year, month] = selectedMonth.split('-').map(Number);
  const newDate = new Date(year, month - 1 + offset, 1);
  const newYear = newDate.getFullYear();
  const newMonth = String(newDate.getMonth() + 1).padStart(2, '0');
  selectedMonth = `${newYear}-${newMonth}`;
  renderAll();
}

// Format time from 24h to 12h AM/PM
function format12Hour(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hours12 = h % 12 || 12;
  const mins = m === 0 ? '' : `:${m < 10 ? '0' + m : m}`;
  return `${hours12}${mins} ${period}`;
}

// Calculate hours between start & end
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);

  let startMinutes = sH * 60 + sM;
  let endMinutes = eH * 60 + eM;

  if (endMinutes < startMinutes) {
    // Over midnight shift
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return Number((diffMinutes / 60).toFixed(2));
}

// Update calculated hours badge in modal
function updateCalcHours() {
  const s = taskStartTimeInput.value;
  const e = taskEndTimeInput.value;
  const hrs = calculateHours(s, e);
  const wholeHours = Math.floor(hrs);
  const remainingMins = Math.round((hrs - wholeHours) * 60);

  calcHoursBadge.textContent = `${wholeHours}h ${remainingMins > 0 ? remainingMins + 'm' : ''} (${hrs} hrs)`;
}

// Format date to MM/DD/YYYY or readable
function formatDateForDisplay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${Number(month)}/${Number(day)}/${year}`;
}

// Render everything
function renderAll() {
  updateMonthDisplay();
  renderUserTabs();
  renderUserSelectOptions();
  renderProjectOptions();
  renderTable();
  renderStats();
  renderUserList();
  renderProjectList();
  renderMemberEmailsList();
}

// Render User Filter Tabs
function renderUserTabs() {
  userTabsContainer.innerHTML = '';

  const currentMonthTasks = tasks.filter(t => selectedMonth === 'ALL' || (t.date && t.date.startsWith(selectedMonth)));

  // "All Members" tab
  const allBtn = document.createElement('button');
  allBtn.className = `user-tab-btn shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
    selectedUser === 'ALL' ? 'active' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  }`;
  allBtn.innerHTML = `<span>👥 All Members</span> <span class="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200/60 ${selectedUser === 'ALL' ? 'text-slate-900 bg-white' : ''}">${currentMonthTasks.length}</span>`;
  allBtn.addEventListener('click', () => {
    selectedUser = 'ALL';
    renderAll();
  });
  userTabsContainer.appendChild(allBtn);

  // Individual user tabs
  users.forEach(user => {
    const userTaskCount = currentMonthTasks.filter(t => t.user === user.name).length;
    const isCurrentUser = currentLoggedInUser && currentLoggedInUser.name === user.name;
    const btn = document.createElement('button');
    btn.className = `user-tab-btn shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
      selectedUser === user.name ? 'active' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`;
    btn.innerHTML = `
      <span class="w-2 h-2 rounded-full ${user.color || 'bg-emerald-500'} inline-block"></span>
      <span>${escapeHtml(user.name)} ${isCurrentUser ? '<strong class="text-[10px] text-emerald-400 ml-0.5">(You)</strong>' : ''}</span>
      <span class="px-1.5 py-0.2 text-[10px] rounded-full ${selectedUser === user.name ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}">${userTaskCount}</span>
    `;
    btn.addEventListener('click', () => {
      selectedUser = user.name;
      renderAll();
    });
    userTabsContainer.appendChild(btn);
  });
}

// Render User options in Task Modal select
function renderUserSelectOptions() {
  taskUserSelect.innerHTML = '';
  users.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user.name;
    opt.textContent = `${user.name} ${currentLoggedInUser && currentLoggedInUser.name === user.name ? '(You)' : ''}`;
    if (currentLoggedInUser && currentLoggedInUser.name === user.name) {
      opt.selected = true;
    }
    taskUserSelect.appendChild(opt);
  });
}

// Render Projects in filter dropdown & task datalist
function renderProjectOptions() {
  const currentVal = projectFilterSelect.value;
  
  // Filter Dropdown
  projectFilterSelect.innerHTML = '<option value="">All Projects</option>';
  projects.forEach(proj => {
    const opt = document.createElement('option');
    opt.value = proj;
    opt.textContent = proj;
    if (proj === currentVal) opt.selected = true;
    projectFilterSelect.appendChild(opt);
  });

  // Task Datalist
  if (projectDatalist) {
    projectDatalist.innerHTML = '';
    projects.forEach(proj => {
      const opt = document.createElement('option');
      opt.value = proj;
      projectDatalist.appendChild(opt);
    });
  }
}

// Get filtered tasks
function getFilteredTasks() {
  return tasks.filter(task => {
    const matchesMonth = selectedMonth === 'ALL' || (task.date && task.date.startsWith(selectedMonth));
    const matchesUser = selectedUser === 'ALL' || task.user === selectedUser;
    const matchesSearch = !searchQuery || 
      task.tasks.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.user && task.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.date && task.date.includes(searchQuery));
    const matchesProject = !selectedProject || task.projectName === selectedProject;

    return matchesMonth && matchesUser && matchesSearch && matchesProject;
  });
}

// Render Table Rows with Strict Ownership Protection
function renderTable() {
  const filtered = getFilteredTasks();

  filteredCountBadge.textContent = filtered.length;
  currentViewTitle.textContent = selectedUser === 'ALL' ? 'All Team Tasks' : `${selectedUser}'s Work Log`;

  // Toggle Clear Filters button
  if (searchQuery || selectedProject || selectedMonth === 'ALL') {
    clearFiltersBtn.classList.remove('hidden');
  } else {
    clearFiltersBtn.classList.add('hidden');
  }

  if (filtered.length === 0) {
    workTableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  workTableBody.innerHTML = '';

  filtered.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors group';

    const workTiming = task.workTimeFormatted || `${format12Hour(task.startTime)} TO ${format12Hour(task.endTime)}`;
    const hrsDisplay = task.hours ? `${task.hours} hrs` : `${calculateHours(task.startTime, task.endTime)} hrs`;
    const userObj = users.find(u => u.name === task.user);
    const isOwner = currentLoggedInUser && task.user === currentLoggedInUser.name;

    tr.innerHTML = `
      <td class="py-3 px-4 text-center font-bold text-slate-500 border-r border-slate-100">${index + 1}</td>
      <td class="py-3 px-4 text-slate-800 font-semibold border-r border-slate-100 whitespace-nowrap">${formatDateForDisplay(task.date)}</td>
      <td class="py-3 px-4 border-r border-slate-100">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold">
          <span class="w-2 h-2 rounded-full ${userObj ? userObj.color : 'bg-emerald-500'}"></span>
          ${escapeHtml(task.user)}
        </span>
      </td>
      <td class="py-3 px-6 text-slate-900 font-semibold border-r border-slate-100 uppercase tracking-tight leading-relaxed">
        ${escapeHtml(task.tasks)}
      </td>
      <td class="py-3 px-4 text-slate-700 font-medium border-r border-slate-100 whitespace-nowrap text-[11px]">
        <span class="px-2 py-1 bg-slate-100/70 rounded border border-slate-200/60 font-semibold">${escapeHtml(workTiming)}</span>
      </td>
      <td class="py-3 px-3 text-center border-r border-slate-100 whitespace-nowrap">
        <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
          ${hrsDisplay}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-700 font-bold border-r border-slate-100 uppercase text-[11px]">
        ${escapeHtml(task.projectName)}
      </td>
      <td class="py-3 px-4 text-right pr-6 whitespace-nowrap">
        <div class="flex items-center justify-end gap-1">
          ${(() => {
            if (isOwner) {
              return `
                <button 
                  onclick="editTask('${task.id}')" 
                  class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer" 
                  title="Edit Your Log"
                >
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
                <button 
                  onclick="deleteTask('${task.id}')" 
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" 
                  title="Delete Your Log"
                >
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              `;
            } else {
              return `
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60" title="Locked: Only ${escapeHtml(task.user)} can modify this record">
                  <i data-lucide="lock" class="w-2.5 h-2.5 text-slate-400"></i>
                  <span>Locked</span>
                </span>
              `;
            }
          })()}
        </div>
      </td>
    `;
    workTableBody.appendChild(tr);
  });

  lucide.createIcons();
}

// Render Stats Cards
function renderStats() {
  const currentMonthTasks = tasks.filter(t => selectedMonth === 'ALL' || (t.date && t.date.startsWith(selectedMonth)));
  const currentTasks = selectedUser === 'ALL' ? currentMonthTasks : currentMonthTasks.filter(t => t.user === selectedUser);
  
  statTotalEntries.textContent = currentTasks.length;

  const totalHours = currentTasks.reduce((acc, t) => {
    const h = t.hours !== undefined ? Number(t.hours) : calculateHours(t.startTime, t.endTime);
    return acc + (isNaN(h) ? 0 : h);
  }, 0);

  const wholeHours = Math.floor(totalHours);
  const remainingMins = Math.round((totalHours - wholeHours) * 60);
  statTotalHours.textContent = `${wholeHours}h ${remainingMins > 0 ? remainingMins + 'm' : ''}`;

  const activeProjectsCount = new Set(currentTasks.map(t => t.projectName).filter(Boolean)).size;
  statActiveProjects.textContent = activeProjectsCount;

  statTotalUsers.textContent = users.length;
}

// Render User List in Management Modal
function renderUserList() {
  userListContainer.innerHTML = '';
  users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors';
    item.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg ${user.color || 'bg-slate-200'} text-white flex items-center justify-center font-bold text-[11px]">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <span class="font-bold text-slate-800 block">${escapeHtml(user.name)}</span>
          <span class="text-[10px] text-slate-400 block">${escapeHtml(user.email || 'No email')}</span>
        </div>
      </div>
      <button 
        onclick="deleteUser('${escapeHtml(user.name)}')" 
        class="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
        title="Remove Member"
      >
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    `;
    userListContainer.appendChild(item);
  });
  lucide.createIcons();
}

// Render Project List in Management Modal
function renderProjectList() {
  if (!projectListContainer) return;
  projectListContainer.innerHTML = '';

  if (projects.length === 0) {
    projectListContainer.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">No projects added yet.</div>';
    return;
  }

  projects.forEach(proj => {
    const usageCount = tasks.filter(t => t.projectName === proj).length;
    const item = document.createElement('div');
    item.className = 'px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors';
    item.innerHTML = `
      <div class="flex items-center gap-2 overflow-hidden">
        <div class="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">
          <i data-lucide="folder" class="w-3 h-3"></i>
        </div>
        <div class="truncate">
          <span class="font-bold text-slate-800 uppercase block truncate">${escapeHtml(proj)}</span>
          <span class="text-[10px] text-slate-400">${usageCount} ${usageCount === 1 ? 'task' : 'tasks'} logged</span>
        </div>
      </div>
      <button 
        onclick="deleteProject('${escapeHtml(proj)}')" 
        class="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-2"
        title="Remove Project"
      >
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    `;
    projectListContainer.appendChild(item);
  });
  lucide.createIcons();
}

// Render Member Email Addresses in Email Reminders Modal
function renderMemberEmailsList() {
  if (!memberEmailsList) return;
  memberEmailsList.innerHTML = '';

  users.forEach((user, index) => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2.5';
    row.innerHTML = `
      <div class="w-6 h-6 rounded-lg ${user.color || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-[10px] shrink-0">
        ${user.name.charAt(0).toUpperCase()}
      </div>
      <span class="text-xs font-bold text-slate-800 w-24 shrink-0 truncate">${escapeHtml(user.name)}</span>
      <input 
        type="email" 
        data-user-index="${index}" 
        value="${escapeHtml(user.email || '')}" 
        placeholder="${user.name.toLowerCase().replace(/\s+/g, '')}@example.com" 
        class="member-email-input flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
      >
    `;
    memberEmailsList.appendChild(row);
  });
}

// Open Task Modal (Add or Edit)
function openTaskModal(taskId = null) {
  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!currentLoggedInUser || task.user !== currentLoggedInUser.name) {
      alert(`🔒 Access Denied: You cannot edit ${task.user}'s log. Each member can only edit their own logs.`);
      return;
    }
  }

  taskForm.reset();
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  taskDateInput.value = today;
  taskStartTimeInput.value = '10:00';
  taskEndTimeInput.value = '18:30';

  // Strictly lock user to current logged in user
  if (currentLoggedInUser) {
    taskUserSelect.value = currentLoggedInUser.name;
    taskUserSelect.disabled = true;
    taskUserSelect.classList.add('bg-slate-100', 'text-slate-500', 'cursor-not-allowed');
  }

  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      modalTitle.textContent = 'Edit Work Record';
      taskIdInput.value = task.id;
      taskUserSelect.value = task.user;
      taskDateInput.value = task.date;
      taskProjectInput.value = task.projectName;
      taskDescInput.value = task.tasks;
      taskStartTimeInput.value = task.startTime || '10:00';
      taskEndTimeInput.value = task.endTime || '18:30';
    }
  } else {
    modalTitle.textContent = 'Log Daily Work';
    taskIdInput.value = '';
  }

  updateCalcHours();

  taskModal.classList.remove('hidden');
  setTimeout(() => {
    taskModal.classList.remove('opacity-0');
    taskModalContainer.classList.remove('scale-95');
  }, 10);
}

// Close Task Modal
function closeTaskModal() {
  taskModal.classList.add('opacity-0');
  taskModalContainer.classList.add('scale-95');
  setTimeout(() => {
    taskModal.classList.add('hidden');
  }, 200);
}

// Open User Modal
function openUserModal() {
  userModal.classList.remove('hidden');
  setTimeout(() => {
    userModal.classList.remove('opacity-0');
    userModalContainer.classList.remove('scale-95');
  }, 10);
  renderUserList();
}

// Close User Modal
function closeUserModal() {
  userModal.classList.add('opacity-0');
  userModalContainer.classList.add('scale-95');
  setTimeout(() => {
    userModal.classList.add('hidden');
  }, 200);
}

// Open Project Modal
function openProjectModal() {
  projectModal.classList.remove('hidden');
  setTimeout(() => {
    projectModal.classList.remove('opacity-0');
    projectModalContainer.classList.remove('scale-95');
  }, 10);
  renderProjectList();
}

// Close Project Modal
function closeProjectModal() {
  projectModal.classList.add('opacity-0');
  projectModalContainer.classList.add('scale-95');
  setTimeout(() => {
    projectModal.classList.add('hidden');
  }, 200);
}

// Open Reminders Modal
function openRemindersModal() {
  renderMemberEmailsList();
  if (smtpSenderEmail) smtpSenderEmail.value = reminderConfig.senderEmail || '';
  if (smtpPassword) smtpPassword.value = reminderConfig.appPassword || '';
  if (smtpHost) smtpHost.value = reminderConfig.smtpHost || 'smtp.gmail.com';
  if (reminderStatusAlert) reminderStatusAlert.classList.add('hidden');

  remindersModal.classList.remove('hidden');
  setTimeout(() => {
    remindersModal.classList.remove('opacity-0');
    remindersModalContainer.classList.remove('scale-95');
  }, 10);
}

// Close Reminders Modal
function closeRemindersModal() {
  remindersModal.classList.add('opacity-0');
  remindersModalContainer.classList.add('scale-95');
  setTimeout(() => {
    remindersModal.classList.add('hidden');
  }, 200);
}

// Open User Settings Modal (Change PIN / Email / Theme)
function openUserSettingsModal() {
  if (!currentLoggedInUser) return;

  settingsUserNameDisplay.textContent = currentLoggedInUser.name;
  settingsAvatarBadge.textContent = currentLoggedInUser.name.charAt(0).toUpperCase();
  settingsAvatarBadge.className = `w-10 h-10 rounded-xl ${currentLoggedInUser.color || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-sm shadow-xs`;
  settingsRoleBadge.textContent = currentLoggedInUser.role === 'admin' ? 'Admin Profile' : 'Member Profile';
  settingsUserRoleLabel.textContent = `${currentLoggedInUser.name}'s account security and PIN`;
  settingsUserEmailInput.value = currentLoggedInUser.email || '';

  settingsCurrentPin.value = '';
  settingsNewPin.value = '';
  settingsConfirmPin.value = '';
  settingsFeedbackAlert.classList.add('hidden');

  selectedUserThemeColor = currentLoggedInUser.color || 'bg-emerald-600';
  highlightActiveThemeColor();

  userSettingsModal.classList.remove('hidden');
  setTimeout(() => {
    userSettingsModal.classList.remove('opacity-0');
    userSettingsModalContainer.classList.remove('scale-95');
  }, 10);
}

// Close User Settings Modal
function closeUserSettingsModal() {
  userSettingsModal.classList.add('opacity-0');
  userSettingsModalContainer.classList.add('scale-95');
  setTimeout(() => {
    userSettingsModal.classList.add('hidden');
  }, 200);
}

// Highlight Active Theme Color button in palette
function highlightActiveThemeColor() {
  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    if (btn.dataset.color === selectedUserThemeColor) {
      btn.classList.add('ring-3', 'ring-slate-900', 'scale-110');
    } else {
      btn.classList.remove('ring-3', 'ring-slate-900', 'scale-110');
    }
  });
}

// Save Reminder Settings
function saveReminderSettings() {
  document.querySelectorAll('.member-email-input').forEach(input => {
    const idx = Number(input.dataset.userIndex);
    if (users[idx]) {
      users[idx].email = input.value.trim();
    }
  });

  reminderConfig.senderEmail = smtpSenderEmail ? smtpSenderEmail.value.trim() : '';
  reminderConfig.appPassword = smtpPassword ? smtpPassword.value.trim() : '';
  reminderConfig.smtpHost = smtpHost ? smtpHost.value.trim() : 'smtp.gmail.com';

  const memberEmailMap = {};
  users.forEach(u => {
    if (u.email) memberEmailMap[u.name] = u.email;
  });

  const payload = {
    ...reminderConfig,
    memberEmails: memberEmailMap
  };

  fetch('/api/save-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});

  saveData();
  renderAll();

  showReminderStatus('Settings and email schedules saved successfully!', true);
  setTimeout(closeRemindersModal, 1200);
}

// Send Test Reminder Email Now
function sendTestReminderEmail() {
  document.querySelectorAll('.member-email-input').forEach(input => {
    const idx = Number(input.dataset.userIndex);
    if (users[idx]) {
      users[idx].email = input.value.trim();
    }
  });

  const recipients = users.map(u => ({ name: u.name, email: u.email })).filter(r => r.email);
  const cfg = {
    senderEmail: smtpSenderEmail ? smtpSenderEmail.value.trim() : '',
    appPassword: smtpPassword ? smtpPassword.value.trim() : '',
    smtpHost: smtpHost ? smtpHost.value.trim() : 'smtp.gmail.com'
  };

  if (!cfg.senderEmail || !cfg.appPassword) {
    showReminderStatus('Please enter Sender Email & App Password to test live email sending.', false);
    return;
  }

  showReminderStatus('Connecting to SMTP server and dispatching test reminder...', true);

  fetch('/api/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipients,
      config: cfg,
      isTest: true
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showReminderStatus(`✅ ${data.message}`, true);
    } else {
      showReminderStatus(`❌ Error: ${data.error}`, false);
    }
  })
  .catch(err => {
    showReminderStatus(`❌ Dispatch error: ${err.message}`, false);
  });
}

// Show Reminder Status Banner
function showReminderStatus(msg, isSuccess) {
  if (!reminderStatusAlert) return;
  reminderStatusText.textContent = msg;
  reminderStatusAlert.className = `p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
    isSuccess 
      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
      : 'bg-rose-50 border border-rose-200 text-rose-800'
  }`;
  reminderStatusAlert.classList.remove('hidden');
}

// Show User Settings Feedback Banner
function showSettingsFeedback(msg, isSuccess) {
  if (!settingsFeedbackAlert) return;
  settingsFeedbackText.textContent = msg;
  settingsFeedbackAlert.className = `p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
    isSuccess 
      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
      : 'bg-rose-50 border border-rose-200 text-rose-800'
  }`;
  settingsFeedbackAlert.classList.remove('hidden');
}

// Client-side 5 PM In-Browser Notification Check (Monday-Saturday)
function setupClientSideReminderCheck() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  setInterval(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
    const hours = now.getHours();
    const mins = now.getMinutes();

    // Mon (1) to Sat (6) at 17:00 (5 PM)
    if (day >= 1 && day <= 6 && hours === 17 && mins === 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Work Log Reminder (5:00 PM)', {
          body: 'Hi, please remember to log your tasks and work hours for today in Work Log Tracker.',
          icon: '/favicon.ico'
        });
      }
    }
  }, 30000);
}

// Save or Update Task (Owner Only)
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = taskIdInput.value;
  const user = currentLoggedInUser ? currentLoggedInUser.name : taskUserSelect.value;
  const date = taskDateInput.value;
  const projectName = taskProjectInput.value.trim().toUpperCase();
  const taskDesc = taskDescInput.value.trim().toUpperCase();
  const startTime = taskStartTimeInput.value;
  const endTime = taskEndTimeInput.value;
  const hours = calculateHours(startTime, endTime);
  const workTimeFormatted = `${format12Hour(startTime)} TO ${format12Hour(endTime)}`;

  // Automatically add new project to project list if not existing
  if (projectName && !projects.includes(projectName)) {
    projects.push(projectName);
  }

  // Auto-switch view to the task's month if different
  if (date) {
    const taskYearMonth = date.substring(0, 7);
    if (selectedMonth !== 'ALL' && selectedMonth !== taskYearMonth) {
      selectedMonth = taskYearMonth;
    }
  }

  if (id) {
    // Validate permission to edit
    const existing = tasks.find(t => t.id === id);
    if (!existing || !currentLoggedInUser || existing.user !== currentLoggedInUser.name) {
      alert("🔒 Access Denied: You cannot modify another member's work record.");
      return;
    }

    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        user: existing.user,
        date,
        projectName,
        tasks: taskDesc,
        startTime,
        endTime,
        workTimeFormatted,
        hours
      };
    }
  } else {
    // Add new task
    const newTask = {
      id: 'task-' + Date.now(),
      user,
      date,
      projectName,
      tasks: taskDesc,
      startTime,
      endTime,
      workTimeFormatted,
      hours
    };
    tasks.unshift(newTask);
  }

  saveData();
  closeTaskModal();
  renderAll();
});

// Delete Task (Strictly author only)
window.deleteTask = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (!currentLoggedInUser || task.user !== currentLoggedInUser.name) {
    alert(`🔒 Access Denied: You cannot delete ${task.user}'s work record. Only ${task.user} can delete their own logs.`);
    return;
  }

  if (confirm('Are you sure you want to delete your work record?')) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveData();
    renderAll();
  }
};

// Edit Task (Strictly author only)
window.editTask = function(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (!currentLoggedInUser || task.user !== currentLoggedInUser.name) {
    alert(`🔒 Access Denied: You cannot edit ${task.user}'s work record. Only ${task.user} can edit their own logs.`);
    return;
  }

  openTaskModal(taskId);
};

// Handle User Settings Submission (Change PIN / Email / Theme)
userSettingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentLoggedInUser) return;

  const email = settingsUserEmailInput.value.trim();
  const currentPinInput = settingsCurrentPin.value.trim();
  const newPinInput = settingsNewPin.value.trim();
  const confirmPinInput = settingsConfirmPin.value.trim();

  // If user wants to change PIN
  if (newPinInput || currentPinInput || confirmPinInput) {
    const actualCurrentPin = currentLoggedInUser.pin || '1234';
    if (currentPinInput !== actualCurrentPin) {
      showSettingsFeedback('❌ Incorrect Current PIN entered.', false);
      settingsCurrentPin.focus();
      return;
    }

    if (newPinInput.length < 4) {
      showSettingsFeedback('❌ New PIN must be at least 4 digits.', false);
      settingsNewPin.focus();
      return;
    }

    if (newPinInput !== confirmPinInput) {
      showSettingsFeedback('❌ New PIN and Confirm PIN do not match.', false);
      settingsConfirmPin.focus();
      return;
    }

    // Update PIN
    currentLoggedInUser.pin = newPinInput;
  }

  // Update Email & Theme Color
  currentLoggedInUser.email = email;
  currentLoggedInUser.color = selectedUserThemeColor;

  // Sync with global users array
  const uIdx = users.findIndex(u => u.name === currentLoggedInUser.name);
  if (uIdx !== -1) {
    users[uIdx] = { ...currentLoggedInUser };
  }

  // Sync with backend reminder config
  const memberEmailMap = {};
  users.forEach(u => {
    if (u.email) memberEmailMap[u.name] = u.email;
  });
  fetch('/api/save-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...reminderConfig, memberEmails: memberEmailMap })
  }).catch(() => {});

  saveData();

  // Update Header UI
  headerUserName.textContent = currentLoggedInUser.name;
  headerUserAvatar.textContent = currentLoggedInUser.name.charAt(0).toUpperCase();
  headerUserAvatar.className = `w-6 h-6 rounded-full ${currentLoggedInUser.color} text-white flex items-center justify-center font-bold text-[11px] shadow-xs`;

  renderAll();

  showSettingsFeedback('✅ Profile and PIN updated successfully!', true);
  setTimeout(() => {
    closeUserSettingsModal();
  }, 1000);
});

// Add User Form Submission
addUserForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = newUserNameInput.value.trim();
  const email = newUserEmailInput ? newUserEmailInput.value.trim() : `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
  const pin = newUserPinInput.value.trim() || '1234';
  
  if (name && !users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    const colors = ['bg-emerald-600', 'bg-indigo-600', 'bg-rose-600', 'bg-amber-600', 'bg-purple-600', 'bg-teal-600'];
    const newUser = {
      name,
      email,
      pin,
      role: 'member',
      color: colors[users.length % colors.length]
    };
    users.push(newUser);
    saveData();
    newUserNameInput.value = '';
    if (newUserEmailInput) newUserEmailInput.value = '';
    newUserPinInput.value = '';
    renderAll();
    renderLoginUserGrid();
  }
});

// Delete User
window.deleteUser = function(userName) {
  if (confirm(`Remove member "${userName}"? Existing tasks for this user will remain.`)) {
    users = users.filter(u => u.name !== userName);
    if (currentLoggedInUser && currentLoggedInUser.name === userName) {
      logoutUser();
      return;
    }
    if (selectedUser === userName) {
      selectedUser = 'ALL';
    }
    saveData();
    renderAll();
    renderLoginUserGrid();
  }
};

// Add Project
addProjectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = newProjectNameInput.value.trim().toUpperCase();
  if (name && !projects.includes(name)) {
    projects.push(name);
    saveData();
    newProjectNameInput.value = '';
    renderAll();
  }
});

// Delete Project
window.deleteProject = function(projectName) {
  if (confirm(`Remove project "${projectName}"? Existing tasks under this project will remain.`)) {
    projects = projects.filter(p => p !== projectName);
    if (selectedProject === projectName) {
      selectedProject = '';
    }
    saveData();
    renderAll();
  }
};

// Export to CSV
function exportToCsv() {
  const filtered = getFilteredTasks();
  if (filtered.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = ['SNO', 'DATE', 'USER', 'TASKS', 'WORK TIME', 'HOURS', 'PROJECT NAME'];
  const rows = filtered.map((t, idx) => [
    idx + 1,
    formatDateForDisplay(t.date),
    `"${(t.user || '').replace(/"/g, '""')}"`,
    `"${(t.tasks || '').replace(/"/g, '""')}"`,
    `"${t.workTimeFormatted || `${format12Hour(t.startTime)} TO ${format12Hour(t.endTime)}`}"`,
    t.hours || calculateHours(t.startTime, t.endTime),
    `"${(t.projectName || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  const monthLabel = selectedMonth === 'ALL' ? 'all_months' : selectedMonth;
  const userLabel = selectedUser === 'ALL' ? 'all_members' : selectedUser.replace(/\s+/g, '_');
  const fileName = `work_log_${userLabel}_${monthLabel}.csv`;

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to DOCX Report (DHIGROWTH Performance & Work Log Report)
function exportToDocx() {
  const filtered = getFilteredTasks();
  if (filtered.length === 0) {
    alert('No data available to export for the selected filters.');
    return;
  }

  const exportBtn = document.getElementById('exportDocxBtn');
  const originalText = exportBtn.innerHTML;
  exportBtn.disabled = true;
  exportBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-blue-600"></i><span>Generating DOCX...</span>`;
  lucide.createIcons();

  fetch('/api/export-docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: selectedUser,
      month: selectedMonth,
      tasks: filtered
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to generate DOCX document.');
    return res.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanUser = selectedUser === 'ALL' ? 'All_Members' : selectedUser.replace(/\s+/g, '_');
    const cleanMonth = selectedMonth === 'ALL' ? 'All_Months' : selectedMonth;
    a.download = `DHIGROWTH_${cleanUser}_${cleanMonth}_Performance_Report.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  })
  .catch(err => {
    alert('Error generating DOCX report: ' + err.message);
  })
  .finally(() => {
    exportBtn.disabled = false;
    exportBtn.innerHTML = originalText;
    lucide.createIcons();
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Login Form Submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = loginSelectedUserInput.value;
    const pin = loginPinInput.value.trim();
    loginUser(user, pin);
  });

  // User Settings Modal Triggers
  if (openUserSettingsBtn) {
    openUserSettingsBtn.addEventListener('click', openUserSettingsModal);
  }
  if (closeUserSettingsModalBtn) {
    closeUserSettingsModalBtn.addEventListener('click', closeUserSettingsModal);
  }
  if (cancelUserSettingsBtn) {
    cancelUserSettingsBtn.addEventListener('click', closeUserSettingsModal);
  }

  // Theme color palette selection
  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedUserThemeColor = e.target.dataset.color;
      highlightActiveThemeColor();
      if (settingsAvatarBadge) {
        settingsAvatarBadge.className = `w-10 h-10 rounded-xl ${selectedUserThemeColor} text-white flex items-center justify-center font-bold text-sm shadow-xs`;
      }
    });
  });

  // Switch User / Logout Button
  if (switchUserBtn) {
    switchUserBtn.addEventListener('click', logoutUser);
  }

  // Quick Add Member in Login Screen
  if (loginAddMemberBtn) {
    loginAddMemberBtn.addEventListener('click', openUserModal);
  }

  // Month Navigator Events
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => navigateMonth(1));
  }
  if (monthPicker) {
    monthPicker.addEventListener('change', (e) => {
      if (e.target.value) {
        selectedMonth = e.target.value;
        renderAll();
      }
    });
  }
  if (allMonthsBtn) {
    allMonthsBtn.addEventListener('click', () => {
      selectedMonth = selectedMonth === 'ALL' ? getCurrentYearMonth() : 'ALL';
      renderAll();
    });
  }

  // Reminders Modal
  if (openRemindersBtn) {
    openRemindersBtn.addEventListener('click', openRemindersModal);
  }
  if (closeRemindersModalBtn) {
    closeRemindersModalBtn.addEventListener('click', closeRemindersModal);
  }
  if (saveReminderSettingsBtn) {
    saveReminderSettingsBtn.addEventListener('click', saveReminderSettings);
  }
  if (testSendReminderBtn) {
    testSendReminderBtn.addEventListener('click', sendTestReminderEmail);
  }

  // Task Modals
  openAddTaskModalBtn.addEventListener('click', () => openTaskModal());
  closeTaskModalBtn.addEventListener('click', closeTaskModal);
  cancelTaskModalBtn.addEventListener('click', closeTaskModal);

  // User Modals
  addUserBtn.addEventListener('click', openUserModal);
  closeUserModalBtn.addEventListener('click', closeUserModal);

  // Project Modals
  manageProjectsBtn.addEventListener('click', openProjectModal);
  closeProjectModalBtn.addEventListener('click', closeProjectModal);
  if (quickAddProjectBtn) {
    quickAddProjectBtn.addEventListener('click', () => {
      closeTaskModal();
      openProjectModal();
    });
  }

  // Export Buttons
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportToCsv);
  }
  if (exportDocxBtn) {
    exportDocxBtn.addEventListener('click', exportToDocx);
  }

  // Time preset buttons
  document.querySelectorAll('.time-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const start = e.target.dataset.start;
      const end = e.target.dataset.end;
      taskStartTimeInput.value = start;
      taskEndTimeInput.value = end;
      updateCalcHours();
    });
  });

  taskStartTimeInput.addEventListener('input', updateCalcHours);
  taskEndTimeInput.addEventListener('input', updateCalcHours);

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Project filter
  projectFilterSelect.addEventListener('change', (e) => {
    selectedProject = e.target.value;
    renderTable();
  });

  // Clear filters
  clearFiltersBtn.addEventListener('click', () => {
    searchQuery = '';
    selectedProject = '';
    searchInput.value = '';
    projectFilterSelect.value = '';
    selectedMonth = getCurrentYearMonth();
    renderAll();
  });

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === taskModal) closeTaskModal();
    if (e.target === userModal) closeUserModal();
    if (e.target === projectModal) closeProjectModal();
    if (e.target === remindersModal) closeRemindersModal();
    if (e.target === userSettingsModal) closeUserSettingsModal();
  });
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Run App on Load
document.addEventListener('DOMContentLoaded', initApp);
