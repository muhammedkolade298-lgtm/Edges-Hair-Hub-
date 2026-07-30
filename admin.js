// Sparkline bars
document.querySelectorAll('.spark').forEach(spark => {
  const values = spark.dataset.values.split(',').map(Number);
  const max = Math.max(...values);
  values.forEach((v, i) => {
    const bar = document.createElement('span');
    bar.style.height = `${(v / max) * 100}%`;
    bar.style.animationDelay = `${i * 0.03}s`;
    spark.appendChild(bar);
  });
});

// Sidebar collapse (desktop)
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', () => {
  const collapsed = sidebar.classList.toggle('collapsed');
  sidebar.style.width = collapsed ? '84px' : '264px';
  sidebar.querySelectorAll('.nav-item span:not(.nav-badge):not(.nav-dot), .brand-name')
    .forEach(el => el.style.display = collapsed ? 'none' : '');
});

// Sidebar toggle (mobile)
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const topbarSearch = document.getElementById('topbarSearch');
const messagesBtn = document.getElementById('messagesBtn');
const notificationsBtn = document.getElementById('notificationsBtn');
const userChip = document.getElementById('userChip');
const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logoutBtn');

mobileMenuBtn?.addEventListener('click', () => sidebar.classList.toggle('open'));

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    topbarSearch?.focus();
  }
});

messagesBtn?.addEventListener('click', () => {
  alert('Messages are not available yet.');
});

notificationsBtn?.addEventListener('click', () => {
  alert('Notifications are not available yet.');
});

userChip?.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = userMenu?.classList.toggle('open');
  userChip.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 && sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
    sidebar.classList.remove('open');
  }

  if (userMenu?.classList.contains('open') && userChip && !userChip.contains(e.target) && !userMenu.contains(e.target)) {
    userMenu.classList.remove('open');
    userChip.setAttribute('aria-expanded', 'false');
  }
});

// Chat widget
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
chatToggle.addEventListener('click', () => chatPanel.classList.toggle('open'));
chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

const chatInput = document.querySelector('.chat-panel-input input');
const chatSend = document.querySelector('.chat-send');
const chatBody = document.querySelector('.chat-panel-body');

function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg user';
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatInput.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'chat-msg bot';
    reply.textContent = 'Thanks for the message — a teammate will follow up shortly.';
    chatBody.appendChild(reply);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 600);
}

chatSend.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});

// --- Page navigation -----------------------------------------------------
// Sidebar links and the user-menu ("View profile" / "Settings") links all
// carry a data-page attribute matching a <section id="...Page" class="page-page">.
const pageLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page-page');

function showPage(pageId) {
  pages.forEach(page => {
    const isTarget = page.id === pageId;
    // Set display directly rather than relying solely on a .hidden class,
    // in case admin.css doesn't define `.hidden { display: none }`.
    page.style.display = isTarget ? '' : 'none';
    page.classList.toggle('hidden', !isTarget);
  });
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageId === 'inboxPage') renderInbox();
  if (pageId === 'profilePage') loadProfile();
  if (pageId === 'settingsPage') loadSettings();
}

// Ensure only the dashboard is visible on first load, regardless of
// whatever admin.css does or doesn't do with the "hidden" class.
showPage('dashboardPage');

pageLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    showPage(link.dataset.page);

    if (userMenu?.classList.contains('open')) {
      userMenu.classList.remove('open');
      userChip?.setAttribute('aria-expanded', 'false');
    }
    if (window.innerWidth <= 900) sidebar.classList.remove('open');
  });
});

// --- Inbox / appointment requests -----------------------------------------
// Reads the same localStorage key the public booking form (script.js) writes
// to, so an enquiry submitted on the site shows up here automatically.
const APPOINTMENTS_KEY = 'edgesHairHub_appointments';

function getAppointments() {
  try { return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]'); }
  catch { return []; }
}

