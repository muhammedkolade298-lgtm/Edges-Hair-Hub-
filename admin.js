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
mobileMenuBtn?.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 && sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
    sidebar.classList.remove('open');
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