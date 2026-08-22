const navItems = document.querySelectorAll('.nav-item[data-view]');
const pageTitle = document.querySelector('#page-title');
const breadcrumbView = document.querySelector('#breadcrumb-view');
const modal = document.querySelector('#resident-modal');
const search = document.querySelector('#global-search');
const toast = document.querySelector('#toast');
const contentWrap = document.querySelector('.content-wrap');
const studentHomeMarkup = `<section class="student-welcome"><div><p class="eyebrow">Saturday, 22 August 2026</p><h1 id="page-title">Hi Riya, welcome home <span>✦</span></h1><p class="subheading">Everything you need for your stay, in one simple place.</p></div><span class="student-avatar">RK</span></section><section class="student-actions" aria-label="Quick actions"><button class="student-action coral" data-student-action="Pay rent"><i data-lucide="wallet-cards"></i><span><strong>Pay rent</strong><small>Next payment: 24 Aug</small></span><i data-lucide="arrow-up-right"></i></button><button class="student-action teal" data-student-action="View food menu"><i data-lucide="utensils"></i><span><strong>Food menu</strong><small>See today&apos;s meals</small></span><i data-lucide="arrow-up-right"></i></button><button class="student-action yellow" data-student-action="Laundry"><i data-lucide="shirt"></i><span><strong>Laundry</strong><small>2 clothes ready</small></span><i data-lucide="arrow-up-right"></i></button><button class="student-action blue" data-student-action="Raise a complaint"><i data-lucide="message-square-warning"></i><span><strong>Need help?</strong><small>Raise a complaint</small></span><i data-lucide="arrow-up-right"></i></button></section><section class="student-grid"><article class="panel student-card"><div class="panel-heading"><div><p class="eyebrow">Your stay</p><h2>My room</h2></div><i data-lucide="bed-double" class="student-card-icon"></i></div><div class="room-number">A-204</div><p class="student-muted">Arbor House PG · Block A</p><div class="room-details"><span><strong>Roommates</strong> 1 person</span><span><strong>Move-in</strong> 02 Aug 2026</span></div></article><article class="panel student-card"><div class="panel-heading"><div><p class="eyebrow">Today</p><h2>Food menu</h2></div><i data-lucide="utensils" class="student-card-icon"></i></div><div class="meal"><span class="meal-time">Breakfast</span><strong>Poha, eggs &amp; fruit</strong><small>7:30 - 9:30 AM</small></div><div class="meal"><span class="meal-time">Lunch</span><strong>Dal, rice, roti &amp; paneer</strong><small>12:30 - 2:30 PM</small></div><button class="text-button student-link" data-student-action="View full menu">View full menu <i data-lucide="arrow-right"></i></button></article><article class="panel student-card notices-card"><div class="panel-heading"><div><p class="eyebrow">Stay updated</p><h2>Latest notices</h2></div><i data-lucide="megaphone" class="student-card-icon"></i></div><div class="notice"><span class="notice-dot"></span><span><strong>Water supply maintenance</strong><small>Today · 2:00 - 4:00 PM</small></span></div><div class="notice"><span class="notice-dot"></span><span><strong>Independence Day holiday</strong><small>Posted 18 Aug</small></span></div><button class="text-button student-link" data-student-action="View all notices">View all notices <i data-lucide="arrow-right"></i></button></article></section><footer><span>Havenly student portal</span><span>Last synced just now <i data-lucide="refresh-cw"></i></span></footer>`;
contentWrap.innerHTML = studentHomeMarkup;
const overviewMarkup = contentWrap.innerHTML;
let toastTimer;
let activeUser = null;

