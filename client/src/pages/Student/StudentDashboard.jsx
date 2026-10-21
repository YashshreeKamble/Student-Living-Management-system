import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  WalletCards,
  Shirt,
  Utensils,
  Wrench,
  ScanFace,
  Megaphone,
  MapPin,
  Settings2,
  MoreHorizontal,
  LogOut,
  Menu,
  ChevronRight,
  Search,
  Bell,
  ArrowUpRight,
  ArrowRight,
  Building2,
  IndianRupee,
  MessageSquareWarning,
  WashingMachine,
  LogIn,
  QrCode,
  CreditCard,
  PackageCheck,
  ChevronDown,
  RefreshCw,
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  UserPlus,
  Plus,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/styles.css';

const viewData = {
  Residents: {
    eyebrow: 'People directory',
    title: 'Residents',
    copy: 'Manage profiles, agreements, and resident wellbeing.',
    action: 'Add resident',
    icon: UserPlus,
    metrics: [
      ['Total residents', '142', '6 new this month'],
      ['Checked in', '136', '95.8% of residents'],
      ['Agreements pending', '08', 'Needs review today'],
      ['Move-outs this month', '04', '2 scheduled this week']
    ],
    heading: 'Resident directory',
    rows: [
      ['Ananya Mehta', 'A-204', 'Today', 'Checked in'],
      ['Rohan Sethi', 'B-108', 'Yesterday', 'Agreement pending'],
      ['Niharika Singh', 'C-302', '20 Aug', 'Checked in'],
      ['Karan Malhotra', 'A-116', '18 Aug', 'Checked in']
    ]
  },
  'Rooms & beds': {
    eyebrow: 'Inventory',
    title: 'Rooms & beds',
    copy: 'See availability at a glance and keep every bed accounted for.',
    action: 'Add room',
    icon: Plus,
    metrics: [
      ['Total beds', '184', 'Across 72 rooms'],
      ['Occupied', '164', '89.2% occupancy'],
      ['Available', '14', 'Ready to assign'],
      ['Maintenance', '06', '2 urgent issues']
    ],
    heading: 'Room inventory',
    rows: [
      ['A-204', 'Double', '2 / 2', 'Occupied'],
      ['B-108', 'Single', '1 / 1', 'Occupied'],
      ['C-302', 'Double', '1 / 2', '1 bed available'],
      ['B-206', 'Single', '0 / 1', 'Maintenance']
    ]
  },
  Payments: {
    eyebrow: 'Finance',
    title: 'Payments',
    copy: 'Track collections, pending rent, and payment activity.',
    action: 'Record payment',
    icon: IndianRupee,
    metrics: [
      ['Collected this month', '₹8.42L', '+12.4% vs last month'],
      ['Pending amount', '₹1.16L', 'Across 21 residents'],
      ['Paid on time', '91%', 'Up 3.2% this month'],
      ['Overdue accounts', '08', 'Requires follow-up']
    ],
    heading: 'Recent transactions',
    rows: [
      ['Karan Malhotra', '₹12,500', '22 Aug, 09:18', 'Received'],
      ['Devika Shah', '₹14,000', '21 Aug, 16:42', 'Received'],
      ['Rohan Sethi', '₹11,800', 'Due 24 Aug', 'Pending'],
      ['Priya Nair', '₹13,500', 'Due 20 Aug', 'Overdue']
    ]
  },
  Laundry: {
    eyebrow: 'Resident service',
    title: 'Laundry',
    copy: 'Coordinate orders, pickups, and the daily laundry queue.',
    action: 'New order',
    icon: Plus,
    metrics: [
      ['Orders today', '38', '14 in washing'],
      ['Ready for pickup', '24', '8 added this hour'],
      ['Collected', '63%', 'Of today’s orders'],
      ['Avg. turnaround', '26h', '2h faster this week']
    ],
    heading: 'Today’s orders',
    rows: [
      ['LD-1048', 'Ananya Mehta', '12 items', 'Ready for pickup'],
      ['LD-1047', 'Rohan Sethi', '8 items', 'In washing'],
      ['LD-1046', 'Devika Shah', '15 items', 'Collected'],
      ['LD-1045', 'Niharika Singh', '6 items', 'Received']
    ]
  },
  'Mess & menu': {
    eyebrow: 'Dining operations',
    title: 'Mess & menu',
    copy: 'Plan menus and monitor attendance for every meal.',
    action: 'Plan menu',
    icon: Utensils,
    metrics: [
      ['Breakfast attendance', '127', '89% of residents'],
      ['Lunch expected', '151', 'Based on reservations'],
      ['Today’s rating', '4.6/5', 'From 86 responses'],
      ['Special requests', '12', '6 dietary preferences']
    ],
    heading: 'Today’s menu',
    rows: [
      ['Breakfast', 'Poha, eggs, fruit', '07:30 - 09:30', '127 attending'],
      ['Lunch', 'Dal, rice, roti, paneer', '12:30 - 14:30', '151 expected'],
      ['Snacks', 'Tea and samosa', '17:00 - 18:00', 'Open service'],
      ['Dinner', 'Rajma, salad, curd', '19:30 - 21:30', 'Reservations open']
    ]
  },
  Complaints: {
    eyebrow: 'Service desk',
    title: 'Complaints',
    copy: 'Resolve resident issues and keep response times visible.',
    action: 'Log complaint',
    icon: Plus,
    metrics: [
      ['Open complaints', '06', '2 urgent'],
      ['Assigned today', '04', 'All within SLA'],
      ['Resolved this month', '48', '+9.1% vs last month'],
      ['Avg. response', '3.4h', 'Down from 4.1h']
    ],
    heading: 'Open complaints',
    rows: [
      ['Water leakage', 'B-206 · Priya Nair', 'Urgent', 'Assigned to maintenance'],
      ['Wi-Fi connectivity', 'A-116 · Karan Malhotra', 'High', 'In progress'],
      ['Fan repair', 'C-302 · Niharika Singh', 'Normal', 'Unassigned'],
      ['Room cleaning', 'B-108 · Rohan Sethi', 'Normal', 'Scheduled today']
    ]
  },
  Visitors: {
    eyebrow: 'Front desk',
    title: 'Visitors',
    copy: 'Review visitor requests and keep entry records up to date.',
    action: 'Register visitor',
    icon: ScanFace,
    metrics: [
      ['Expected today', '18', '5 arriving this hour'],
      ['Checked in', '09', 'Since 08:00 AM'],
      ['Pending approval', '03', 'Needs resident response'],
      ['Checked out', '06', 'All passes returned']
    ],
    heading: 'Visitor log',
    rows: [
      ['Arjun Mehta', 'Ananya Mehta · A-204', '09:45 AM', 'Checked in'],
      ['Maya Shah', 'Devika Shah · C-110', '10:30 AM', 'Expected'],
      ['Ravi Nair', 'Priya Nair · B-206', '11:15 AM', 'Pending approval'],
      ['Neel Kapoor', 'Karan Malhotra · A-116', '08:12 AM', 'Checked out']
    ]
  },
  'Notice board': {
    eyebrow: 'Resident communication',
    title: 'Notice board',
    copy: 'Share timely updates with everyone at Arbor House.',
    action: 'Post notice',
    icon: Megaphone,
    metrics: [
      ['Published notices', '24', 'This academic year'],
      ['Scheduled', '03', 'Next notice tomorrow'],
      ['Read rate', '87%', 'Across active notices'],
      ['Drafts', '02', 'Ready to publish']
    ],
    heading: 'Recent notices',
    rows: [
      ['Water supply maintenance', 'All residents', 'Posted today', 'Published'],
      ['Independence Day holiday', 'All residents', 'Posted 18 Aug', 'Published'],
      ['Lift inspection - Block B', 'Block B', 'Posted 16 Aug', 'Published'],
      ['Mess feedback week', 'All residents', 'Scheduled 25 Aug', 'Scheduled']
    ]
  },
  'Student services': {
    eyebrow: 'Resident support',
    title: 'Student services',
    copy: 'Make everyday support easier to find and manage.',
    action: 'Add service',
    icon: Plus,
    metrics: [
      ['Active services', '12', 'Across 5 categories'],
      ['Requests this month', '86', '14 awaiting action'],
      ['Avg. satisfaction', '4.8/5', 'From 52 ratings'],
      ['Partners', '09', 'Verified providers']
    ],
    heading: 'Service directory',
    rows: [
      ['Airport pickup', 'Transport', 'Available 24/7', 'Active'],
      ['Laundry alteration', 'Convenience', '2 partners', 'Active'],
      ['Doctor on call', 'Health', 'Mon - Sat', 'Active'],
      ['Laptop repair', 'Academic', '1 partner', 'Review due']
    ]
  },
  Settings: {
    eyebrow: 'Workspace',
    title: 'Settings',
    copy: 'Configure your property, team access, and resident experience.',
    action: 'Save changes',
    icon: Check,
    metrics: [
      ['Property status', 'Live', 'Arbor House PG'],
      ['Team members', '08', '3 admins, 5 staff'],
      ['Notification rules', '14', 'All configured'],
      ['Last backup', 'Today', '08:00 AM']
    ],
    heading: 'Workspace settings',
    rows: [
      ['Property profile', 'Address, capacity, contact details', 'Updated 18 Aug', 'Configured'],
      ['Team access', 'Roles and permissions', '8 members', 'Configured'],
      ['Resident notifications', 'Email, SMS, and push rules', '14 rules active', 'Configured'],
      ['Integrations', 'Payments and visitor systems', '3 connected', 'Review']
    ]
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeView, setActiveView] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Task list states
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review 2 pending agreements', subtitle: 'Due by end of day', completed: false },
    { id: 2, title: 'Assign urgent complaint', subtitle: 'Water leakage · Room B-206', completed: false },
    { id: 3, title: 'Approve visitor request', subtitle: 'For resident Priya Nair', completed: false }
  ]);

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RK';

  const firstName = user?.name ? user.name.split(' ')[0] : 'Riya';

  // Activity feed items
  const activityItems = [
    {
      id: 1,
      iconClass: 'teal',
      icon: LogIn,
      title: 'New check-in completed',
      subtitle: 'Ananya Mehta · Room A-204',
      time: '09:42 AM'
    },
    {
      id: 2,
      iconClass: 'coral',
      icon: CreditCard,
      title: 'Rent payment received',
      subtitle: '₹12,500 from Karan Malhotra',
      time: '09:18 AM'
    },
    {
      id: 3,
      iconClass: 'yellow',
      icon: PackageCheck,
      title: 'Parcel collected',
      subtitle: 'Pickup by Devika Shah · OTP verified',
      time: '08:56 AM'
    },
    {
      id: 4,
      iconClass: 'blue',
      icon: Utensils,
      title: 'Mess attendance synced',
      subtitle: 'Breakfast · 127 residents scanned',
      time: '08:30 AM'
    }
  ];

  const filteredActivities = activityItems.filter(
    (item) =>
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">Y</span>
          <span>Your PG Name</span>
        </div>
        <div className="property-switcher">
          <span className="property-avatar">A</span>
          <span>
            <small>Managing</small>
            <strong>Arbor House PG</strong>
          </span>
          <ChevronsUpDown size={15} />
        </div>
        <nav className="nav-list">
          <p className="nav-label">Workspace</p>
          <button
            className={`nav-item ${activeView === 'Overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Overview');
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={17} />
            <span>Home</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Residents' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Residents');
              setSidebarOpen(false);
            }}
          >
            <Users size={17} />
            <span>My profile</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Rooms & beds' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Rooms & beds');
              setSidebarOpen(false);
            }}
          >
            <BedDouble size={17} />
            <span>My room</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Payments' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Payments');
              setSidebarOpen(false);
            }}
          >
            <WalletCards size={17} />
            <span>Rent & payments</span>
            <b className="alert-count">1</b>
          </button>
          <button
            className={`nav-item ${activeView === 'Laundry' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Laundry');
              setSidebarOpen(false);
            }}
          >
            <Shirt size={17} />
            <span>Laundry</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Mess & menu' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Mess & menu');
              setSidebarOpen(false);
            }}
          >
            <Utensils size={17} />
            <span>Food menu</span>
          </button>

          <p className="nav-label second">Operations</p>
          <button
            className={`nav-item ${activeView === 'Complaints' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Complaints');
              setSidebarOpen(false);
            }}
          >
            <Wrench size={17} />
            <span>Help & complaints</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Visitors' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Visitors');
              setSidebarOpen(false);
            }}
          >
            <ScanFace size={17} />
            <span>Visitors</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Notice board' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Notice board');
              setSidebarOpen(false);
            }}
          >
            <Megaphone size={17} />
            <span>Notices</span>
          </button>
          <button
            className={`nav-item ${activeView === 'Student services' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Student services');
              setSidebarOpen(false);
            }}
          >
            <MapPin size={17} />
            <span>Services</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${activeView === 'Settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('Settings');
              setSidebarOpen(false);
            }}
          >
            <Settings2 size={17} />
            <span>Account</span>
          </button>
          <div className="user-card">
            <span className="user-avatar">{initials}</span>
            <span>
              <strong>{user?.name || 'Riya Kapoor'}</strong>
              <small>{user?.role === 'admin' ? 'Property admin' : 'Student'}</small>
            </span>
            <button aria-label="Account menu" type="button">
              <MoreHorizontal size={17} />
            </button>
          </div>
          <button className="student-logout" id="student-logout" onClick={handleLogout} type="button">
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Arbor House PG</span>
            <ChevronRight size={13} />
            <strong id="breadcrumb-view">{activeView}</strong>
          </div>
          <div className="top-actions">
            <label className="search">
              <Search size={16} />
              <input
                id="global-search"
                type="search"
                placeholder="Search residents, rooms..."
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            <button
              className="icon-button notification"
              aria-label="Notifications"
              onClick={() => triggerToast('No unread notifications')}
              type="button"
            >
              <Bell size={18} />
              <span></span>
            </button>
            <button className="profile-button" type="button">
              {initials}
            </button>
          </div>
        </header>

        <div className="content-wrap">
          {activeView === 'Overview' ? (
            <>
              {/* Student Welcome Header */}
              <section className="student-welcome">
                <div>
                  <p className="eyebrow">Saturday, 22 August 2026</p>
                  <h1 id="page-title">
                    Hi {firstName}, welcome home <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Everything you need for your stay, in one simple place.
                  </p>
                </div>
                <span className="student-avatar">{initials}</span>
              </section>

              {/* Student Quick Action Cards */}
              <section className="student-actions" aria-label="Quick actions">
                <button
                  className="student-action coral"
                  onClick={() => triggerToast('Pay rent opened')}
                  type="button"
                >
                  <WalletCards size={22} />
                  <span>
                    <strong>Pay rent</strong>
                    <small>Next payment: 24 Aug</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  className="student-action teal"
                  onClick={() => setActiveView('Mess & menu')}
                  type="button"
                >
                  <Utensils size={22} />
                  <span>
                    <strong>Food menu</strong>
                    <small>See today's meals</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  className="student-action yellow"
                  onClick={() => setActiveView('Laundry')}
                  type="button"
                >
                  <Shirt size={22} />
                  <span>
                    <strong>Laundry</strong>
                    <small>2 clothes ready</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  className="student-action blue"
                  onClick={() => setActiveView('Complaints')}
                  type="button"
                >
                  <MessageSquareWarning size={22} />
                  <span>
                    <strong>Need help?</strong>
                    <small>Raise a complaint</small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              </section>

              {/* Student Grid (Room, Food, Notices) */}
              <section className="student-grid">
                <article className="panel student-card">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Your stay</p>
                      <h2>My room</h2>
                    </div>
                    <BedDouble size={19} className="student-card-icon" />
                  </div>
                  <div className="room-number">{user?.room || 'A-204'}</div>
                  <p className="student-muted">
                    {user?.email
                      ? `${user.email} · ${user.bed ? `Bed ${user.bed}` : 'Bed not allocated'}`
                      : 'Arbor House PG · Block A'}
                  </p>
                  <div className="room-details">
                    <span>
                      <strong>Booking status</strong>
                      {user?.status === 'approved' ? 'Approved' : 'Pending approval'}
                    </span>
                    <span>
                      <strong>Bed</strong>
                      {user?.bed || 'Not assigned'}
                    </span>
                  </div>
                </article>

                <article className="panel student-card">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Today</p>
                      <h2>Food menu</h2>
                    </div>
                    <Utensils size={19} className="student-card-icon" />
                  </div>
                  <div className="meal">
                    <span className="meal-time">Breakfast</span>
                    <strong>Poha, eggs &amp; fruit</strong>
                    <small>7:30 - 9:30 AM</small>
                  </div>
                  <div className="meal">
                    <span className="meal-time">Lunch</span>
                    <strong>Dal, rice, roti &amp; paneer</strong>
                    <small>12:30 - 2:30 PM</small>
                  </div>
                  <button
                    className="text-button student-link"
                    onClick={() => setActiveView('Mess & menu')}
                    type="button"
                  >
                    View full menu <ArrowRight size={15} />
                  </button>
                </article>

                <article className="panel student-card notices-card">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Stay updated</p>
                      <h2>Latest notices</h2>
                    </div>
                    <Megaphone size={19} className="student-card-icon" />
                  </div>
                  <div className="notice">
                    <span className="notice-dot"></span>
                    <span>
                      <strong>Water supply maintenance</strong>
                      <small>Today · 2:00 - 4:00 PM</small>
                    </span>
                  </div>
                  <div className="notice">
                    <span className="notice-dot"></span>
                    <span>
                      <strong>Independence Day holiday</strong>
                      <small>Posted 18 Aug</small>
                    </span>
                  </div>
                  <button
                    className="text-button student-link"
                    onClick={() => setActiveView('Notice board')}
                    type="button"
                  >
                    View all notices <ArrowRight size={15} />
                  </button>
                </article>
              </section>

              {/* Quick Actions Row */}
              <section className="quick-actions" aria-label="Quick actions">
                <span className="quick-actions-label">Quick actions</span>
                <button
                  className="quick-action"
                  onClick={() => setModalOpen(true)}
                  type="button"
                >
                  <LogIn size={15} />
                  Check-in
                </button>
                <button
                  className="quick-action"
                  onClick={() => triggerToast('Collect rent workspace opened')}
                  type="button"
                >
                  <WalletCards size={15} />
                  Collect rent
                </button>
                <button
                  className="quick-action"
                  onClick={() => triggerToast('Post notice workspace opened')}
                  type="button"
                >
                  <Megaphone size={15} />
                  Post notice
                </button>
                <button
                  className="quick-action"
                  onClick={() => triggerToast('Scan visitor pass workspace opened')}
                  type="button"
                >
                  <QrCode size={15} />
                  Scan visitor
                </button>
              </section>

              {/* Summary Stats Grid */}
              <section className="stats-grid" aria-label="Property summary">
                <article className="stat-card occupancy">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <Building2 size={17} />
                    </span>
                    <span className="trend up">
                      <TrendingUp size={12} /> 4.8%
                    </span>
                  </div>
                  <p>Occupancy rate</p>
                  <strong>
                    89.2<span>%</span>
                  </strong>
                  <div className="progress">
                    <span style={{ width: '89.2%' }}></span>
                  </div>
                  <small>164 of 184 beds occupied</small>
                </article>

                <article className="stat-card revenue">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <IndianRupee size={17} />
                    </span>
                    <span className="trend up">
                      <TrendingUp size={12} /> 12.4%
                    </span>
                  </div>
                  <p>Collected this month</p>
                  <strong>
                    ₹8.42<span>L</span>
                  </strong>
                  <small>₹1.16L pending across 21 residents</small>
                  <div className="sparkline" aria-hidden="true">
                    <i style={{ height: '35%' }}></i>
                    <i style={{ height: '44%' }}></i>
                    <i style={{ height: '39%' }}></i>
                    <i style={{ height: '63%' }}></i>
                    <i style={{ height: '55%' }}></i>
                    <i style={{ height: '79%' }}></i>
                    <i style={{ height: '72%' }}></i>
                    <i style={{ height: '94%' }}></i>
                  </div>
                </article>

                <article className="stat-card complaints">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <MessageSquareWarning size={17} />
                    </span>
                    <span className="trend down">
                      <TrendingDown size={12} /> 9.1%
                    </span>
                  </div>
                  <p>Open complaints</p>
                  <strong>06</strong>
                  <small>2 marked urgent · 4 assigned today</small>
                  <div className="complaint-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </article>

                <article className="stat-card laundry">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <WashingMachine size={17} />
                    </span>
                    <span className="trend neutral">Today</span>
                  </div>
                  <p>Laundry orders</p>
                  <strong>38</strong>
                  <small>24 ready for pickup</small>
                  <div className="laundry-bar">
                    <span style={{ width: '63%' }}></span>
                  </div>
                  <div className="bar-legend">
                    <span>Picked up</span>
                    <strong>63%</strong>
                  </div>
                </article>
              </section>

              {/* Dashboard Grid (Activity, Chart, Residents, Tasks) */}
              <section className="dashboard-grid">
                <article className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Live feed</p>
                      <h2>Today at a glance</h2>
                    </div>
                    <button
                      className="text-button"
                      id="view-activity"
                      onClick={() => triggerToast('Activity feed refreshed')}
                      type="button"
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="activity-list">
                    {filteredActivities.map((act) => {
                      const IconComponent = act.icon;
                      return (
                        <div className="activity-item" key={act.id}>
                          <span className={`activity-icon ${act.iconClass}`}>
                            <IconComponent size={15} />
                          </span>
                          <div>
                            <strong>{act.title}</strong>
                            <p>{act.subtitle}</p>
                          </div>
                          <time>{act.time}</time>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Financial overview</p>
                      <h2>Revenue performance</h2>
                    </div>
                    <button className="select-button" type="button">
                      Last 6 months <ChevronDown size={13} />
                    </button>
                  </div>
                  <div className="chart-summary">
                    <strong>₹48.6L</strong>
                    <span className="trend up">
                      +18.6% <small>vs last period</small>
                    </span>
                  </div>
                  <div className="chart" aria-label="Revenue chart">
                    <div className="y-axis">
                      <span>10L</span>
                      <span>7.5L</span>
                      <span>5L</span>
                      <span>2.5L</span>
                      <span>0</span>
                    </div>
                    <div className="chart-area">
                      <div className="grid-lines">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                      </div>
                      <svg
                        viewBox="0 0 600 190"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Increasing revenue trend"
                      >
                        <defs>
                          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="#f26f52" stopOpacity=".25" />
                            <stop offset="1" stopColor="#f26f52" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,151 C45,140 62,143 101,128 S150,139 193,108 S240,111 282,96 S330,104 367,69 S410,76 456,56 S505,65 544,35 S580,38 600,21 L600,190 L0,190 Z"
                          fill="url(#areaGrad)"
                        />
                        <path
                          d="M0,151 C45,140 62,143 101,128 S150,139 193,108 S240,111 282,96 S330,104 367,69 S410,76 456,56 S505,65 544,35 S580,38 600,21"
                          fill="none"
                          stroke="#f26f52"
                          strokeWidth="3"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      <div className="x-axis">
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="panel residents-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">People</p>
                      <h2>New residents</h2>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="More resident options"
                      type="button"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="resident-table">
                    <div className="resident-row table-head">
                      <span>Resident</span>
                      <span>Room</span>
                      <span>Status</span>
                    </div>
                    <div className="resident-row">
                      <span className="person">
                        <i className="avatar peach">AM</i>
                        <strong>
                          Ananya Mehta<small>Joined today</small>
                        </strong>
                      </span>
                      <span>A-204</span>
                      <em className="status-pill green">Checked in</em>
                    </div>
                    <div className="resident-row">
                      <span className="person">
                        <i className="avatar mint">RS</i>
                        <strong>
                          Rohan Sethi<small>Joined yesterday</small>
                        </strong>
                      </span>
                      <span>B-108</span>
                      <em className="status-pill amber">Agreement pending</em>
                    </div>
                    <div className="resident-row">
                      <span className="person">
                        <i className="avatar lilac">NS</i>
                        <strong>
                          Niharika Singh<small>Joined 20 Aug</small>
                        </strong>
                      </span>
                      <span>C-302</span>
                      <em className="status-pill green">Checked in</em>
                    </div>
                  </div>
                  <button
                    className="outline-button"
                    id="view-residents"
                    onClick={() => setActiveView('Residents')}
                    type="button"
                  >
                    View all residents <ArrowRight size={15} />
                  </button>
                </article>

                <article className="panel tasks-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Needs attention</p>
                      <h2>
                        Priority tasks <span className="task-count">3</span>
                      </h2>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => triggerToast('All tasks displayed')}
                      type="button"
                    >
                      See all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="task-list">
                    {tasks.map((task) => (
                      <button
                        className={`task ${task.completed ? 'completed' : ''}`}
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        type="button"
                      >
                        <span className={`task-check ${task.completed ? 'done' : ''}`}></span>
                        <span>
                          <strong>{task.title}</strong>
                          <small>{task.subtitle}</small>
                        </span>
                        <ChevronRight size={15} />
                      </button>
                    ))}
                  </div>
                </article>
              </section>

              <footer>
                <span>Havenly operations</span>
                <span>
                  Last synced just now <RefreshCw size={11} />
                </span>
              </footer>
            </>
          ) : (
            /* Dynamic Directory View */
            (() => {
              const data = viewData[activeView];
              if (!data) return null;
              const ActionIcon = data.icon;
              return (
                <>
                  <section className="page-heading view-heading">
                    <div>
                      <p className="eyebrow">{data.eyebrow}</p>
                      <h1 id="page-title">
                        {data.title} <span>✦</span>
                      </h1>
                      <p className="subheading">{data.copy}</p>
                    </div>
                    <div className="heading-actions">
                      <select aria-label={`Filter ${data.title}`}>
                        <option>All activity</option>
                        <option>Needs attention</option>
                        <option>Recently updated</option>
                      </select>
                      <button
                        className="primary-button view-action"
                        onClick={() => triggerToast(`${data.action} workspace opened`)}
                        type="button"
                      >
                        <ActionIcon size={15} />
                        {data.action}
                      </button>
                    </div>
                  </section>

                  <section className="stats-grid view-stats">
                    {data.metrics.map(([label, value, detail], idx) => (
                      <article className="stat-card" key={idx}>
                        <div className="stat-top">
                          <span className="stat-icon">
                            <BarChart3 size={17} />
                          </span>
                        </div>
                        <p>{label}</p>
                        <strong>{value}</strong>
                        <small>{detail}</small>
                      </article>
                    ))}
                  </section>

                  <section className="panel directory-panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">Workspace</p>
                        <h2>{data.heading}</h2>
                      </div>
                      <button
                        className="text-button view-refresh"
                        onClick={() => triggerToast(`${data.title} refreshed just now`)}
                        type="button"
                      >
                        Refresh <RefreshCw size={15} />
                      </button>
                    </div>
                    <div className="directory-table">
                      <div className="directory-row table-head">
                        <span>Item</span>
                        <span>Details</span>
                        <span>Timing</span>
                        <span>Status</span>
                      </div>
                      {data.rows.map(([item, details, timing, status], idx) => (
                        <div className="directory-row" key={idx}>
                          <strong>{item}</strong>
                          <span>{details}</span>
                          <span>{timing}</span>
                          <em
                            className={`status-pill ${
                              status.toLowerCase().includes('urgent') ||
                              status.toLowerCase().includes('overdue')
                                ? 'red'
                                : status.toLowerCase().includes('pending') ||
                                    status.toLowerCase().includes('review')
                                  ? 'amber'
                                  : 'green'
                            }`}
                          >
                            {status}
                          </em>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              );
            })()
          )}
        </div>
      </main>

      {/* Add Resident Modal */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          id="resident-modal"
          onClick={(e) => {
            if (e.target.id === 'resident-modal') setModalOpen(false);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="modal-close"
              id="modal-close"
              aria-label="Close"
              onClick={() => setModalOpen(false)}
              type="button"
            >
              <X size={15} />
            </button>
            <p className="eyebrow">Resident directory</p>
            <h2 id="modal-title">Add a resident</h2>
            <p className="modal-copy">
              Create a profile and reserve a bed in a few details.
            </p>
            <form
              id="resident-form"
              onSubmit={(e) => {
                e.preventDefault();
                setModalOpen(false);
                triggerToast('Resident added successfully');
              }}
            >
              <label>
                Full name
                <input required name="name" placeholder="e.g. Aditi Rao" />
              </label>
              <label>
                Phone number
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                />
              </label>
              <label>
                Bed preference
                <select name="bed">
                  <option>Any available bed</option>
                  <option>Room A-204</option>
                  <option>Room B-108</option>
                  <option>Room C-302</option>
                </select>
              </label>
              <button className="primary-button" type="submit">
                Create resident <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`toast ${showToast ? 'show' : ''}`} id="toast" role="status">
        {toastMessage}
      </div>
    </div>
  );
}
