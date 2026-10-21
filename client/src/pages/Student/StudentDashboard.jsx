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
  ChevronsUpDown,
  Printer,
  Calendar,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  Receipt,
  Download,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/styles.css';
import '../../styles/admin.css';

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

  // Traditional Registers State
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState({ totalBilled: 0, totalPaid: 0, balance: 0 });
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [messMenus, setMessMenus] = useState([]);

  const [complaints, setComplaints] = useState([]);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: 'Water',
    title: '',
    description: '',
    priority: 'Medium'
  });

  const [outpasses, setOutpasses] = useState([]);
  const [studentVisitors, setStudentVisitors] = useState([]);
  const [outpassTab, setOutpassTab] = useState('outpasses'); // 'outpasses' | 'visitors'
  const [showOutpassModal, setShowOutpassModal] = useState(false);
  const [outpassForm, setOutpassForm] = useState({
    destination: '',
    reason: '',
    departureTime: '',
    expectedReturnTime: ''
  });

  const [notices, setNotices] = useState([]);
  const [admissionProfile, setAdmissionProfile] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const loadStudentData = async () => {
    setLoadingData(true);
    try {
      if (activeView === 'Payments') {
        const res = await api.getLedger();
        if (res?.entries) {
          setLedgerEntries(res.entries);
          const totalPaid = res.entries.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
          const totalDue = res.entries.reduce((sum, e) => sum + (e.amountDue || 0), 0);
          const balance = res.entries.reduce((sum, e) => sum + (e.balance || 0), 0);
          setLedgerSummary({ totalBilled: totalDue, totalPaid, balance });
        }
      } else if (activeView === 'Mess & menu') {
        const res = await api.getMessMenu();
        if (res?.menus) setMessMenus(res.menus);
      } else if (activeView === 'Complaints') {
        const res = await api.getComplaints();
        if (res?.complaints) setComplaints(res.complaints);
      } else if (activeView === 'Visitors') {
        const [opRes, visRes] = await Promise.all([
          api.getOutpasses().catch(() => ({ outpasses: [] })),
          api.getVisitors().catch(() => ({ visitors: [] }))
        ]);
        if (opRes?.outpasses) setOutpasses(opRes.outpasses);
        if (visRes?.visitors) setStudentVisitors(visRes.visitors);
      } else if (activeView === 'Notice board') {
        const res = await api.getNotices();
        if (res?.notices) setNotices(res.notices);
      } else if (activeView === 'Residents') {
        const res = await api.getAdmissions();
        if (res?.admissions && res.admissions.length > 0) {
          setAdmissionProfile(res.admissions[0]);
        }
      } else if (activeView === 'Overview') {
        api.getNotices().then((res) => res?.notices && setNotices(res.notices)).catch(() => {});
        api.getMessMenu().then((res) => res?.menus && setMessMenus(res.menus)).catch(() => {});
      }
    } catch (err) {
      console.error('Error fetching student register data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [activeView]);

  const viewReceipt = async (id) => {
    try {
      const data = await api.getReceipt(id);
      setReceiptData(data);
      setShowReceiptModal(true);
    } catch {
      triggerToast('Could not load receipt');
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.createComplaint({
        ...complaintForm,
        room: user?.room || 'Unassigned'
      });
      setShowComplaintModal(false);
      setComplaintForm({ category: 'Water', title: '', description: '', priority: 'Medium' });
      triggerToast('Maintenance complaint registered');
      loadStudentData();
    } catch (err) {
      triggerToast(err.message || 'Failed to submit complaint');
    }
  };

  const handleCreateOutpass = async (e) => {
    e.preventDefault();
    try {
      await api.createOutpass({
        ...outpassForm
      });
      setShowOutpassModal(false);
      setOutpassForm({ destination: '', reason: '', departureTime: '', expectedReturnTime: '' });
      triggerToast('Outpass request submitted to warden');
      loadStudentData();
    } catch (err) {
      triggerToast(err.message || 'Failed to request outpass');
    }
  };

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
          ) : activeView === 'Payments' ? (
            /* 1. Traditional Rent & Payment Ledger */
            <div className="register-view">
              <section className="page-heading view-heading">
                <div>
                  <p className="eyebrow">Financial Ledger</p>
                  <h1 id="page-title">
                    Rent &amp; Payment Ledger <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Digitized accounting ledger of your monthly rent dues, physical cash desk vouchers, and verified bank transfers.
                  </p>
                </div>
                <div className="heading-actions no-print">
                  <button className="btn-secondary" onClick={() => window.print()} type="button">
                    <Printer size={15} /> Print Statement
                  </button>
                </div>
              </section>

              {/* Financial Summary Cards */}
              <section className="stats-grid view-stats">
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon"><IndianRupee size={17} /></span>
                  </div>
                  <p>Total Billed</p>
                  <strong>₹{ledgerSummary.totalBilled.toLocaleString('en-IN')}</strong>
                  <small>Academic year charges</small>
                </article>
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon"><Check size={17} /></span>
                  </div>
                  <p>Total Paid</p>
                  <strong>₹{ledgerSummary.totalPaid.toLocaleString('en-IN')}</strong>
                  <small>Verified &amp; cash desk entries</small>
                </article>
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-icon"><AlertTriangle size={17} /></span>
                  </div>
                  <p>Outstanding Balance</p>
                  <strong style={{ color: ledgerSummary.balance > 0 ? '#dc2626' : '#16a34a' }}>
                    ₹{ledgerSummary.balance.toLocaleString('en-IN')}
                  </strong>
                  <small>{ledgerSummary.balance > 0 ? 'Due for settlement' : 'All accounts settled'}</small>
                </article>
              </section>

              {/* Ledger Table */}
              <section className="register-card">
                <div className="register-card-header">
                  <div>
                    <h2>Fee Transactions &amp; Receipts Ledger</h2>
                    <small style={{ color: '#75848a' }}>Audited accounting records for Room {user?.room || 'N/A'}</small>
                  </div>
                  <button className="text-button no-print" onClick={loadStudentData} type="button">
                    Refresh <RefreshCw size={14} />
                  </button>
                </div>
                <div className="register-table-wrap">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Receipt No</th>
                        <th>Fee Month</th>
                        <th>Amount Due</th>
                        <th>Amount Paid</th>
                        <th>Balance</th>
                        <th>Payment Mode</th>
                        <th>Verification</th>
                        <th>Date</th>
                        <th className="no-print">Official Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#75848a' }}>
                            No payment entries found in ledger. Please contact accounts desk.
                          </td>
                        </tr>
                      ) : (
                        ledgerEntries.map((entry) => (
                          <tr key={entry._id}>
                            <td><strong>{entry.receiptNumber}</strong></td>
                            <td>{entry.forMonth}</td>
                            <td>₹{entry.amountDue.toLocaleString('en-IN')}</td>
                            <td><strong style={{ color: '#12313a' }}>₹{entry.amountPaid.toLocaleString('en-IN')}</strong></td>
                            <td>
                              {entry.balance > 0 ? (
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>₹{entry.balance.toLocaleString('en-IN')}</span>
                              ) : (
                                <span style={{ color: '#16a34a', fontWeight: 600 }}>Nil</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${entry.isCash ? 'cash' : 'bank'}`}>
                                {entry.paymentMode} {entry.transactionRef ? `(${entry.transactionRef})` : ''}
                              </span>
                            </td>
                            <td>
                              <em className={`status-pill ${entry.isVerified ? 'green' : 'amber'}`}>
                                {entry.isVerified ? 'Verified' : 'Desk Voucher'}
                              </em>
                            </td>
                            <td>{entry.paymentDate ? entry.paymentDate.slice(0, 10) : ''}</td>
                            <td className="no-print">
                              <button
                                className="btn-secondary"
                                onClick={() => viewReceipt(entry._id)}
                                type="button"
                                style={{ padding: '4px 10px', fontSize: 11 }}
                              >
                                <Receipt size={13} /> View Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Signatures for Print */}
                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Resident Signature</p>
                    <small>{user?.name || 'Resident'}</small>
                  </div>
                  <div className="signature-line">
                    <p>Cashier / Desk Clerk</p>
                    <small>Accounts Department</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Warden Seal</p>
                    <small>Arbor House PG</small>
                  </div>
                </div>
              </section>
            </div>
          ) : activeView === 'Mess & menu' ? (
            /* 2. Traditional Mess Timetable & Attendance */
            <div className="register-view">
              <section className="page-heading view-heading">
                <div>
                  <p className="eyebrow">Dining Operations</p>
                  <h1 id="page-title">
                    Weekly Mess Timetable &amp; Schedule <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Full 7-day rotating meal timetable with timing, daily specials, and dietary management.
                  </p>
                </div>
                <div className="heading-actions no-print">
                  <button className="btn-secondary" onClick={() => window.print()} type="button">
                    <Printer size={15} /> Print Timetable
                  </button>
                </div>
              </section>

              <section className="register-card">
                <div className="register-card-header">
                  <div>
                    <h2>Weekly Meal Timetable (Mon - Sun)</h2>
                    <small style={{ color: '#75848a' }}>Breakfast: 7:30 - 9:30 AM | Lunch: 12:30 - 2:30 PM | Tea: 5:00 - 6:00 PM | Dinner: 7:30 - 9:30 PM</small>
                  </div>
                </div>
                <div className="register-table-wrap">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Day of Week</th>
                        <th>Breakfast</th>
                        <th>Lunch</th>
                        <th>Evening Snacks</th>
                        <th>Dinner</th>
                        <th>Chef Special</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messMenus.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#75848a' }}>
                            Loading mess timetable...
                          </td>
                        </tr>
                      ) : (
                        messMenus.map((m) => {
                          const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                          const isToday = m.dayOfWeek === todayName;
                          return (
                            <tr key={m._id || m.dayOfWeek} style={{ background: isToday ? '#f0fdf4' : 'transparent' }}>
                              <td>
                                <strong>{m.dayOfWeek}</strong>
                                {isToday && <span className="badge verified" style={{ marginLeft: 6 }}>Today</span>}
                              </td>
                              <td>{m.breakfast || '-'}</td>
                              <td>{m.lunch || '-'}</td>
                              <td>{m.snacks || '-'}</td>
                              <td>{m.dinner || '-'}</td>
                              <td><em style={{ color: '#bd821c', fontWeight: 600 }}>{m.specialItem || '-'}</em></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '16px 20px', background: '#fafbfc', borderTop: '1px solid #e6eceb', fontSize: 12, color: '#65767a' }}>
                  <strong>Mess Policy Note:</strong> Residents requesting dietary adjustments (Jain/Gluten-Free) or meal skip notifications must register with the Mess Warden 24 hours prior.
                </div>
              </section>
            </div>
          ) : activeView === 'Complaints' ? (
            /* 3. Traditional Maintenance Register */
            <div className="register-view">
              <section className="page-heading view-heading">
                <div>
                  <p className="eyebrow">Service Desk</p>
                  <h1 id="page-title">
                    Help &amp; Maintenance Register <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Log room or facility maintenance issues, track assigned staff, and inspect completion status.
                  </p>
                </div>
                <div className="heading-actions no-print">
                  <button
                    className="primary-button"
                    onClick={() => setShowComplaintModal(true)}
                    type="button"
                  >
                    <Plus size={15} /> Log New Complaint
                  </button>
                </div>
              </section>

              <section className="register-card">
                <div className="register-card-header">
                  <div>
                    <h2>My Submitted Tickets</h2>
                    <small style={{ color: '#75848a' }}>Official complaints log for {user?.name || 'Resident'} · Room {user?.room || 'N/A'}</small>
                  </div>
                  <button className="text-button no-print" onClick={loadStudentData} type="button">
                    Refresh <RefreshCw size={14} />
                  </button>
                </div>
                <div className="register-table-wrap">
                  <table className="register-table">
                    <thead>
                      <tr>
                        <th>Ticket No</th>
                        <th>Category</th>
                        <th>Issue Summary</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned Staff</th>
                        <th>Resolution Notes</th>
                        <th>Date Filed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#75848a' }}>
                            No active maintenance complaints recorded. Everything in your room is in working order!
                          </td>
                        </tr>
                      ) : (
                        complaints.map((c) => (
                          <tr key={c._id}>
                            <td><strong>{c.complaintNumber}</strong></td>
                            <td>
                              <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                                {c.category}
                              </span>
                            </td>
                            <td>
                              <strong>{c.title}</strong>
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#75848a' }}>{c.description}</p>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  c.priority === 'Urgent'
                                    ? 'outpass-rejected'
                                    : c.priority === 'High' || c.priority === 'Medium'
                                      ? 'cash'
                                      : 'verified'
                                }`}
                              >
                                {c.priority}
                              </span>
                            </td>
                            <td>
                              <em
                                className={`status-pill ${
                                  c.status === 'Resolved' || c.status === 'Closed'
                                    ? 'green'
                                    : c.status === 'In Progress'
                                      ? 'amber'
                                      : 'red'
                                }`}
                              >
                                {c.status}
                              </em>
                            </td>
                            <td>{c.assignedStaff || 'Unassigned'}</td>
                            <td>{c.resolutionDetails || (c.status === 'Resolved' ? 'Completed' : 'Awaiting technician')}</td>
                            <td>{c.createdAt ? c.createdAt.slice(0, 10) : ''}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : activeView === 'Visitors' ? (
            /* 4. Outpass & Visitors Book */
            <div className="register-view">
              <section className="page-heading view-heading">
                <div>
                  <p className="eyebrow">Front Desk Register</p>
                  <h1 id="page-title">
                    Outpass &amp; Visitor Book <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Submit electronic hostel outpass requests, monitor warden approvals, and view guest entries.
                  </p>
                </div>
                <div className="heading-actions no-print">
                  <button
                    className="primary-button"
                    onClick={() => setShowOutpassModal(true)}
                    type="button"
                  >
                    <Plus size={15} /> Apply for Outpass
                  </button>
                </div>
              </section>

              {/* Sub-Tabs */}
              <div className="register-tabs no-print">
                <button
                  className={`register-tab ${outpassTab === 'outpasses' ? 'active' : ''}`}
                  onClick={() => setOutpassTab('outpasses')}
                  type="button"
                >
                  <Clock size={14} /> My Outpass Requests ({outpasses.length})
                </button>
                <button
                  className={`register-tab ${outpassTab === 'visitors' ? 'active' : ''}`}
                  onClick={() => setOutpassTab('visitors')}
                  type="button"
                >
                  <ScanFace size={14} /> Gate Visitor Log ({studentVisitors.length})
                </button>
              </div>

              {outpassTab === 'outpasses' ? (
                <section className="register-card">
                  <div className="register-card-header">
                    <div>
                      <h2>Hostel Outpass &amp; Night Departure Register</h2>
                      <small style={{ color: '#75848a' }}>All outings past 10:00 PM curfew require formal warden approval</small>
                    </div>
                  </div>
                  <div className="register-table-wrap">
                    <table className="register-table">
                      <thead>
                        <tr>
                          <th>Outpass No</th>
                          <th>Destination</th>
                          <th>Reason / Purpose</th>
                          <th>Departure Time</th>
                          <th>Expected Return</th>
                          <th>Actual Return</th>
                          <th>Status</th>
                          <th>Warden Approval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outpasses.length === 0 ? (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#75848a' }}>
                              No outpasses applied. Click "Apply for Outpass" to submit a departure request.
                            </td>
                          </tr>
                        ) : (
                          outpasses.map((op) => (
                            <tr key={op._id}>
                              <td><strong>{op.outpassNumber}</strong></td>
                              <td>{op.destination}</td>
                              <td>{op.reason}</td>
                              <td>{op.departureTime ? new Date(op.departureTime).toLocaleString('en-IN') : '-'}</td>
                              <td>{op.expectedReturnTime ? new Date(op.expectedReturnTime).toLocaleString('en-IN') : '-'}</td>
                              <td>{op.actualReturnTime ? new Date(op.actualReturnTime).toLocaleString('en-IN') : 'Not yet returned'}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    op.status === 'Approved'
                                      ? 'outpass-approved'
                                      : op.status === 'Rejected'
                                        ? 'outpass-rejected'
                                        : op.status === 'Overdue'
                                          ? 'outpass-overdue'
                                          : 'outpass-pending'
                                  }`}
                                >
                                  {op.status}
                                </span>
                              </td>
                              <td>{op.approvedBy || 'Pending Review'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                <section className="register-card">
                  <div className="register-card-header">
                    <div>
                      <h2>Main Gate Visitor Log</h2>
                      <small style={{ color: '#75848a' }}>Visitors logged at front security desk for {user?.name || 'Resident'}</small>
                    </div>
                  </div>
                  <div className="register-table-wrap">
                    <table className="register-table">
                      <thead>
                        <tr>
                          <th>Visitor Name</th>
                          <th>Contact Phone</th>
                          <th>Relationship</th>
                          <th>Purpose of Visit</th>
                          <th>Gate Entry Time</th>
                          <th>Gate Exit Time</th>
                          <th>Premises Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentVisitors.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#75848a' }}>
                              No gate visitors logged on record.
                            </td>
                          </tr>
                        ) : (
                          studentVisitors.map((v) => (
                            <tr key={v._id}>
                              <td><strong>{v.visitorName}</strong></td>
                              <td>{v.visitorPhone}</td>
                              <td>{v.relation || 'Guest'}</td>
                              <td>{v.purpose}</td>
                              <td>{v.entryTime ? new Date(v.entryTime).toLocaleString('en-IN') : '-'}</td>
                              <td>{v.exitTime ? new Date(v.exitTime).toLocaleString('en-IN') : '-'}</td>
                              <td>
                                <em className={`status-pill ${v.status === 'In Premises' ? 'amber' : 'green'}`}>
                                  {v.status}
                                </em>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          ) : activeView === 'Notice board' ? (
            /* 5. Digital Notice Board */
            <div className="register-view">
              <section className="page-heading view-heading">
                <div>
                  <p className="eyebrow">Hostel Circulars</p>
                  <h1 id="page-title">
                    Official Notice Board <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Administrative circulars, curfew updates, mess announcements, and maintenance advisories.
                  </p>
                </div>
                <div className="heading-actions no-print">
                  <button className="btn-secondary" onClick={() => window.print()} type="button">
                    <Printer size={15} /> Print Notice Board
                  </button>
                </div>
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                {notices.length === 0 ? (
                  <div className="register-card" style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', color: '#75848a' }}>
                    No active circulars on notice board.
                  </div>
                ) : (
                  notices.map((n) => (
                    <article
                      key={n._id}
                      className="register-card"
                      style={{
                        padding: 22,
                        borderLeft: n.isImportant ? '4px solid #f26f52' : '1px solid #e6eceb',
                        margin: 0
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                          {n.category || 'General'}
                        </span>
                        {n.isImportant && (
                          <span className="badge outpass-rejected">Important Notice</span>
                        )}
                      </div>
                      <h3 style={{ font: '600 16px "Space Grotesk", sans-serif', margin: '0 0 10px', color: '#19343c' }}>
                        {n.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#456468', lineHeight: 1.55, margin: '0 0 16px' }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#82929a', borderTop: '1px solid #f1f5f5', paddingTop: 10 }}>
                        <span>Target: {n.audience || 'All residents'}</span>
                        <span>{n.publishDate ? n.publishDate.slice(0, 10) : ''}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : activeView === 'Residents' ? (
            /* 6. Digital Admission Register */
            <div className="register-view">
              <section className="page-heading view-heading">
                <div>
                  <p className="eyebrow">Digital Admission Register</p>
                  <h1 id="page-title">
                    Resident Admission Record <span>✦</span>
                  </h1>
                  <p className="subheading">
                    Official digitized admission register entry with verification status, room allocation, and emergency contacts.
                  </p>
                </div>
                <div className="heading-actions no-print">
                  <button className="btn-secondary" onClick={() => window.print()} type="button">
                    <Printer size={15} /> Print Admission Slip
                  </button>
                </div>
              </section>

              <article className="receipt-paper">
                <div className="receipt-header">
                  <h1>Arbor House PG</h1>
                  <p>12, College Road, Student Zone, University Enclave</p>
                  <p>Ph: +91 98765 43210 | Email: hello@arborhouse.in</p>
                  <h3 style={{ margin: '14px 0 0', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 14 }}>
                    OFFICIAL STUDENT ADMISSION REGISTER SLIP
                  </h3>
                </div>

                <div className="receipt-meta" style={{ marginBottom: 20 }}>
                  <div>
                    <p><strong>Admission No:</strong> {admissionProfile?.admissionNumber || user?.admissionNumber || 'ADM-2026-001'}</p>
                    <p><strong>Resident Name:</strong> {admissionProfile?.name || user?.name || 'Resident'}</p>
                    <p><strong>Room Allocation:</strong> Room {admissionProfile?.room || user?.room || 'A-204'} (Bed {admissionProfile?.bed || user?.bed || '1'})</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p><strong>Date of Admission:</strong> {admissionProfile?.admissionDate ? admissionProfile.admissionDate.slice(0, 10) : '2026-08-01'}</p>
                    <p><strong>Document Verification:</strong> <span className={`badge ${admissionProfile?.documentStatus === 'Verified' ? 'verified' : 'pending'}`}>{admissionProfile?.documentStatus || 'Verified'}</span></p>
                    <p><strong>ID Proof:</strong> {admissionProfile?.idProofType || 'Aadhaar Card'} ({admissionProfile?.idProofNumber || 'Verified'})</p>
                  </div>
                </div>

                <table className="receipt-table" style={{ marginBottom: 24 }}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Registered Particulars</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Academic Information</strong></td>
                      <td>College: {admissionProfile?.college || 'City University'} | Course: {admissionProfile?.course || 'B.Tech CS'} | Year: {admissionProfile?.yearOfStudy || '2nd Year'}</td>
                    </tr>
                    <tr>
                      <td><strong>Contact Details</strong></td>
                      <td>Phone: {admissionProfile?.phone || user?.phone || '+91 98765 00000'} | Email: {admissionProfile?.email || user?.email}</td>
                    </tr>
                    <tr>
                      <td><strong>Guardian &amp; Emergency</strong></td>
                      <td>Guardian: {admissionProfile?.guardianName || 'Parent'} ({admissionProfile?.guardianRelation || 'Parent'}) | Phone: {admissionProfile?.guardianPhone || '+91 98111 22334'}</td>
                    </tr>
                    <tr>
                      <td><strong>Permanent Address</strong></td>
                      <td>{admissionProfile?.permanentAddress || '123, Heritage Colony, New Delhi, 110001'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="signatures">
                  <div className="signature-line">
                    <p>Student Signature</p>
                    <small>{admissionProfile?.name || user?.name}</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Warden Verification</p>
                    <small>Document Verified</small>
                  </div>
                  <div className="signature-line">
                    <p>Proprietor / Seal</p>
                    <small>Arbor House PG</small>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            /* Fallback Dynamic Directory View for Rooms, Laundry, Services, Settings */
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

      {/* Traditional Printable Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowReceiptModal(false)}>
          <div className="modal modal-wide" role="dialog" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div className="receipt-paper">
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
                <button className="btn-secondary" onClick={() => window.print()} type="button">
                  <Printer size={14} /> Print Receipt
                </button>
                <button className="btn-secondary" onClick={() => setShowReceiptModal(false)} type="button">
                  <X size={14} /> Close
                </button>
              </div>

              <div className="receipt-header">
                <h1>{receiptData.hostel?.name || 'Arbor House PG'}</h1>
                <p>{receiptData.hostel?.address || '12, College Road, Student Zone, University Enclave'}</p>
                <p>Phone: {receiptData.hostel?.phone || '+91 98765 43210'} | Email: {receiptData.hostel?.email || 'hello@arborhouse.in'}</p>
                <h3 style={{ margin: '14px 0 0', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 14 }}>
                  OFFICIAL FEE PAYMENT RECEIPT
                </h3>
              </div>

              <div className="receipt-meta">
                <div>
                  <p><strong>Receipt No:</strong> {receiptData.receipt.receiptNumber}</p>
                  <p><strong>Resident Name:</strong> {receiptData.receipt.studentName}</p>
                  <p><strong>Room Allocation:</strong> {receiptData.receipt.room}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Payment Date:</strong> {receiptData.receipt.paymentDate ? receiptData.receipt.paymentDate.slice(0, 10) : ''}</p>
                  <p><strong>Fee Month:</strong> {receiptData.receipt.forMonth}</p>
                  <p><strong>Payment Mode:</strong> {receiptData.receipt.paymentMode}</p>
                </div>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Payment Mode</th>
                    <th>Verification</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{receiptData.receipt.paymentType} ({receiptData.receipt.forMonth})</td>
                    <td>{receiptData.receipt.paymentMode} {receiptData.receipt.transactionRef && `(${receiptData.receipt.transactionRef})`}</td>
                    <td>{receiptData.receipt.isVerified ? 'Bank Verified' : 'Cash Desk Receipt'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{receiptData.receipt.amountPaid.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan={3}>Total Received</td>
                    <td style={{ textAlign: 'right' }}>₹{receiptData.receipt.amountPaid.toLocaleString('en-IN')}</td>
                  </tr>
                  {receiptData.receipt.balance > 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: '#dc2626' }}>Balance Remaining Due</td>
                      <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>₹{receiptData.receipt.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="signatures">
                <div className="signature-line">
                  <p>Resident Signature</p>
                  <small>{receiptData.receipt.studentName}</small>
                </div>
                <div className="signature-line">
                  <p>Authorized Cashier</p>
                  <small>Desk Clerk</small>
                </div>
                <div className="signature-line">
                  <p>Warden / Proprietor</p>
                  <small>Arbor House PG</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raise Maintenance Complaint Modal */}
      {showComplaintModal && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowComplaintModal(false)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setShowComplaintModal(false)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Service Desk</p>
            <h2>Raise Maintenance Complaint</h2>
            <p className="modal-copy">Submit a maintenance or repair ticket for your room or common hostel areas.</p>
            <form onSubmit={handleCreateComplaint}>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Issue Category</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  >
                    <option value="Water">Water / Plumbing</option>
                    <option value="Electricity">Electricity / Fan / Light</option>
                    <option value="Cleaning">Housekeeping / Cleaning</option>
                    <option value="Furniture">Furniture / Bed / Wardrobe</option>
                    <option value="Internet">Wi-Fi &amp; Internet</option>
                    <option value="Mess">Mess &amp; Food Quality</option>
                    <option value="Other">Other Maintenance</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Priority</label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="Urgent">Urgent (Immediate attention)</option>
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <label>Issue Title *</label>
                <input
                  required
                  placeholder="e.g. Geyser not heating water in bathroom"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #dae5e2', font: 'inherit', boxSizing: 'border-box' }}
                  placeholder="Describe the problem, when it started, and specific location..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                />
              </div>
              <button className="primary-button" type="submit" style={{ marginTop: 12 }}>
                Submit Complaint Ticket <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Outpass Modal */}
      {showOutpassModal && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowOutpassModal(false)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setShowOutpassModal(false)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Front Desk Register</p>
            <h2>Apply for Hostel Outpass</h2>
            <p className="modal-copy">Request warden permission for late evening outing, weekend leave, or campus absence.</p>
            <form onSubmit={handleCreateOutpass}>
              <div className="modal-field">
                <label>Destination *</label>
                <input
                  required
                  placeholder="e.g. Home (Jaipur), University Library, City Center"
                  value={outpassForm.destination}
                  onChange={(e) => setOutpassForm({ ...outpassForm, destination: e.target.value })}
                />
              </div>
              <div className="modal-field">
                <label>Reason / Purpose *</label>
                <input
                  required
                  placeholder="e.g. Attending family function, academic research"
                  value={outpassForm.reason}
                  onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
                />
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Departure Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={outpassForm.departureTime}
                    onChange={(e) => setOutpassForm({ ...outpassForm, departureTime: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Expected Return *</label>
                  <input
                    required
                    type="datetime-local"
                    value={outpassForm.expectedReturnTime}
                    onChange={(e) => setOutpassForm({ ...outpassForm, expectedReturnTime: e.target.value })}
                  />
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#65767a', margin: '8px 0 14px' }}>
                Note: An SMS/Notification will be logged with your registered parent/guardian phone ({user?.guardianPhone || 'on file'}).
              </p>
              <button className="primary-button" type="submit">
                Submit Outpass to Warden <ArrowRight size={14} />
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