const adminHomeMarkup = `<section class="admin-welcome"><div><p class="eyebrow">Admin workspace</p><h1 id="page-title">Good morning, admin <span>✦</span></h1><p class="subheading">Manage Arbor House residents, rooms, payments, and notices.</p></div><button class="primary-button admin-notice-button"><i data-lucide="megaphone"></i>Send notice</button></section><section class="admin-stats"><article><i data-lucide="users"></i><span><small>Total students</small><strong id="admin-student-count">-</strong></span></article><article><i data-lucide="bed-double"></i><span><small>Occupied beds</small><strong>164 <em>/ 184</em></strong></span></article><article><i data-lucide="bed-single"></i><span><small>Vacant beds</small><strong>14</strong></span></article><article><i data-lucide="wallet-cards"></i><span><small>Pending payments</small><strong>₹1.16L</strong></span></article></section><section class="admin-layout"><article class="panel admin-panel room-panel"><div class="panel-heading"><div><p class="eyebrow">Live inventory</p><h2>Rooms &amp; bed vacancy</h2></div><button class="text-button admin-refresh">Refresh <i data-lucide="refresh-cw"></i></button></div><div class="admin-table" id="room-table"><div class="admin-row admin-head"><span>Room</span><span>Students</span><span>Beds</span><span>Availability</span></div></div></article><article class="panel admin-panel notice-panel"><div class="panel-heading"><div><p class="eyebrow">Communication</p><h2>Recent notices</h2></div><button class="icon-button admin-notice-button" aria-label="Send notice"><i data-lucide="plus"></i></button></div><div id="notice-list"></div></article><article class="panel admin-panel student-panel"><div class="panel-heading"><div><p class="eyebrow">Directory</p><h2>Student information</h2></div><button class="text-button admin-refresh">Refresh <i data-lucide="refresh-cw"></i></button></div><div class="admin-table" id="student-table"><div class="admin-row admin-head"><span>Student</span><span>Email</span><span>Room</span><span>Status</span></div></div></article><article class="panel admin-panel payment-panel"><div class="panel-heading"><div><p class="eyebrow">Finance</p><h2>Recent transactions</h2></div><span class="admin-total">This month ₹8.42L</span></div><div class="admin-table" id="payment-table"><div class="admin-row admin-head"><span>Student</span><span>Amount</span><span>Date</span><span>Status</span></div></div></article></section><footer><span>Havenly admin portal</span><span>Last synced just now <i data-lucide="refresh-cw"></i></span></footer>`;

function renderAdminHome(user) {
  contentWrap.innerHTML = adminHomeMarkup;
  document.querySelector('#page-title').innerHTML = `Good morning, ${user.name.split(' ')[0]} <span>✦</span>`;
  lucide.createIcons();
  loadAdminData();
  document.querySelectorAll('.admin-notice-button').forEach((button) => button.addEventListener('click', sendAdminNotice));
  document.querySelectorAll('.admin-refresh').forEach((button) => button.addEventListener('click', loadAdminData));
}

async function loadAdminData() {
  const response = await fetch('/api/admin/dashboard');
  if (!response.ok) return showToast('Admin data could not be loaded');
  const data = await response.json();
  document.querySelector('#admin-student-count').textContent = data.students.length;
  document.querySelectorAll('#room-table .admin-row:not(.admin-head), #student-table .admin-row:not(.admin-head), #payment-table .admin-row:not(.admin-head)').forEach((row) => row.remove());
  document.querySelector('#room-table').insertAdjacentHTML('beforeend', data.rooms.map((room) => `<div class="admin-row"><strong>${room.room}</strong><span>${room.students}</span><span>${room.beds}</span><em class="status-pill ${room.vacancy.includes('vacant') ? 'green' : room.vacancy === 'Maintenance' ? 'red' : 'amber'}">${room.vacancy}</em></div>`).join(''));
  document.querySelector('#student-table').insertAdjacentHTML('beforeend', data.students.map((student) => `<div class="admin-row"><strong>${student.name}</strong><span>${student.email}</span><span>${student.room || 'Not assigned'}</span><em class="status-pill green">${student.status}</em></div>`).join(''));
  document.querySelector('#payment-table').insertAdjacentHTML('beforeend', data.payments.map((payment) => `<div class="admin-row"><strong>${payment.student}</strong><span>${payment.amount}</span><span>${payment.date}</span><em class="status-pill ${payment.status === 'Overdue' ? 'red' : payment.status === 'Pending' ? 'amber' : 'green'}">${payment.status}</em></div>`).join(''));
  document.querySelector('#notice-list').innerHTML = data.notices.map((notice) => `<div class="admin-notice"><i data-lucide="megaphone"></i><span><strong>${notice.title}</strong><small>${notice.audience} · ${notice.date}</small></span></div>`).join('');
  lucide.createIcons();
}