function saveAppointments(list) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function formatRequestDate(ts) {
  const d = new Date(ts);
  const diffHrs = Math.round((Date.now() - d.getTime()) / 36e5);
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const inboxList = document.getElementById('inboxList');
const inboxCount = document.getElementById('inboxCount');

function renderInbox() {
  if (!inboxList) return;
  const appointments = getAppointments()
    .filter(a => !a.dismissed)
    .sort((a, b) => b.createdAt - a.createdAt);

  const unread = appointments.filter(a => !a.read).length;
  inboxCount.textContent = appointments.length
    ? `${appointments.length} request${appointments.length === 1 ? '' : 's'} · ${unread} unread`
    : 'No appointment requests yet.';

  inboxList.innerHTML = appointments.length ? appointments.map(a => `
    <div class="inbox-item${a.read ? '' : ' unread'}" data-id="${a.id}">
      <div class="inbox-item-main">
        <div class="inbox-item-top">
          <span class="inbox-item-name">${escapeHtml(a.name) || 'Unnamed request'}</span>
          <span class="inbox-item-time">${formatRequestDate(a.createdAt)}</span>
        </div>
        <p class="inbox-item-meta">${[a.service, a.wig, a.color, a.length, a.type].filter(Boolean).map(escapeHtml).join(' · ')}</p>
        <p class="inbox-item-contact">${escapeHtml(a.email)}</p>
        ${a.message ? `<p class="inbox-item-message">${escapeHtml(a.message)}</p>` : ''}
      </div>
      <div class="inbox-item-actions">
        <button type="button" class="link-btn inbox-read-btn" data-id="${a.id}">${a.read ? 'Mark unread' : 'Mark read'}</button>
        <button type="button" class="link-btn muted inbox-dismiss-btn" data-id="${a.id}">Dismiss</button>
      </div>
    </div>
  `).join('') : '<div class="inbox-empty">No appointment requests yet.</div>';

  updateInboxNavIndicator();
}

function updateInboxNavIndicator() {
  const unread = getAppointments().filter(a => !a.dismissed && !a.read).length;
  const dot = document.querySelector('.nav-item[data-page="inboxPage"] .nav-dot');
  if (dot) dot.style.display = unread ? '' : 'none';
}

inboxList?.addEventListener('click', event => {
  const readBtn = event.target.closest('.inbox-read-btn');
  const dismissBtn = event.target.closest('.inbox-dismiss-btn');
  if (!readBtn && !dismissBtn) return;

  const id = (readBtn || dismissBtn).dataset.id;
  const list = getAppointments();
  const item = list.find(a => a.id === id);
  if (!item) return;

  if (readBtn) item.read = !item.read;
  if (dismissBtn) item.dismissed = true;

  saveAppointments(list);
  renderInbox();
});

document.getElementById('inboxMarkAllRead')?.addEventListener('click', () => {
  const list = getAppointments();
  list.forEach(a => { a.read = true; });
  saveAppointments(list);
  renderInbox();
});

document.getElementById('inboxClearAll')?.addEventListener('click', () => {
  if (!confirm('Dismiss all appointment requests? This just clears them from the inbox.')) return;
  const list = getAppointments();
  list.forEach(a => { a.dismissed = true; });
  saveAppointments(list);
  renderInbox();
});

updateInboxNavIndicator();

// --- Profile ---------------------------------------------------------------
const PROFILE_KEY = 'edgesHairHub_profile';
const profileForm = document.getElementById('profileForm');
const profileStatus = document.getElementById('profileStatus');
const profileNameEl = document.getElementById('profileName');
const profileRoleEl = document.getElementById('profileRole');
const profileEmailEl = document.getElementById('profileEmail');

function defaultProfile() {
  return { name: 'Priya Sen', email: 'priya@edgeshairhub.com', role: 'Product Designer', phone: '', location: '' };
}

function getStoredProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY));
    return stored ? { ...defaultProfile(), ...stored } : defaultProfile();
  } catch { return defaultProfile(); }
}

function loadProfile() {
  if (!profileForm) return;
  const profile = getStoredProfile();
  profileForm.name.value = profile.name;
  profileForm.email.value = profile.email;
  profileForm.role.value = profile.role;
  profileForm.phone.value = profile.phone || '';
  profileForm.location.value = profile.location || '';
}

function applyProfileToUI(profile) {
  if (profileNameEl) profileNameEl.textContent = profile.name;
  if (profileRoleEl) profileRoleEl.textContent = profile.role;
  if (profileEmailEl) profileEmailEl.textContent = profile.email;

  const userNameEl = document.querySelector('.user-name');
  const userRoleEl = document.querySelector('.user-role');
  if (userNameEl) userNameEl.textContent = profile.name;
  if (userRoleEl) userRoleEl.textContent = profile.role;

  const avatarImg = document.querySelector('.user-chip img');
  if (avatarImg) avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=5B5FEF&color=fff&bold=true&size=64`;

  const profileAvatarImg = document.querySelector('.profile-card img');
  if (profileAvatarImg) profileAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=5B5FEF&color=fff&bold=true&size=128`;
}

profileForm?.addEventListener('submit', event => {
  event.preventDefault();
  const profile = {
    name: profileForm.name.value.trim() || defaultProfile().name,
    email: profileForm.email.value.trim(),
    role: profileForm.role.value,
    phone: profileForm.phone.value.trim(),
    location: profileForm.location.value.trim()
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  applyProfileToUI(profile);
  profileStatus.textContent = 'Profile saved.';
  setTimeout(() => { if (profileStatus) profileStatus.textContent = ''; }, 2500);
});

applyProfileToUI(getStoredProfile());

// --- Settings ----------------------------------------------------------------
const SETTINGS_KEY = 'edgesHairHub_settings';
const settingsForm = document.getElementById('settingsForm');
const settingsStatus = document.getElementById('settingsStatus');

function defaultSettings() {
  return { emailAlerts: true, smsAlerts: false, darkMode: false };
}

function getStoredSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return stored ? { ...defaultSettings(), ...stored } : defaultSettings();
  } catch { return defaultSettings(); }
}

function loadSettings() {
  if (!settingsForm) return;
  const settings = getStoredSettings();
  settingsForm.emailAlerts.checked = settings.emailAlerts;
  settingsForm.smsAlerts.checked = settings.smsAlerts;
  settingsForm.darkMode.checked = settings.darkMode;
}

function applyDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
}

settingsForm?.addEventListener('submit', event => {
  event.preventDefault();
  const settings = {
    emailAlerts: settingsForm.emailAlerts.checked,
    smsAlerts: settingsForm.smsAlerts.checked,
    darkMode: settingsForm.darkMode.checked
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyDarkMode(settings.darkMode);
  settingsStatus.textContent = 'Settings saved.';
  setTimeout(() => { if (settingsStatus) settingsStatus.textContent = ''; }, 2500);
});

applyDarkMode(getStoredSettings().darkMode);

// --- Logout --------------------------------------------------------------
function logout() {
  if (!confirm('Log out of the dashboard?')) return;
  localStorage.removeItem('edgesHairHub_session');
  window.location.href = 'index.html';
}

logoutBtn?.addEventListener('click', logout);
document.getElementById('sidebarLogoutBtn')?.addEventListener('click', event => {
  event.preventDefault();
  logout();
});