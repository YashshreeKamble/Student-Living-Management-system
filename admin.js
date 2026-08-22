const toast = document.querySelector('#toast');
const adminContent = document.querySelector('.admin-content');
const dashboardMarkup = adminContent.innerHTML;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function statusClass(status) {
  if (status === 'Overdue' || status === 'Maintenance') return 'red';
  if (status === 'Pending' || status === 'Full') return 'amber';
  return 'green';
}

async function loadAdminData() {
  const response = await fetch('/api/admin/dashboard');
  if (response.status === 403) {
    window.location.href = '/';
    return;
  }
  if (!response.ok) {
    showToast('Admin data could not be loaded');
    return;
  }
  const data = await response.json();
  document.querySelector('#student-count').textContent = data.students.length;
  document.querySelector('#room-table').innerHTML = `<div class="admin-row admin-head"><span>Room</span><span>Students</span><span>Beds</span><span>Availability</span></div>${data.rooms.map(room => `<div class="admin-row"><strong>${room.room}</strong><span>${room.students}</span><span>${room.beds}</span><em class="status-pill ${statusClass(room.vacancy)}">${room.vacancy}</em></div>`).join('')}`;
  document.querySelector('#student-table').innerHTML = `<div class="admin-row admin-head"><span>Student</span><span>Email</span><span>Room</span><span>Status</span></div>${data.students.map(student => `<div class="admin-row"><strong>${student.name}</strong><span>${student.email}</span><span>${student.room || 'Not assigned'}</span><em class="status-pill green">${student.status}</em></div>`).join('')}`;
  document.querySelector('#payment-table').innerHTML = `<div class="admin-row admin-head"><span>Student</span><span>Amount</span><span>Date</span><span>Status</span></div>${data.payments.map(payment => `<div class="admin-row"><strong>${payment.student}</strong><span>${payment.amount}</span><span>${payment.date}</span><em class="status-pill ${statusClass(payment.status)}">${payment.status}</em></div>`).join('')}`;
  document.querySelector('#notice-list').innerHTML = data.notices.map(notice => `<div class="notice-item"><i data-lucide="megaphone"></i><span><strong>${notice.title}</strong><small>${notice.audience} · ${notice.date}</small></span></div>`).join('');
  lucide.createIcons();
}

async function sendNotice() {
  const title = window.prompt('Notice title');
  if (!title) return;
  const message = window.prompt('Notice message for students');
  if (!message) return;
  const response = await fetch('/api/admin/notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message }) });
  if (response.ok) {
    showToast('Notice sent to students');
    loadAdminData();
  } else {
    showToast('Notice could not be sent');
  }
}

async function loadAdminUser() {
  const response = await fetch('/api/auth/me');
  const result = await response.json();
  if (!result.authenticated || result.user.role !== 'admin') {
    window.location.href = '/';
    return;
  }
  document.querySelector('#admin-name').textContent = result.user.name;
  document.querySelector('#admin-avatar').textContent = result.user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  bindDashboardActions(result.user);
  await loadAdminData();
}

function renderAccountSettings(user) {
  adminContent.innerHTML = `<button class="back-dashboard" id="back-dashboard"><i data-lucide="arrow-left"></i>Back to dashboard</button><div class="account-dashboard"><p class="eyebrow">Admin account</p><h2>Account settings</h2><p class="account-copy" id="account-copy">Update your admin name, email, or password.</p><form class="account-form" id="account-form"><label for="account-name">Name</label><input id="account-name" name="account-name" value="${user.name}" required><label for="account-email">Email</label><input id="account-email" name="account-email" type="email" value="${user.email}" required><label for="account-password">New password</label><input id="account-password" name="account-password" type="password" minlength="8" pattern="^$|(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$" title="Use at least 8 characters, one uppercase letter, and one special symbol." placeholder="Leave blank to keep current password"><small class="password-rule">Minimum 8 characters · 1 uppercase letter · 1 special symbol</small><button class="primary-button" type="submit">Save changes <i data-lucide="check"></i></button></form></div>`;
  lucide.createIcons();
  document.querySelector('#back-dashboard').addEventListener('click', () => { adminContent.innerHTML = dashboardMarkup; lucide.createIcons(); bindDashboardActions(user); loadAdminData(); });
  document.querySelector('#account-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const response = await fetch('/api/admin/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.elements['account-name'].value, email: form.elements['account-email'].value, password: form.elements['account-password'].value }) });
    const result = await response.json();
    if (!response.ok) { document.querySelector('#account-copy').textContent = result.error; return; }
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
}

function bindDashboardActions(user) {
  document.querySelector('#account-settings').addEventListener('click', () => renderAccountSettings(user));
  document.querySelector('#send-notice').addEventListener('click', sendNotice);
  document.querySelector('#refresh').addEventListener('click', loadAdminData);
}

document.querySelector('#logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
});
lucide.createIcons();
loadAdminUser();