async function sendAdminNotice() {
  const title = window.prompt('Notice title');
  if (!title) return;
  const message = window.prompt('Notice message for students');
  if (!message) return;
  const response = await fetch('/api/admin/notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message }) });
  if (response.ok) { showToast('Notice sent to students'); loadAdminData(); }
  else showToast('Notice could not be sent');
}

const viewStyles = document.createElement('style');
viewStyles.textContent = '.student-welcome{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}.student-avatar{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#f26f52;color:#fff;font-weight:700;font-size:16px}.student-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}.student-action{display:flex;align-items:center;gap:11px;text-align:left;padding:17px 15px;border-radius:10px;background:#fff;border:1px solid #e6eceb;box-shadow:0 12px 35px rgba(25,52,60,.06);transition:transform .18s ease,box-shadow .18s ease}.student-action:hover{transform:translateY(-2px);box-shadow:0 16px 30px rgba(25,52,60,.1)}.student-action>svg:first-child{width:22px;height:22px}.student-action>svg:last-child{width:15px;margin-left:auto;color:#82929a}.student-action.coral>svg:first-child{color:#f26f52}.student-action.teal>svg:first-child{color:#1c9b8b}.student-action.yellow>svg:first-child{color:#bd821c}.student-action.blue>svg:first-child{color:#6f9edc}.student-action strong,.student-action small{display:block}.student-action strong{font-size:13px}.student-action small,.student-muted,.room-details,.meal small,.notice small{color:#82929a;font-size:11px;margin-top:4px}.student-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px}.student-card{min-height:275px}.student-card-icon{color:#1c9b8b;width:19px}.room-number{font-family:Space Grotesk,sans-serif;font-size:36px;font-weight:700;margin:18px 0 2px}.room-details{display:flex;gap:28px;margin-top:27px}.room-details strong{display:block;color:#19343c;font-size:12px;margin-bottom:4px}.meal{padding:12px 0;border-bottom:1px solid #e6eceb}.meal strong,.meal small{display:block}.meal-time{color:#f26f52;font-size:10px;text-transform:uppercase;font-weight:700;letter-spacing:1px}.student-link{margin-top:15px}.notice{display:flex;gap:10px;padding:13px 0;border-bottom:1px solid #e6eceb}.notice-dot{width:8px;height:8px;border-radius:50%;background:#f26f52;margin-top:4px;flex-shrink:0}.notice strong,.notice small{display:block}.notice strong{font-size:12px}@media(max-width:1050px){.student-actions{grid-template-columns:repeat(2,1fr)}.student-grid{grid-template-columns:1fr 1fr}.notices-card{grid-column:span 2}}@media(max-width:700px){.student-welcome{align-items:flex-start}.student-welcome h1{font-size:25px}.student-avatar{width:44px;height:44px}.student-actions,.student-grid{grid-template-columns:1fr}.notices-card{grid-column:auto}.student-action{padding:14px}.student-card{min-height:0}}';
viewStyles.textContent += '.admin-welcome{display:flex;align-items:end;justify-content:space-between;margin-bottom:28px}.admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}.admin-stats article{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid #e6eceb;border-radius:8px;padding:17px;box-shadow:0 12px 35px rgba(25,52,60,.06)}.admin-stats article>svg{width:21px;color:#1c9b8b}.admin-stats small,.admin-stats strong{display:block}.admin-stats small{color:#82929a;font-size:11px}.admin-stats strong{font-size:22px;margin-top:3px}.admin-stats em{font-style:normal;color:#82929a;font-size:12px}.admin-layout{display:grid;grid-template-columns:1.35fr .8fr;gap:18px}.admin-panel{min-height:260px}.student-panel{grid-column:span 2}.admin-table{margin-top:17px}.admin-row{display:grid;grid-template-columns:1.15fr 1.5fr .85fr 1fr;gap:14px;align-items:center;padding:13px 8px;border-top:1px solid #e6eceb;color:#65767a;font-size:11px}.admin-row strong{color:#19343c;font-size:12px}.admin-head{border-top:0;color:#91a0a2;text-transform:uppercase;letter-spacing:1px;font-size:9px;font-weight:700}.admin-row em{justify-self:start}.admin-total{font-size:11px;color:#1c9b8b;font-weight:700}.admin-notice{display:flex;gap:10px;border-bottom:1px solid #e6eceb;padding:13px 0}.admin-notice strong,.admin-notice small{display:block}.admin-notice strong{font-size:12px}.admin-notice small{font-size:10px;color:#82929a;margin-top:4px}.admin-notice svg{width:16px;color:#1c9b8b}@media(max-width:1050px){.admin-stats{grid-template-columns:repeat(2,1fr)}.admin-layout{grid-template-columns:1fr}.student-panel{grid-column:auto}}@media(max-width:700px){.admin-welcome{align-items:flex-start;gap:16px;flex-direction:column}.admin-stats{gap:10px}.admin-stats article{padding:13px}.admin-stats strong{font-size:18px}.admin-row{grid-template-columns:1fr 1fr;gap:8px}.admin-row span:nth-child(2),.admin-row span:nth-child(3){font-size:10px}.admin-row span:last-child{grid-column:2;grid-row:1;justify-self:end}}';
document.head.appendChild(viewStyles);

const viewData = {
  Residents: { eyebrow: 'People directory', title: 'Residents', copy: 'Manage profiles, agreements, and resident wellbeing.', action: 'Add resident', icon: 'user-plus', metrics: [['Total residents', '142', '6 new this month'], ['Checked in', '136', '95.8% of residents'], ['Agreements pending', '08', 'Needs review today'], ['Move-outs this month', '04', '2 scheduled this week']], heading: 'Resident directory', rows: [['Ananya Mehta', 'A-204', 'Today', 'Checked in'], ['Rohan Sethi', 'B-108', 'Yesterday', 'Agreement pending'], ['Niharika Singh', 'C-302', '20 Aug', 'Checked in'], ['Karan Malhotra', 'A-116', '18 Aug', 'Checked in']] },
  'Rooms & beds': { eyebrow: 'Inventory', title: 'Rooms & beds', copy: 'See availability at a glance and keep every bed accounted for.', action: 'Add room', icon: 'plus', metrics: [['Total beds', '184', 'Across 72 rooms'], ['Occupied', '164', '89.2% occupancy'], ['Available', '14', 'Ready to assign'], ['Maintenance', '06', '2 urgent issues']], heading: 'Room inventory', rows: [['A-204', 'Double', '2 / 2', 'Occupied'], ['B-108', 'Single', '1 / 1', 'Occupied'], ['C-302', 'Double', '1 / 2', '1 bed available'], ['B-206', 'Single', '0 / 1', 'Maintenance']] },
  Payments: { eyebrow: 'Finance', title: 'Payments', copy: 'Track collections, pending rent, and payment activity.', action: 'Record payment', icon: 'indian-rupee', metrics: [['Collected this month', '₹8.42L', '+12.4% vs last month'], ['Pending amount', '₹1.16L', 'Across 21 residents'], ['Paid on time', '91%', 'Up 3.2% this month'], ['Overdue accounts', '08', 'Requires follow-up']], heading: 'Recent transactions', rows: [['Karan Malhotra', '₹12,500', '22 Aug, 09:18', 'Received'], ['Devika Shah', '₹14,000', '21 Aug, 16:42', 'Received'], ['Rohan Sethi', '₹11,800', 'Due 24 Aug', 'Pending'], ['Priya Nair', '₹13,500', 'Due 20 Aug', 'Overdue']] },
  Laundry: { eyebrow: 'Resident service', title: 'Laundry', copy: 'Coordinate orders, pickups, and the daily laundry queue.', action: 'New order', icon: 'plus', metrics: [['Orders today', '38', '14 in washing'], ['Ready for pickup', '24', '8 added this hour'], ['Collected', '63%', 'Of today’s orders'], ['Avg. turnaround', '26h', '2h faster this week']], heading: 'Today’s orders', rows: [['LD-1048', 'Ananya Mehta', '12 items', 'Ready for pickup'], ['LD-1047', 'Rohan Sethi', '8 items', 'In washing'], ['LD-1046', 'Devika Shah', '15 items', 'Collected'], ['LD-1045', 'Niharika Singh', '6 items', 'Received']] },
  'Mess & menu': { eyebrow: 'Dining operations', title: 'Mess & menu', copy: 'Plan menus and monitor attendance for every meal.', action: 'Plan menu', icon: 'utensils', metrics: [['Breakfast attendance', '127', '89% of residents'], ['Lunch expected', '151', 'Based on reservations'], ['Today’s rating', '4.6/5', 'From 86 responses'], ['Special requests', '12', '6 dietary preferences']], heading: 'Today’s menu', rows: [['Breakfast', 'Poha, eggs, fruit', '07:30 - 09:30', '127 attending'], ['Lunch', 'Dal, rice, roti, paneer', '12:30 - 14:30', '151 expected'], ['Snacks', 'Tea and samosa', '17:00 - 18:00', 'Open service'], ['Dinner', 'Rajma, salad, curd', '19:30 - 21:30', 'Reservations open']] },
  Complaints: { eyebrow: 'Service desk', title: 'Complaints', copy: 'Resolve resident issues and keep response times visible.', action: 'Log complaint', icon: 'plus', metrics: [['Open complaints', '06', '2 urgent'], ['Assigned today', '04', 'All within SLA'], ['Resolved this month', '48', '+9.1% vs last month'], ['Avg. response', '3.4h', 'Down from 4.1h']], heading: 'Open complaints', rows: [['Water leakage', 'B-206 · Priya Nair', 'Urgent', 'Assigned to maintenance'], ['Wi-Fi connectivity', 'A-116 · Karan Malhotra', 'High', 'In progress'], ['Fan repair', 'C-302 · Niharika Singh', 'Normal', 'Unassigned'], ['Room cleaning', 'B-108 · Rohan Sethi', 'Normal', 'Scheduled today']] },
  Visitors: { eyebrow: 'Front desk', title: 'Visitors', copy: 'Review visitor requests and keep entry records up to date.', action: 'Register visitor', icon: 'scan-face', metrics: [['Expected today', '18', '5 arriving this hour'], ['Checked in', '09', 'Since 08:00 AM'], ['Pending approval', '03', 'Needs resident response'], ['Checked out', '06', 'All passes returned']], heading: 'Visitor log', rows: [['Arjun Mehta', 'Ananya Mehta · A-204', '09:45 AM', 'Checked in'], ['Maya Shah', 'Devika Shah · C-110', '10:30 AM', 'Expected'], ['Ravi Nair', 'Priya Nair · B-206', '11:15 AM', 'Pending approval'], ['Neel Kapoor', 'Karan Malhotra · A-116', '08:12 AM', 'Checked out']] },
  'Notice board': { eyebrow: 'Resident communication', title: 'Notice board', copy: 'Share timely updates with everyone at Arbor House.', action: 'Post notice', icon: 'megaphone', metrics: [['Published notices', '24', 'This academic year'], ['Scheduled', '03', 'Next notice tomorrow'], ['Read rate', '87%', 'Across active notices'], ['Drafts', '02', 'Ready to publish']], heading: 'Recent notices', rows: [['Water supply maintenance', 'All residents', 'Posted today', 'Published'], ['Independence Day holiday', 'All residents', 'Posted 18 Aug', 'Published'], ['Lift inspection - Block B', 'Block B', 'Posted 16 Aug', 'Published'], ['Mess feedback week', 'All residents', 'Scheduled 25 Aug', 'Scheduled']] },
  'Student services': { eyebrow: 'Resident support', title: 'Student services', copy: 'Make everyday support easier to find and manage.', action: 'Add service', icon: 'plus', metrics: [['Active services', '12', 'Across 5 categories'], ['Requests this month', '86', '14 awaiting action'], ['Avg. satisfaction', '4.8/5', 'From 52 ratings'], ['Partners', '09', 'Verified providers']], heading: 'Service directory', rows: [['Airport pickup', 'Transport', 'Available 24/7', 'Active'], ['Laundry alteration', 'Convenience', '2 partners', 'Active'], ['Doctor on call', 'Health', 'Mon - Sat', 'Active'], ['Laptop repair', 'Academic', '1 partner', 'Review due']] },
  Settings: { eyebrow: 'Workspace', title: 'Settings', copy: 'Configure your property, team access, and resident experience.', action: 'Save changes', icon: 'check', metrics: [['Property status', 'Live', 'Arbor House PG'], ['Team members', '08', '3 admins, 5 staff'], ['Notification rules', '14', 'All configured'], ['Last backup', 'Today', '08:00 AM']], heading: 'Workspace settings', rows: [['Property profile', 'Address, capacity, contact details', 'Updated 18 Aug', 'Configured'], ['Team access', 'Roles and permissions', '8 members', 'Configured'], ['Resident notifications', 'Email, SMS, and push rules', '14 rules active', 'Configured'], ['Integrations', 'Payments and visitor systems', '3 connected', 'Review']] }
};

function renderView(view) {
  if (view === 'Overview') {
    contentWrap.innerHTML = overviewMarkup;
    bindOverviewActions();
    return;
  }
  const data = viewData[view];
  contentWrap.innerHTML = `<section class="page-heading view-heading"><div><p class="eyebrow">${data.eyebrow}</p><h1 id="page-title">${data.title} <span>✦</span></h1><p class="subheading">${data.copy}</p></div><div class="heading-actions"><select aria-label="Filter ${data.title}"><option>All activity</option><option>Needs attention</option><option>Recently updated</option></select><button class="primary-button view-action"><i data-lucide="${data.icon}"></i>${data.action}</button></div></section><section class="stats-grid view-stats">${data.metrics.map(([label, value, detail]) => `<article class="stat-card"><div class="stat-top"><span class="stat-icon"><i data-lucide="bar-chart-3"></i></span></div><p>${label}</p><strong>${value}</strong><small>${detail}</small></article>`).join('')}</section><section class="panel directory-panel"><div class="panel-heading"><div><p class="eyebrow">Workspace</p><h2>${data.heading}</h2></div><button class="text-button view-refresh">Refresh <i data-lucide="refresh-cw"></i></button></div><div class="directory-table"><div class="directory-row table-head"><span>Item</span><span>Details</span><span>Timing</span><span>Status</span></div>${data.rows.map(([item, details, timing, status]) => `<div class="directory-row"><strong>${item}</strong><span>${details}</span><span>${timing}</span><em class="status-pill ${status.toLowerCase().includes('urgent') || status.toLowerCase().includes('overdue') ? 'red' : status.toLowerCase().includes('pending') || status.toLowerCase().includes('review') ? 'amber' : 'green'}">${status}</em></div>`).join('')}</div></section>`;
  lucide.createIcons();
  document.querySelector('.view-action').addEventListener('click', () => showToast(`${data.action} workspace opened`));
  document.querySelector('.view-refresh').addEventListener('click', () => showToast(`${data.title} refreshed just now`));
}

function bindOverviewActions() {
  lucide.createIcons();
  document.querySelectorAll('.student-action, .student-link').forEach((action) => action.addEventListener('click', () => {
    showToast(`${action.dataset.studentAction} opened`);
  }));
  const addResident = document.querySelector('#add-resident');
  if (addResident) addResident.addEventListener('click', () => { modal.hidden = false; modal.querySelector('input').focus(); });
  const periodSelect = document.querySelector('#period-select');
  if (periodSelect) periodSelect.addEventListener('change', (event) => {
    const label = event.target.options[event.target.selectedIndex].text;
    document.querySelector('.revenue p').textContent = label === 'Today' ? 'Collected today' : `Collected ${label.toLowerCase()}`;
  });
  document.querySelectorAll('.task').forEach((task) => task.addEventListener('click', () => {
    task.classList.toggle('completed');
    task.querySelector('.task-check').classList.toggle('done');
  }));
  document.querySelectorAll('.quick-action').forEach((action) => action.addEventListener('click', () => {
    if (action.dataset.action === 'Check-in resident') { modal.hidden = false; modal.querySelector('input').focus(); return; }
    showToast(`${action.dataset.action} workspace opened`);
  }));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((navItem) => navItem.classList.remove('active'));
    item.classList.add('active');
    const view = item.dataset.view;
    breadcrumbView.textContent = view;
    if (view === 'Overview' && activeUser?.role === 'admin') renderAdminHome(activeUser);
    else renderView(view);
    if (window.innerWidth < 701) document.querySelector('.sidebar').classList.remove('open');
  });
});

document.querySelector('.mobile-menu').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

document.querySelector('#modal-close').addEventListener('click', () => { modal.hidden = true; });
modal.addEventListener('click', (event) => { if (event.target === modal) modal.hidden = true; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') modal.hidden = true; });

document.querySelector('#resident-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = new FormData(event.target).get('name');
  modal.hidden = true;
  document.querySelector('#page-title').innerHTML = `Welcome, ${name.split(' ')[0]} <span>✦</span>`;
  event.target.reset();
});

search.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();
  document.querySelectorAll('.activity-item, .resident-row:not(.table-head), .task').forEach((row) => {
    row.style.display = !query || row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
});

bindOverviewActions();

const studentLogout = document.querySelector('#student-logout');
if (studentLogout) studentLogout.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
});

fetch('/api/auth/me')
  .then((response) => response.json())
  .then(({ authenticated, user }) => {
    if (!authenticated || !user) return;
    activeUser = user;
    if (user.role === 'admin') {
      renderAdminHome(user);
      breadcrumbView.textContent = 'Admin dashboard';
      return;
    }
    const firstName = user.name.split(' ')[0];
    const heading = document.querySelector('#page-title');
    if (heading && document.querySelector('.student-welcome')) heading.innerHTML = `Hi ${firstName}, welcome home <span>✦</span>`;
    const avatars = document.querySelectorAll('.student-avatar, .profile-button, .user-avatar');
    avatars.forEach((avatar) => { avatar.textContent = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); });
    const userName = document.querySelector('.user-card strong');
    const userRole = document.querySelector('.user-card small');
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role === 'admin' ? 'Property admin' : 'Student';
    const roomNumber = document.querySelector('.room-number');
    if (roomNumber) roomNumber.textContent = user.room || 'Not assigned';
  })
  .catch(() => {});
