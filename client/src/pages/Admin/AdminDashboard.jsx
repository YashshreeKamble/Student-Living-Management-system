import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Megaphone,
  Users,
  BedDouble,
  BedSingle,
  WalletCards,
  ArrowLeft,
  Check,
  Printer,
  Download,
  Search,
  Plus,
  BookOpen,
  Receipt,
  UserCheck,
  Utensils,
  Wrench,
  Clock,
  LogOut,
  X,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { exportToCSV } from '../../utils/csvExport';
import '../../styles/admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState('overview'); // overview | admissions | ledger | visitors | mess | complaints | notices
  const [inAccountSettings, setInAccountSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global Toast
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'admit' | 'editAdmission' | 'payment' | 'receipt' | 'visitor' | 'outpass' | 'complaint' | 'notice' | 'editMenu'
  const [selectedItem, setSelectedItem] = useState(null);

  // 1. Overview data
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);

  // 2. Admissions Register state
  const [admissions, setAdmissions] = useState([]);
  const [admissionSearch, setAdmissionSearch] = useState('');
  const [admissionDocFilter, setAdmissionDocFilter] = useState('');

  // 3. Ledger state
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState({});
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('');
  const [ledgerMonthFilter, setLedgerMonthFilter] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  // 4. Visitors & Outpasses state
  const [visitorSubTab, setVisitorSubTab] = useState('visitors'); // visitors | outpasses
  const [visitors, setVisitors] = useState([]);
  const [outpasses, setOutpasses] = useState([]);
  const [visitorSearch, setVisitorSearch] = useState('');

  // 5. Mess & Meal state
  const [messMenus, setMessMenus] = useState([]);
  const [messDate, setMessDate] = useState(new Date().toISOString().slice(0, 10));
  const [messAttendance, setMessAttendance] = useState([]);
  const [messCounts, setMessCounts] = useState({});

  // 6. Complaints state
  const [complaints, setComplaints] = useState([]);
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('');
  const [complaintSearch, setComplaintSearch] = useState('');

  // 7. Notice Board state
  const [digitalNotices, setDigitalNotices] = useState([]);
  const [showArchivedNotices, setShowArchivedNotices] = useState(false);

  // Account form
  const [accountName, setAccountName] = useState(user?.name || 'Arbor Admin');
  const [accountEmail, setAccountEmail] = useState(user?.email || 'demo@admin.in');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountError, setAccountError] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  // ==========================================
  // DATA LOADERS
  // ==========================================
  const loadDashboardData = useCallback(async () => {
    try {
      const data = await api.getAdminDashboard();
      setStudents(data.students || []);
      setRooms(data.rooms || []);
      setPayments(data.payments || []);
      setNotices(data.notices || []);
    } catch {
      triggerToast('Admin data could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdmissions = useCallback(async () => {
    try {
      const params = {};
      if (admissionSearch) params.search = admissionSearch;
      if (admissionDocFilter) params.documentStatus = admissionDocFilter;
      const res = await api.getAdmissions(params);
      setAdmissions(res.admissions || []);
    } catch {
      triggerToast('Failed to load admission register');
    }
  }, [admissionSearch, admissionDocFilter]);

  const loadLedger = useCallback(async () => {
    try {
      const params = {};
      if (ledgerSearch) params.search = ledgerSearch;
      if (ledgerStatusFilter) params.status = ledgerStatusFilter;
      if (ledgerMonthFilter) params.month = ledgerMonthFilter;
      const res = await api.getLedger(params);
      setLedgerEntries(res.entries || []);
      setLedgerSummary(res.summary || {});
    } catch {
      triggerToast('Failed to load payment ledger');
    }
  }, [ledgerSearch, ledgerStatusFilter, ledgerMonthFilter]);

  const loadVisitorsAndOutpasses = useCallback(async () => {
    try {
      const [vRes, oRes] = await Promise.all([
        api.getVisitors({ search: visitorSearch }),
        api.getOutpasses()
      ]);
      setVisitors(vRes.visitors || []);
      setOutpasses(oRes.outpasses || []);
    } catch {
      triggerToast('Failed to load visitors and outpass logs');
    }
  }, [visitorSearch]);

  const loadMessData = useCallback(async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        api.getMessMenu(),
        api.getMessAttendance(messDate)
      ]);
      setMessMenus(mRes.menus || []);
      setMessAttendance(aRes.attendance || []);
      setMessCounts(aRes.counts || {});
    } catch {
      triggerToast('Failed to load mess records');
    }
  }, [messDate]);

  const loadComplaints = useCallback(async () => {
    try {
      const params = {};
      if (complaintCategoryFilter) params.category = complaintCategoryFilter;
      if (complaintStatusFilter) params.status = complaintStatusFilter;
      if (complaintSearch) params.search = complaintSearch;
      const res = await api.getComplaints(params);
      setComplaints(res.complaints || []);
    } catch {
      triggerToast('Failed to load complaint register');
    }
  }, [complaintCategoryFilter, complaintStatusFilter, complaintSearch]);

  const loadDigitalNotices = useCallback(async () => {
    try {
      const res = await api.getNotices({ showArchived: showArchivedNotices });
      setDigitalNotices(res.notices || []);
    } catch {
      triggerToast('Failed to load notice board');
    }
  }, [showArchivedNotices]);

  useEffect(() => {
    if (user) {
      setAccountName(user.name);
      setAccountEmail(user.email);
    }
    loadDashboardData();
  }, [user, loadDashboardData]);

  // Load relevant tab data when switching
  useEffect(() => {
    if (activeTab === 'admissions') loadAdmissions();
    else if (activeTab === 'ledger') loadLedger();
    else if (activeTab === 'visitors') loadVisitorsAndOutpasses();
    else if (activeTab === 'mess') loadMessData();
    else if (activeTab === 'complaints') loadComplaints();
    else if (activeTab === 'notices') loadDigitalNotices();
  }, [
    activeTab,
    loadAdmissions,
    loadLedger,
    loadVisitorsAndOutpasses,
    loadMessData,
    loadComplaints,
    loadDigitalNotices
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const statusClass = (status) => {
    if (!status) return 'green';
    const s = status.toLowerCase();
    if (s.includes('overdue') || s.includes('maintenance') || s.includes('rejected')) return 'red';
    if (s.includes('pending') || s.includes('full') || s.includes('partially') || s.includes('assigned'))
      return 'amber';
    return 'green';
  };

  const adminInitials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleApproveStudent = async (studentId) => {
    const room = window.prompt('Enter room number (e.g. A-204):');
    if (!room?.trim()) return;
    const bed = window.prompt('Enter bed number (e.g. Bed 1):');
    if (!bed?.trim()) return;

    try {
      await api.approveStudent(studentId, room.trim(), bed.trim());
      triggerToast('Student approved and bed allocated');
      loadDashboardData();
      if (activeTab === 'admissions') loadAdmissions();
    } catch (err) {
      triggerToast(err.message || 'Student approval failed');
    }
  };

  const handleViewReceipt = async (ledgerId) => {
    try {
      const data = await api.getReceipt(ledgerId);
      setReceiptData(data);
      setActiveModal('receipt');
    } catch {
      triggerToast('Receipt could not be retrieved');
    }
  };

  const handleMarkVisitorExit = async (id) => {
    try {
      await api.markVisitorExit(id);
      triggerToast('Visitor departure marked');
      loadVisitorsAndOutpasses();
    } catch {
      triggerToast('Action failed');
    }
  };

  const handleOutpassAction = async (id, action) => {
    let remarks = '';
    if (action === 'reject') {
      remarks = window.prompt('Reason for rejection:') || 'Not permitted';
    }
    try {
      await api.updateOutpassStatus(id, action, remarks);
      triggerToast(`Outpass ${action}ed`);
      loadVisitorsAndOutpasses();
    } catch {
      triggerToast('Outpass action failed');
    }
  };

  const handleToggleAttendance = async (studentId, meal, currentVal) => {
    try {
      await api.markMessAttendance(studentId, messDate, meal, !currentVal);
      loadMessData();
    } catch {
      triggerToast('Failed to update meal attendance');
    }
  };

  const handleToggleArchiveNotice = async (id) => {
    try {
      const res = await api.toggleArchiveNotice(id);
      triggerToast(res.message);
      loadDigitalNotices();
    } catch {
      triggerToast('Notice update failed');
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountError('');

    if (accountPassword) {
      if (
        accountPassword.length < 8 ||
        !/[A-Z]/.test(accountPassword) ||
        !/[^A-Za-z0-9]/.test(accountPassword)
      ) {
        setAccountError(
          'Password must be 8+ characters with one uppercase letter and one special symbol.'
        );
        return;
      }
    }

    try {
      await api.updateAdminAccount(accountName, accountEmail, accountPassword);
      triggerToast('Admin account updated. Please sign in again.');
      await logout();
      navigate('/');
    } catch (err) {
      setAccountError(err.message || 'Account update failed.');
    }
  };

  return (
    <div className="admin-page">
      {/* Official Print Header */}
      <div className="print-only print-hostel-header">
        <h1>ARBOR HOUSE PG — OFFICIAL REGISTER REPORT</h1>
        <p>12, College Road, Student Zone, University Enclave · Tel: +91 98765 43210</p>
        <p>
          Register: <strong>{activeTab.toUpperCase()}</strong> | Generated on:{' '}
          {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })} at{' '}
          {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Top Navigation */}
      <header className="admin-topbar no-print">
        <a className="admin-brand" href="/admin">
          <span className="admin-brand-mark">A</span>Arbor House
          <small>ADMIN</small>
        </a>
        <div className="admin-top-actions">
          <div className="admin-user">
            <span className="admin-avatar" id="admin-avatar">
              {adminInitials}
            </span>
            <span>
              <strong id="admin-name">{user?.name || 'Admin'}</strong>
              <small>Property administrator</small>
            </span>
          </div>
          <button
            className="admin-account"
            id="account-settings"
            onClick={() => setInAccountSettings(!inAccountSettings)}
            type="button"
          >
            {inAccountSettings ? 'Registers' : 'Account settings'}
          </button>
          <button className="admin-logout" id="logout" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </header>

      <main className="admin-content">
        {inAccountSettings ? (
          /* Account Settings View */
          <div>
            <button
              className="back-dashboard"
              id="back-dashboard"
              onClick={() => setInAccountSettings(false)}
              type="button"
            >
              <ArrowLeft size={15} /> Back to registers
            </button>
            <div className="account-dashboard">
              <p className="eyebrow">Admin account</p>
              <h2>Account settings</h2>
              <p
                className="account-copy"
                id="account-copy"
                style={{ color: accountError ? '#d9583d' : undefined }}
              >
                {accountError || 'Update your admin name, email, or password.'}
              </p>
              <form className="account-form" id="account-form" onSubmit={handleAccountSubmit}>
                <label htmlFor="account-name">Name</label>
                <input
                  id="account-name"
                  name="account-name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
                <label htmlFor="account-email">Email</label>
                <input
                  id="account-email"
                  name="account-email"
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  required
                />
                <label htmlFor="account-password">New password</label>
                <input
                  id="account-password"
                  name="account-password"
                  type="password"
                  minLength={8}
                  placeholder="Leave blank to keep current password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                />
                <small className="password-rule">
                  Minimum 8 characters · 1 uppercase letter · 1 special symbol
                </small>
                <button className="primary-button" type="submit">
                  Save changes <Check size={15} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Register System */
          <>
            {/* Register Sub-Navigation Tabs */}
            <nav className="register-tabs no-print" aria-label="Traditional Hostel Registers">
              <button
                className={`register-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                <FileText size={15} /> Property Overview
              </button>
              <button
                className={`register-tab ${activeTab === 'admissions' ? 'active' : ''}`}
                onClick={() => setActiveTab('admissions')}
                type="button"
              >
                <BookOpen size={15} /> Student Admission Register
              </button>
              <button
                className={`register-tab ${activeTab === 'ledger' ? 'active' : ''}`}
                onClick={() => setActiveTab('ledger')}
                type="button"
              >
                <Receipt size={15} /> Rent &amp; Payment Ledger
              </button>
              <button
                className={`register-tab ${activeTab === 'visitors' ? 'active' : ''}`}
                onClick={() => setActiveTab('visitors')}
                type="button"
              >
                <UserCheck size={15} /> Visitor &amp; Outpass Book
              </button>
              <button
                className={`register-tab ${activeTab === 'mess' ? 'active' : ''}`}
                onClick={() => setActiveTab('mess')}
                type="button"
              >
                <Utensils size={15} /> Mess &amp; Meal Register
              </button>
              <button
                className={`register-tab ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
                type="button"
              >
                <Wrench size={15} /> Maintenance Register
              </button>
              <button
                className={`register-tab ${activeTab === 'notices' ? 'active' : ''}`}
                onClick={() => setActiveTab('notices')}
                type="button"
              >
                <Megaphone size={15} /> Circulars &amp; Notice Board
              </button>
            </nav>

            {/* TAB 1: ORIGINAL PROPERTY OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                <section className="admin-heading no-print">
                  <div>
                    <p className="eyebrow">Admin workspace</p>
                    <h1>Property overview</h1>
                    <p>Manage residents, rooms, payments, and notices from one place.</p>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="outline-button"
                      id="refresh"
                      onClick={() => {
                        loadDashboardData();
                        triggerToast('Admin data refreshed');
                      }}
                      type="button"
                    >
                      <RefreshCw size={15} /> Refresh
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setActiveTab('notices');
                        setActiveModal('notice');
                      }}
                      type="button"
                    >
                      <Megaphone size={15} /> Publish notice
                    </button>
                  </div>
                </section>

                <section className="admin-stats no-print">
                  <article className="admin-stat">
                    <Users size={22} />
                    <span>
                      <small>Total students</small>
                      <strong id="student-count">{students.length}</strong>
                    </span>
                  </article>
                  <article className="admin-stat">
                    <BedDouble size={22} />
                    <span>
                      <small>Occupied beds</small>
                      <strong>
                        164 <em>/ 184</em>
                      </strong>
                    </span>
                  </article>
                  <article className="admin-stat">
                    <BedSingle size={22} />
                    <span>
                      <small>Vacant beds</small>
                      <strong>14</strong>
                    </span>
                  </article>
                  <article className="admin-stat">
                    <WalletCards size={22} />
                    <span>
                      <small>Pending payments</small>
                      <strong>₹1.16L</strong>
                    </span>
                  </article>
                </section>

                <section className="admin-grid">
                  <article className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <p className="eyebrow">Room inventory</p>
                        <h2>Rooms &amp; bed vacancy</h2>
                      </div>
                    </div>
                    <div className="admin-table" id="room-table">
                      <div className="admin-row admin-head">
                        <span>Room</span>
                        <span>Students</span>
                        <span>Beds</span>
                        <span>Availability</span>
                      </div>
                      {rooms.map((room, idx) => (
                        <div className="admin-row" key={idx}>
                          <strong>{room.room}</strong>
                          <span>{room.students}</span>
                          <span>{room.beds}</span>
                          <em className={`status-pill ${statusClass(room.vacancy)}`}>
                            {room.vacancy}
                          </em>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <p className="eyebrow">Communication</p>
                        <h2>Recent notices</h2>
                      </div>
                    </div>
                    <div id="notice-list">
                      {notices.map((notice, idx) => (
                        <div className="notice-item" key={idx}>
                          <Megaphone size={16} />
                          <span>
                            <strong>{notice.title}</strong>
                            <small>
                              {notice.audience || 'All residents'} ·{' '}
                              {notice.date || notice.created_at || 'Recently'}
                            </small>
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="admin-panel wide">
                    <div className="admin-panel-heading">
                      <div>
                        <p className="eyebrow">Student directory</p>
                        <h2>All student information</h2>
                      </div>
                    </div>
                    <div className="student-table-scroll">
                      <table className="student-directory">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Email</th>
                            <th>Room</th>
                            <th>Bed</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student.id || student._id}>
                              <td className="student-name">{student.name}</td>
                              <td>{student.email}</td>
                              <td>{student.room || 'Not assigned'}</td>
                              <td>{student.bed || 'Bed pending'}</td>
                              <td>
                                <em
                                  className={`status-pill ${
                                    student.status === 'approved' ? 'green' : 'amber'
                                  }`}
                                >
                                  {student.status === 'approved' ? 'Approved' : 'Pending'}
                                  {student.status !== 'approved' && (
                                    <button
                                      className="approve-student"
                                      onClick={() => handleApproveStudent(student.id || student._id)}
                                      type="button"
                                    >
                                      Approve
                                    </button>
                                  )}
                                </em>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="admin-panel wide">
                    <div className="admin-panel-heading">
                      <div>
                        <p className="eyebrow">Finance</p>
                        <h2>Recent transactions</h2>
                      </div>
                      <strong className="admin-total">Collected this month: ₹8.42L</strong>
                    </div>
                    <div className="admin-table" id="payment-table">
                      <div className="admin-row admin-head">
                        <span>Student</span>
                        <span>Amount</span>
                        <span>Date</span>
                        <span>Status</span>
                      </div>
                      {payments.map((payment, idx) => (
                        <div className="admin-row" key={idx}>
                          <strong>{payment.student}</strong>
                          <span>{payment.amount}</span>
                          <span>{payment.date}</span>
                          <em className={`status-pill ${statusClass(payment.status)}`}>
                            {payment.status}
                          </em>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>
              </>
            )}

            {/* TAB 2: TRADITIONAL ADMISSION REGISTER (FEATURE 1) */}
            {activeTab === 'admissions' && (
              <div className="register-view">
                <div className="register-toolbar no-print">
                  <div className="register-toolbar-left">
                    <div className="register-search">
                      <Search size={15} />
                      <input
                        placeholder="Search student, admission no, room, college..."
                        value={admissionSearch}
                        onChange={(e) => setAdmissionSearch(e.target.value)}
                      />
                    </div>
                    <div className="register-filter">
                      <select
                        value={admissionDocFilter}
                        onChange={(e) => setAdmissionDocFilter(e.target.value)}
                      >
                        <option value="">All Document Statuses</option>
                        <option value="Verified">Verified Documents</option>
                        <option value="Pending">Pending Verification</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="register-toolbar-right">
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <Printer size={14} /> Print Register
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        exportToCSV(
                          'Student_Admission_Register',
                          [
                            'Admission No',
                            'Student Name',
                            'Email',
                            'Phone',
                            'Room',
                            'Bed',
                            'Guardian',
                            'Guardian Phone',
                            'College',
                            'Course',
                            'Documents',
                            'Admission Date'
                          ],
                          admissions.map((a) => [
                            a.admissionNumber || 'N/A',
                            a.name,
                            a.email,
                            a.phone,
                            a.room || 'Unassigned',
                            a.bed || 'Pending',
                            a.guardianName,
                            a.guardianPhone,
                            a.college,
                            a.course,
                            a.documentStatus,
                            a.admissionDate ? a.admissionDate.slice(0, 10) : ''
                          ])
                        )
                      }
                      type="button"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => setActiveModal('admit')}
                      type="button"
                    >
                      <Plus size={14} /> Admit New Resident
                    </button>
                  </div>
                </div>

                <div className="register-card">
                  <div className="register-card-header no-print">
                    <h2>Physical Admission Book ({admissions.length} Registered Residents)</h2>
                    <small style={{ color: '#75848a' }}>Official legal student enrollment records</small>
                  </div>
                  <div className="student-table-scroll">
                    <table className="student-directory">
                      <thead>
                        <tr>
                          <th>Adm. No</th>
                          <th>Student Name</th>
                          <th>Contact</th>
                          <th>Room &amp; Bed</th>
                          <th>Guardian Details</th>
                          <th>College / Course</th>
                          <th>Docs Status</th>
                          <th>Adm. Date</th>
                          <th className="no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admissions.map((adm) => (
                          <tr key={adm._id}>
                            <td>
                              <strong>{adm.admissionNumber || 'PENDING'}</strong>
                            </td>
                            <td>
                              <span className="student-name">{adm.name}</span>
                              <br />
                              <small style={{ color: '#82929a' }}>{adm.email}</small>
                            </td>
                            <td>{adm.phone || 'Not recorded'}</td>
                            <td>
                              <strong>{adm.room || 'Unassigned'}</strong>{' '}
                              <small>({adm.bed || 'No bed'})</small>
                            </td>
                            <td>
                              <strong>{adm.guardianName || 'Guardian'}</strong>
                              <br />
                              <small>{adm.guardianPhone} ({adm.guardianRelation || 'Parent'})</small>
                            </td>
                            <td>
                              {adm.college || 'College N/A'}
                              <br />
                              <small style={{ color: '#82929a' }}>{adm.course || 'Course N/A'}</small>
                            </td>
                            <td>
                              <em className={`status-pill ${statusClass(adm.documentStatus)}`}>
                                {adm.documentStatus || 'Pending'}
                              </em>
                            </td>
                            <td>{adm.admissionDate ? adm.admissionDate.slice(0, 10) : 'Recent'}</td>
                            <td className="no-print">
                              <button
                                className="approve-student"
                                onClick={() => {
                                  setSelectedItem(adm);
                                  setActiveModal('editAdmission');
                                }}
                                type="button"
                              >
                                Edit / Verify
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Print Verification Signatures */}
                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Prepared by Caretaker</p>
                    <small>Name &amp; Date</small>
                  </div>
                  <div className="signature-line">
                    <p>Verified by Hostel Warden</p>
                    <small>Official Signature</small>
                  </div>
                  <div className="signature-line">
                    <p>Approved by Proprietor</p>
                    <small>Arbor House PG</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RENT & PAYMENT LEDGER (FEATURE 2) */}
            {activeTab === 'ledger' && (
              <div className="register-view">
                <div className="register-toolbar no-print">
                  <div className="register-toolbar-left">
                    <div className="register-search">
                      <Search size={15} />
                      <input
                        placeholder="Search student, receipt number, room, reference..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                      />
                    </div>
                    <div className="register-filter">
                      <select
                        value={ledgerStatusFilter}
                        onChange={(e) => setLedgerStatusFilter(e.target.value)}
                      >
                        <option value="">All Payment Statuses</option>
                        <option value="Paid">Fully Paid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Outstanding">Outstanding Due</option>
                      </select>
                    </div>
                    <div className="register-filter">
                      <input
                        type="month"
                        value={ledgerMonthFilter}
                        onChange={(e) => setLedgerMonthFilter(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="register-toolbar-right">
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <Printer size={14} /> Print Ledger
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        exportToCSV(
                          'Rent_Payment_Ledger',
                          [
                            'Receipt No',
                            'Student Name',
                            'Room',
                            'Type',
                            'Month',
                            'Due',
                            'Paid',
                            'Balance',
                            'Payment Mode',
                            'Ref',
                            'Status',
                            'Date'
                          ],
                          ledgerEntries.map((l) => [
                            l.receiptNumber,
                            l.studentName,
                            l.room,
                            l.paymentType,
                            l.forMonth,
                            l.amountDue,
                            l.amountPaid,
                            l.balance,
                            l.paymentMode,
                            l.transactionRef || (l.isCash ? 'Cash Desk' : ''),
                            l.paymentStatus,
                            l.paymentDate ? l.paymentDate.slice(0, 10) : ''
                          ])
                        )
                      }
                      type="button"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => setActiveModal('payment')}
                      type="button"
                    >
                      <Plus size={14} /> Record Payment
                    </button>
                  </div>
                </div>

                {/* Ledger Financial Summary */}
                <section className="admin-stats no-print">
                  <article className="admin-stat">
                    <WalletCards size={22} />
                    <span>
                      <small>Total Collected</small>
                      <strong>₹{(ledgerSummary.totalCollected || 0).toLocaleString('en-IN')}</strong>
                    </span>
                  </article>
                  <article className="admin-stat">
                    <AlertTriangle size={22} style={{ color: '#d9583d' }} />
                    <span>
                      <small>Outstanding Balances</small>
                      <strong style={{ color: '#d9583d' }}>
                        ₹{(ledgerSummary.totalOutstanding || 0).toLocaleString('en-IN')}
                      </strong>
                    </span>
                  </article>
                  <article className="admin-stat">
                    <Receipt size={22} style={{ color: '#bd821c' }} />
                    <span>
                      <small>Manual Cash (Desk)</small>
                      <strong style={{ color: '#bd821c' }}>
                        ₹{(ledgerSummary.totalCash || 0).toLocaleString('en-IN')}
                      </strong>
                    </span>
                  </article>
                  <article className="admin-stat">
                    <Check size={22} style={{ color: '#1c9b8b' }} />
                    <span>
                      <small>Bank / UPI Verified</small>
                      <strong style={{ color: '#1c9b8b' }}>
                        ₹{(ledgerSummary.totalBank || 0).toLocaleString('en-IN')}
                      </strong>
                    </span>
                  </article>
                </section>

                <div className="register-card">
                  <div className="register-card-header no-print">
                    <h2>Traditional Rent &amp; Fees Ledger ({ledgerEntries.length} Transactions)</h2>
                    <small style={{ color: '#75848a' }}>Audited accounting records with physical verification</small>
                  </div>
                  <div className="student-table-scroll">
                    <table className="student-directory">
                      <thead>
                        <tr>
                          <th>Receipt #</th>
                          <th>Date</th>
                          <th>Resident</th>
                          <th>Room</th>
                          <th>Fee Type</th>
                          <th>Month</th>
                          <th>Due</th>
                          <th>Paid</th>
                          <th>Balance</th>
                          <th>Mode &amp; Audit</th>
                          <th>Status</th>
                          <th className="no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerEntries.map((entry) => (
                          <tr key={entry._id}>
                            <td>
                              <strong>{entry.receiptNumber}</strong>
                            </td>
                            <td>{entry.paymentDate ? entry.paymentDate.slice(0, 10) : ''}</td>
                            <td className="student-name">{entry.studentName}</td>
                            <td>{entry.room}</td>
                            <td>{entry.paymentType}</td>
                            <td>{entry.forMonth}</td>
                            <td>₹{entry.amountDue}</td>
                            <td style={{ color: '#1c9b8b', fontWeight: 700 }}>₹{entry.amountPaid}</td>
                            <td style={{ color: entry.balance > 0 ? '#d9583d' : '#19343c', fontWeight: 700 }}>
                              ₹{entry.balance}
                            </td>
                            <td>
                              <span className={`badge ${entry.isCash ? 'cash' : 'bank'}`}>
                                {entry.paymentMode}
                              </span>
                              {entry.isCash ? (
                                <small style={{ display: 'block', color: '#bd821c' }}>Desk Cash (Manual)</small>
                              ) : (
                                <small style={{ display: 'block', color: '#1c9b8b' }}>
                                  Ref: {entry.transactionRef || 'Verified'}
                                </small>
                              )}
                            </td>
                            <td>
                              <em className={`status-pill ${statusClass(entry.paymentStatus)}`}>
                                {entry.paymentStatus}
                              </em>
                            </td>
                            <td className="no-print">
                              <button
                                className="btn-secondary"
                                onClick={() => handleViewReceipt(entry._id)}
                                type="button"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Accountant</p>
                    <small>Signature &amp; Stamp</small>
                  </div>
                  <div className="signature-line">
                    <p>Warden</p>
                    <small>Verified Ledger</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Proprietor</p>
                    <small>Authorized Signatory</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VISITOR & OUTPASS REGISTER (FEATURE 3) */}
            {activeTab === 'visitors' && (
              <div className="register-view">
                <div className="register-toolbar no-print">
                  <div className="register-toolbar-left">
                    <button
                      className={`btn-secondary ${visitorSubTab === 'visitors' ? 'active' : ''}`}
                      style={{
                        background: visitorSubTab === 'visitors' ? '#12313a' : '#fff',
                        color: visitorSubTab === 'visitors' ? '#fff' : '#19343c'
                      }}
                      onClick={() => setVisitorSubTab('visitors')}
                      type="button"
                    >
                      <UserCheck size={14} /> Visitor Log Book ({visitors.length})
                    </button>
                    <button
                      className={`btn-secondary ${visitorSubTab === 'outpasses' ? 'active' : ''}`}
                      style={{
                        background: visitorSubTab === 'outpasses' ? '#12313a' : '#fff',
                        color: visitorSubTab === 'outpasses' ? '#fff' : '#19343c'
                      }}
                      onClick={() => setVisitorSubTab('outpasses')}
                      type="button"
                    >
                      <Clock size={14} /> Student Outpass Register ({outpasses.length})
                    </button>
                    <div className="register-search" style={{ marginLeft: 10 }}>
                      <Search size={15} />
                      <input
                        placeholder="Search visitors, residents, rooms..."
                        value={visitorSearch}
                        onChange={(e) => setVisitorSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="register-toolbar-right">
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <Printer size={14} /> Print Register
                    </button>
                    {visitorSubTab === 'visitors' ? (
                      <button
                        className="primary-button"
                        onClick={() => setActiveModal('visitor')}
                        type="button"
                      >
                        <Plus size={14} /> Log Visitor Entry
                      </button>
                    ) : (
                      <button
                        className="primary-button"
                        onClick={() => setActiveModal('outpass')}
                        type="button"
                      >
                        <Plus size={14} /> Issue Outpass
                      </button>
                    )}
                  </div>
                </div>

                {visitorSubTab === 'visitors' ? (
                  /* Visitor Log Table */
                  <div className="register-card">
                    <div className="register-card-header no-print">
                      <h2>Main Gate Visitor Entry Book</h2>
                      <small style={{ color: '#75848a' }}>Physical guest sign-in ledger</small>
                    </div>
                    <div className="student-table-scroll">
                      <table className="student-directory">
                        <thead>
                          <tr>
                            <th>Entry Time</th>
                            <th>Visitor Name</th>
                            <th>Phone</th>
                            <th>Resident Visited</th>
                            <th>Room</th>
                            <th>Relation / Purpose</th>
                            <th>ID Verification</th>
                            <th>Exit Time</th>
                            <th>Status</th>
                            <th className="no-print">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitors.map((v) => (
                            <tr key={v._id}>
                              <td>{new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(v.entryTime).toLocaleDateString()})</td>
                              <td className="student-name">{v.visitorName}</td>
                              <td>{v.visitorPhone}</td>
                              <td>{v.studentName}</td>
                              <td>{v.studentRoom}</td>
                              <td>
                                {v.relation} — <small>{v.purpose}</small>
                              </td>
                              <td>
                                <span className="badge verified">{v.idProof}</span>
                              </td>
                              <td>
                                {v.exitTime
                                  ? new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : '—'}
                              </td>
                              <td>
                                <em className={`status-pill ${v.status === 'In Premises' ? 'amber' : 'green'}`}>
                                  {v.status}
                                </em>
                              </td>
                              <td className="no-print">
                                {v.status === 'In Premises' && (
                                  <button
                                    className="approve-student"
                                    onClick={() => handleMarkVisitorExit(v._id)}
                                    type="button"
                                  >
                                    Log Exit
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Student Outpass Table */
                  <div className="register-card">
                    <div className="register-card-header no-print">
                      <h2>Resident Outpass &amp; Night-Out Register</h2>
                      <small style={{ color: '#75848a' }}>Warden approval &amp; late return monitoring</small>
                    </div>
                    <div className="student-table-scroll">
                      <table className="student-directory">
                        <thead>
                          <tr>
                            <th>Outpass #</th>
                            <th>Resident</th>
                            <th>Room</th>
                            <th>Destination</th>
                            <th>Reason</th>
                            <th>Departure</th>
                            <th>Expected Return</th>
                            <th>Actual Return</th>
                            <th>Warden Approval</th>
                            <th>Status</th>
                            <th className="no-print">Warden Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outpasses.map((op) => (
                            <tr key={op._id}>
                              <td>
                                <strong>{op.outpassNumber}</strong>
                              </td>
                              <td className="student-name">{op.studentName}</td>
                              <td>{op.room}</td>
                              <td>{op.destination}</td>
                              <td>{op.reason}</td>
                              <td>{new Date(op.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(op.departureTime).toLocaleDateString()})</td>
                              <td>{new Date(op.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(op.expectedReturnTime).toLocaleDateString()})</td>
                              <td>
                                {op.actualReturnTime
                                  ? `${new Date(op.actualReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${new Date(op.actualReturnTime).toLocaleDateString()})`
                                  : '—'}
                              </td>
                              <td>{op.approvedBy}</td>
                              <td>
                                <em className={`status-pill ${statusClass(op.status)}`}>
                                  {op.status}
                                </em>
                              </td>
                              <td className="no-print">
                                {op.status === 'Pending' && (
                                  <>
                                    <button
                                      className="approve-student"
                                      onClick={() => handleOutpassAction(op._id, 'approve')}
                                      type="button"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      onClick={() => handleOutpassAction(op._id, 'reject')}
                                      type="button"
                                      style={{ marginLeft: 6, color: '#d9583d' }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {(op.status === 'Approved' || op.status === 'Overdue') && !op.actualReturnTime && (
                                  <button
                                    className="approve-student"
                                    onClick={() => handleOutpassAction(op._id, 'return')}
                                    type="button"
                                  >
                                    Mark Returned
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Security Guard</p>
                    <small>Gate Sign-off</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Warden</p>
                    <small>Outpass Approver</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Authority</p>
                    <small>Monthly Audit</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MESS & MEAL REGISTER (FEATURE 4) */}
            {activeTab === 'mess' && (
              <div className="register-view">
                <div className="register-toolbar no-print">
                  <div className="register-toolbar-left">
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#51676a' }}>Attendance Date:</label>
                    <input
                      type="date"
                      value={messDate}
                      onChange={(e) => setMessDate(e.target.value)}
                      style={{ padding: '7px 10px', border: '1px solid #e6eceb', borderRadius: 6 }}
                    />
                    <span style={{ fontSize: 12, color: '#82929a', marginLeft: 10 }}>
                      Breakfast: <strong>{messCounts.breakfastCount || 0}</strong> | Lunch:{' '}
                      <strong>{messCounts.lunchCount || 0}</strong> | Dinner:{' '}
                      <strong>{messCounts.dinnerCount || 0}</strong>
                    </span>
                  </div>
                  <div className="register-toolbar-right">
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <Printer size={14} /> Print Daily Sheet
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        exportToCSV(
                          `Mess_Attendance_${messDate}`,
                          ['Date', 'Student Name', 'Room', 'Breakfast', 'Lunch', 'Dinner', 'Diet'],
                          messAttendance.map((m) => [
                            m.date,
                            m.studentName,
                            m.room,
                            m.breakfast ? 'Present' : 'Absent',
                            m.lunch ? 'Present' : 'Absent',
                            m.dinner ? 'Present' : 'Absent',
                            m.specialDiet
                          ])
                        )
                      }
                      type="button"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Weekly Dining Menu */}
                <div className="register-card no-print">
                  <div className="register-card-header">
                    <h2>Weekly Mess Menu Timetable</h2>
                    <small style={{ color: '#75848a' }}>Standard 7-day Indian hostel dining schedule</small>
                  </div>
                  <div className="student-table-scroll">
                    <table className="student-directory">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Breakfast (7:30 - 9:30 AM)</th>
                          <th>Lunch (12:30 - 2:30 PM)</th>
                          <th>Snacks (5:00 - 6:00 PM)</th>
                          <th>Dinner (7:30 - 9:30 PM)</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messMenus.map((menu) => (
                          <tr key={menu.dayOfWeek}>
                            <td>
                              <strong>{menu.dayOfWeek}</strong>
                            </td>
                            <td>{menu.breakfast}</td>
                            <td>{menu.lunch}</td>
                            <td>{menu.snacks}</td>
                            <td>{menu.dinner}</td>
                            <td>
                              <button
                                className="approve-student"
                                onClick={() => {
                                  setSelectedItem(menu);
                                  setActiveModal('editMenu');
                                }}
                                type="button"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Daily Meal Attendance Register */}
                <div className="register-card">
                  <div className="register-card-header">
                    <h2>Daily Resident Meal Attendance Register ({messDate})</h2>
                    <small style={{ color: '#75848a' }}>Click checkboxes to mark presence/absence</small>
                  </div>
                  <div className="student-table-scroll">
                    <table className="student-directory">
                      <thead>
                        <tr>
                          <th>Resident</th>
                          <th>Room</th>
                          <th>Diet Preference</th>
                          <th>Breakfast</th>
                          <th>Lunch</th>
                          <th>Dinner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messAttendance.map((rec) => (
                          <tr key={rec.studentId}>
                            <td className="student-name">{rec.studentName}</td>
                            <td>{rec.room}</td>
                            <td>{rec.specialDiet}</td>
                            <td>
                              <label style={{ cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={rec.breakfast}
                                  onChange={() => handleToggleAttendance(rec.studentId, 'breakfast', rec.breakfast)}
                                />{' '}
                                {rec.breakfast ? 'Present' : 'Absent'}
                              </label>
                            </td>
                            <td>
                              <label style={{ cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={rec.lunch}
                                  onChange={() => handleToggleAttendance(rec.studentId, 'lunch', rec.lunch)}
                                />{' '}
                                {rec.lunch ? 'Present' : 'Absent'}
                              </label>
                            </td>
                            <td>
                              <label style={{ cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={rec.dinner}
                                  onChange={() => handleToggleAttendance(rec.studentId, 'dinner', rec.dinner)}
                                />{' '}
                                {rec.dinner ? 'Present' : 'Absent'}
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Head Cook / Chef</p>
                    <small>Meal Prepared</small>
                  </div>
                  <div className="signature-line">
                    <p>Mess Supervisor</p>
                    <small>Attendance Count Verified</small>
                  </div>
                  <div className="signature-line">
                    <p>Warden</p>
                    <small>Hostel Inspection</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: COMPLAINT & MAINTENANCE REGISTER (FEATURE 5) */}
            {activeTab === 'complaints' && (
              <div className="register-view">
                <div className="register-toolbar no-print">
                  <div className="register-toolbar-left">
                    <div className="register-search">
                      <Search size={15} />
                      <input
                        placeholder="Search ticket #, resident, room, title..."
                        value={complaintSearch}
                        onChange={(e) => setComplaintSearch(e.target.value)}
                      />
                    </div>
                    <div className="register-filter">
                      <select
                        value={complaintCategoryFilter}
                        onChange={(e) => setComplaintCategoryFilter(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <option value="Water">Water / Plumbing</option>
                        <option value="Electricity">Electricity / Wiring</option>
                        <option value="Cleaning">Cleaning &amp; Housekeeping</option>
                        <option value="Furniture">Furniture &amp; Carpentry</option>
                        <option value="Internet">Internet / Wi-Fi</option>
                        <option value="Other">Other Maintenance</option>
                      </select>
                    </div>
                    <div className="register-filter">
                      <select
                        value={complaintStatusFilter}
                        onChange={(e) => setComplaintStatusFilter(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <div className="register-toolbar-right">
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <Printer size={14} /> Print Register
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        exportToCSV(
                          'Hostel_Complaints_Register',
                          ['Ticket No', 'Resident', 'Room', 'Category', 'Priority', 'Title', 'Assigned To', 'Status', 'Date'],
                          complaints.map((c) => [
                            c.complaintNumber,
                            c.studentName,
                            c.room,
                            c.category,
                            c.priority,
                            c.title,
                            c.assignedStaff,
                            c.status,
                            c.createdAt ? c.createdAt.slice(0, 10) : ''
                          ])
                        )
                      }
                      type="button"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => setActiveModal('complaint')}
                      type="button"
                    >
                      <Plus size={14} /> Log Complaint
                    </button>
                  </div>
                </div>

                <div className="register-card">
                  <div className="register-card-header no-print">
                    <h2>Hostel Maintenance &amp; Complaint Register ({complaints.length} Tickets)</h2>
                    <small style={{ color: '#75848a' }}>Work orders and maintenance response logs</small>
                  </div>
                  <div className="student-table-scroll">
                    <table className="student-directory">
                      <thead>
                        <tr>
                          <th>Ticket #</th>
                          <th>Date</th>
                          <th>Resident</th>
                          <th>Room</th>
                          <th>Category</th>
                          <th>Issue Description</th>
                          <th>Priority</th>
                          <th>Assigned Staff</th>
                          <th>Status</th>
                          <th className="no-print">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map((comp) => (
                          <tr key={comp._id}>
                            <td>
                              <strong>{comp.complaintNumber}</strong>
                            </td>
                            <td>{comp.createdAt ? comp.createdAt.slice(0, 10) : ''}</td>
                            <td className="student-name">{comp.studentName}</td>
                            <td>{comp.room}</td>
                            <td>{comp.category}</td>
                            <td>
                              <strong>{comp.title}</strong>
                              <br />
                              <small style={{ color: '#82929a' }}>{comp.description}</small>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  background:
                                    comp.priority === 'Urgent' || comp.priority === 'High'
                                      ? '#fde8e4'
                                      : '#fff4e5',
                                  color:
                                    comp.priority === 'Urgent' || comp.priority === 'High'
                                      ? '#d9583d'
                                      : '#bd821c'
                                }}
                              >
                                {comp.priority}
                              </span>
                            </td>
                            <td>{comp.assignedStaff}</td>
                            <td>
                              <em className={`status-pill ${statusClass(comp.status)}`}>
                                {comp.status}
                              </em>
                            </td>
                            <td className="no-print">
                              <button
                                className="approve-student"
                                onClick={() => {
                                  setSelectedItem(comp);
                                  setActiveModal('updateComplaint');
                                }}
                                type="button"
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Maintenance Supervisor</p>
                    <small>Work Inspected</small>
                  </div>
                  <div className="signature-line">
                    <p>Resident Sign-off</p>
                    <small>Satisfactory Resolution</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Warden</p>
                    <small>Ticket Closed</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: DIGITAL NOTICE BOARD (FEATURE 6) */}
            {activeTab === 'notices' && (
              <div className="register-view">
                <div className="register-toolbar no-print">
                  <div className="register-toolbar-left">
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#51676a' }}>
                      <input
                        type="checkbox"
                        checked={showArchivedNotices}
                        onChange={() => setShowArchivedNotices(!showArchivedNotices)}
                      />{' '}
                      Show Archived Circulars
                    </label>
                  </div>
                  <div className="register-toolbar-right">
                    <button
                      className="btn-secondary"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <Printer size={14} /> Print Circular Board
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => setActiveModal('notice')}
                      type="button"
                    >
                      <Plus size={14} /> Publish Circular
                    </button>
                  </div>
                </div>

                <div className="register-card">
                  <div className="register-card-header no-print">
                    <h2>Hostel Notice Board &amp; Official Circulars ({digitalNotices.length})</h2>
                    <small style={{ color: '#75848a' }}>Permanent digital and print announcements archive</small>
                  </div>
                  <div className="student-table-scroll">
                    <table className="student-directory">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Subject / Title</th>
                          <th>Message &amp; Details</th>
                          <th>Target Audience</th>
                          <th>Published</th>
                          <th>Valid Till</th>
                          <th>Priority</th>
                          <th className="no-print">Archive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {digitalNotices.map((n) => (
                          <tr key={n._id}>
                            <td>
                              <span className="badge bank">{n.category || 'General'}</span>
                            </td>
                            <td className="student-name">
                              {n.title}
                              {n.isImportant && (
                                <span
                                  className="badge overdue"
                                  style={{ marginLeft: 6, fontSize: 9 }}
                                >
                                  IMPORTANT
                                </span>
                              )}
                            </td>
                            <td style={{ maxWidth: 350, whiteSpace: 'normal' }}>{n.message}</td>
                            <td>{n.audience}</td>
                            <td>{n.publishDate ? n.publishDate.slice(0, 10) : ''}</td>
                            <td>{n.expiryDate ? n.expiryDate.slice(0, 10) : 'Permanent'}</td>
                            <td>
                              {n.isArchived ? (
                                <em className="status-pill red">Archived</em>
                              ) : (
                                <em className="status-pill green">Active</em>
                              )}
                            </td>
                            <td className="no-print">
                              <button
                                className="btn-secondary"
                                onClick={() => handleToggleArchiveNotice(n._id)}
                                type="button"
                                style={{ padding: '3px 8px', fontSize: 10 }}
                              >
                                {n.isArchived ? 'Restore' : 'Archive'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="signatures print-only">
                  <div className="signature-line">
                    <p>Warden Office</p>
                    <small>Official Seal</small>
                  </div>
                  <div className="signature-line">
                    <p>Hostel Director</p>
                    <small>Authorized Signatory</small>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================
          MODALS FOR TRADITIONAL PROCESSES
         ======================================================== */}

      {/* 1. Modal: Admit Resident Directly */}
      {activeModal === 'admit' && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal modal-wide" role="dialog">
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Student Admission Register</p>
            <h2>Admit Resident (Desk Enrollment)</h2>
            <p className="modal-copy">Enroll resident into physical and digital records with room and guardian details.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.admitResident({
                    name: form.elements['name'].value,
                    email: form.elements['email'].value,
                    phone: form.elements['phone'].value,
                    room: form.elements['room'].value,
                    bed: form.elements['bed'].value,
                    guardianName: form.elements['guardianName'].value,
                    guardianPhone: form.elements['guardianPhone'].value,
                    guardianRelation: form.elements['guardianRelation'].value,
                    emergencyContact: form.elements['emergencyContact'].value,
                    college: form.elements['college'].value,
                    course: form.elements['course'].value,
                    permanentAddress: form.elements['permanentAddress'].value,
                    idProofType: form.elements['idProofType'].value,
                    idProofNumber: form.elements['idProofNumber'].value,
                    documentStatus: form.elements['documentStatus'].value
                  });
                  setActiveModal(null);
                  triggerToast('Resident admitted successfully');
                  loadAdmissions();
                  loadDashboardData();
                } catch (err) {
                  triggerToast(err.message || 'Admission failed');
                }
              }}
            >
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Full Name *</label>
                  <input name="name" required placeholder="e.g. Aditi Rao" />
                </div>
                <div className="modal-field">
                  <label>Student Email *</label>
                  <input name="email" type="email" required placeholder="aditi@example.com" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Student Phone</label>
                  <input name="phone" placeholder="+91 98765 43210" />
                </div>
                <div className="modal-field">
                  <label>Emergency Contact</label>
                  <input name="emergencyContact" placeholder="+91 98765 00000" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Room Allocation</label>
                  <input name="room" placeholder="e.g. A-204" />
                </div>
                <div className="modal-field">
                  <label>Bed Allocation</label>
                  <input name="bed" placeholder="e.g. Bed 1" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Guardian Name</label>
                  <input name="guardianName" placeholder="Father / Mother name" />
                </div>
                <div className="modal-field">
                  <label>Guardian Phone</label>
                  <input name="guardianPhone" placeholder="+91 98111 22334" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Guardian Relation</label>
                  <select name="guardianRelation">
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Local Guardian</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Document Verification</label>
                  <select name="documentStatus">
                    <option value="Verified">Verified Documents</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>College / University</label>
                  <input name="college" placeholder="College name" />
                </div>
                <div className="modal-field">
                  <label>Degree / Course</label>
                  <input name="course" placeholder="e.g. B.Tech Computer Science" />
                </div>
              </div>
              <div className="modal-field">
                <label>Permanent Residential Address</label>
                <textarea name="permanentAddress" placeholder="Full home address with pin code" />
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>ID Proof Type</label>
                  <select name="idProofType">
                    <option>Aadhaar Card</option>
                    <option>College ID</option>
                    <option>Passport</option>
                    <option>Driving License</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>ID Proof Number / Ref</label>
                  <input name="idProofNumber" placeholder="e.g. XXXX-XXXX-1234" />
                </div>
              </div>
              <button className="primary-button" type="submit">
                Complete Admission &amp; Register <Check size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit / Verify Admission */}
      {activeModal === 'editAdmission' && selectedItem && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal modal-wide" role="dialog">
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Verify Student Records</p>
            <h2>Admission Details: {selectedItem.name}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.updateAdmission(selectedItem._id, {
                    room: form.elements['room'].value,
                    bed: form.elements['bed'].value,
                    phone: form.elements['phone'].value,
                    guardianName: form.elements['guardianName'].value,
                    guardianPhone: form.elements['guardianPhone'].value,
                    college: form.elements['college'].value,
                    documentStatus: form.elements['documentStatus'].value
                  });
                  setActiveModal(null);
                  triggerToast('Admission updated');
                  loadAdmissions();
                  loadDashboardData();
                } catch {
                  triggerToast('Update failed');
                }
              }}
            >
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Room</label>
                  <input name="room" defaultValue={selectedItem.room || ''} />
                </div>
                <div className="modal-field">
                  <label>Bed</label>
                  <input name="bed" defaultValue={selectedItem.bed || ''} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Phone</label>
                  <input name="phone" defaultValue={selectedItem.phone || ''} />
                </div>
                <div className="modal-field">
                  <label>Document Status</label>
                  <select name="documentStatus" defaultValue={selectedItem.documentStatus || 'Pending'}>
                    <option value="Verified">Verified Documents</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Guardian Name</label>
                  <input name="guardianName" defaultValue={selectedItem.guardianName || ''} />
                </div>
                <div className="modal-field">
                  <label>Guardian Phone</label>
                  <input name="guardianPhone" defaultValue={selectedItem.guardianPhone || ''} />
                </div>
              </div>
              <div className="modal-field">
                <label>College / Institution</label>
                <input name="college" defaultValue={selectedItem.college || ''} />
              </div>
              <button className="primary-button" type="submit">
                Save Verification Changes <Check size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Record Payment in Ledger */}
      {activeModal === 'payment' && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Payment Ledger</p>
            <h2>Record Fee Payment</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.recordPayment({
                    studentId: form.elements['studentId'].value,
                    paymentType: form.elements['paymentType'].value,
                    forMonth: form.elements['forMonth'].value,
                    amountDue: Number(form.elements['amountDue'].value),
                    amountPaid: Number(form.elements['amountPaid'].value),
                    paymentMode: form.elements['paymentMode'].value,
                    transactionRef: form.elements['transactionRef'].value,
                    notes: form.elements['notes'].value
                  });
                  setActiveModal(null);
                  triggerToast('Payment recorded in ledger');
                  loadLedger();
                  loadDashboardData();
                } catch (err) {
                  triggerToast(err.message || 'Payment recording failed');
                }
              }}
            >
              <div className="modal-field">
                <label>Select Resident *</label>
                <select name="studentId" required>
                  <option value="">-- Choose Resident --</option>
                  {students.map((st) => (
                    <option key={st.id || st._id} value={st.id || st._id}>
                      {st.name} (Room {st.room || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Payment Type</label>
                  <select name="paymentType">
                    <option>Monthly Rent</option>
                    <option>Security Deposit</option>
                    <option>Mess Fee</option>
                    <option>Maintenance Fee</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Fee Month</label>
                  <input name="forMonth" type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Total Due (₹) *</label>
                  <input name="amountDue" type="number" required defaultValue="15000" />
                </div>
                <div className="modal-field">
                  <label>Amount Received (₹) *</label>
                  <input name="amountPaid" type="number" required defaultValue="15000" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Payment Mode *</label>
                  <select name="paymentMode" required>
                    <option>Cash</option>
                    <option>UPI / Online</option>
                    <option>Bank Transfer / NEFT</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Ref / UTR / Cheque #</label>
                  <input name="transactionRef" placeholder="Leave empty for Cash" />
                </div>
              </div>
              <div className="modal-field">
                <label>Accounting Notes / Receipt Remarks</label>
                <input name="notes" placeholder="e.g. Paid in full at front desk" />
              </div>
              <button className="primary-button" type="submit">
                Issue Receipt &amp; Record Entry <Receipt size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Traditional Printable Receipt */}
      {activeModal === 'receipt' && receiptData && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal modal-wide" role="dialog" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
            <div className="receipt-paper">
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
                <button className="btn-secondary" onClick={() => window.print()} type="button">
                  <Printer size={14} /> Print Receipt
                </button>
                <button className="btn-secondary" onClick={() => setActiveModal(null)} type="button">
                  <X size={14} /> Close
                </button>
              </div>

              <div className="receipt-header">
                <h1>{receiptData.hostel.name}</h1>
                <p>{receiptData.hostel.address}</p>
                <p>Phone: {receiptData.hostel.phone} | Email: {receiptData.hostel.email}</p>
                <h3 style={{ margin: '14px 0 0', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 14 }}>
                  FEE PAYMENT RECEIPT
                </h3>
              </div>

              <div className="receipt-meta">
                <div>
                  <p><strong>Receipt No:</strong> {receiptData.receipt.receiptNumber}</p>
                  <p><strong>Resident Name:</strong> {receiptData.receipt.studentName}</p>
                  <p><strong>Room Allocation:</strong> {receiptData.receipt.room}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p><strong>Date:</strong> {receiptData.receipt.paymentDate ? receiptData.receipt.paymentDate.slice(0, 10) : ''}</p>
                  <p><strong>Fee Month:</strong> {receiptData.receipt.forMonth}</p>
                  <p><strong>Payment Mode:</strong> {receiptData.receipt.paymentMode}</p>
                </div>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{receiptData.receipt.paymentType} ({receiptData.receipt.forMonth})</td>
                    <td>{receiptData.receipt.paymentMode} {receiptData.receipt.transactionRef && `(${receiptData.receipt.transactionRef})`}</td>
                    <td>{receiptData.receipt.paymentStatus}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{receiptData.receipt.amountPaid.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan={3}>Total Received</td>
                    <td style={{ textAlign: 'right' }}>₹{receiptData.receipt.amountPaid.toLocaleString('en-IN')}</td>
                  </tr>
                  {receiptData.receipt.balance > 0 && (
                    <tr style={{ color: '#d9583d' }}>
                      <td colSpan={3}>Outstanding Remaining Balance</td>
                      <td style={{ textAlign: 'right' }}>₹{receiptData.receipt.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <p style={{ fontSize: 11, color: '#65767a', fontStyle: 'italic' }}>
                Note: {receiptData.receipt.isCash ? 'Physical desk cash received subject to daily reconciliation.' : 'Electronic transaction verified.'}
              </p>

              <div className="signatures">
                <div className="signature-line">
                  <p>Resident Signature</p>
                  <small>Acknowledgement</small>
                </div>
                <div className="signature-line">
                  <p>Accountant / Warden</p>
                  <small>Authorized Signatory</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Log Visitor Entry */}
      {activeModal === 'visitor' && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Main Gate Log</p>
            <h2>Log Visitor Entry</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.logVisitor({
                    visitorName: form.elements['visitorName'].value,
                    visitorPhone: form.elements['visitorPhone'].value,
                    studentName: form.elements['studentName'].value,
                    studentRoom: form.elements['studentRoom'].value,
                    relation: form.elements['relation'].value,
                    purpose: form.elements['purpose'].value,
                    idProof: form.elements['idProof'].value
                  });
                  setActiveModal(null);
                  triggerToast('Visitor logged at gate');
                  loadVisitorsAndOutpasses();
                } catch (err) {
                  triggerToast(err.message || 'Log failed');
                }
              }}
            >
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Visitor Name *</label>
                  <input name="visitorName" required placeholder="Guest full name" />
                </div>
                <div className="modal-field">
                  <label>Visitor Phone *</label>
                  <input name="visitorPhone" required placeholder="+91 98765 00000" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Resident Being Visited *</label>
                  <input name="studentName" required placeholder="Student name" />
                </div>
                <div className="modal-field">
                  <label>Resident Room *</label>
                  <input name="studentRoom" required placeholder="e.g. A-204" />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Relationship</label>
                  <input name="relation" defaultValue="Parent / Friend" />
                </div>
                <div className="modal-field">
                  <label>Purpose of Visit</label>
                  <input name="purpose" defaultValue="Personal Visit" />
                </div>
              </div>
              <div className="modal-field">
                <label>Gate Security Verification</label>
                <input name="idProof" defaultValue="ID card physically inspected at gate" />
              </div>
              <button className="primary-button" type="submit">
                Record Entry in Gate Book <UserCheck size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Issue Outpass */}
      {activeModal === 'outpass' && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Warden Desk</p>
            <h2>Issue Student Outpass</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.createOutpass({
                    studentId: form.elements['studentId'].value,
                    destination: form.elements['destination'].value,
                    reason: form.elements['reason'].value,
                    expectedReturnTime: form.elements['expectedReturnTime'].value
                  });
                  setActiveModal(null);
                  triggerToast('Outpass generated');
                  loadVisitorsAndOutpasses();
                } catch (err) {
                  triggerToast(err.message || 'Outpass generation failed');
                }
              }}
            >
              <div className="modal-field">
                <label>Select Resident *</label>
                <select name="studentId" required>
                  <option value="">-- Choose Resident --</option>
                  {students.map((st) => (
                    <option key={st.id || st._id} value={st.id || st._id}>
                      {st.name} (Room {st.room || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>Destination *</label>
                <input name="destination" required placeholder="e.g. Home, Library, Market" />
              </div>
              <div className="modal-field">
                <label>Reason for Outing *</label>
                <input name="reason" required placeholder="e.g. Weekend visit, Exam study" />
              </div>
              <div className="modal-field">
                <label>Expected Return Date &amp; Time *</label>
                <input name="expectedReturnTime" type="datetime-local" required />
              </div>
              <button className="primary-button" type="submit">
                Grant Outpass <Clock size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Edit Mess Menu */}
      {activeModal === 'editMenu' && selectedItem && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(520px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Mess Timetable</p>
            <h2>Edit {selectedItem.dayOfWeek} Menu</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.updateMessMenu(selectedItem.dayOfWeek, {
                    breakfast: form.elements['breakfast'].value,
                    lunch: form.elements['lunch'].value,
                    snacks: form.elements['snacks'].value,
                    dinner: form.elements['dinner'].value
                  });
                  setActiveModal(null);
                  triggerToast('Mess menu updated');
                  loadMessData();
                } catch {
                  triggerToast('Menu update failed');
                }
              }}
            >
              <div className="modal-field">
                <label>Breakfast Items</label>
                <input name="breakfast" defaultValue={selectedItem.breakfast} required />
              </div>
              <div className="modal-field">
                <label>Lunch Items</label>
                <input name="lunch" defaultValue={selectedItem.lunch} required />
              </div>
              <div className="modal-field">
                <label>Evening Snacks</label>
                <input name="snacks" defaultValue={selectedItem.snacks} required />
              </div>
              <div className="modal-field">
                <label>Dinner Items</label>
                <input name="dinner" defaultValue={selectedItem.dinner} required />
              </div>
              <button className="primary-button" type="submit">
                Save Weekly Schedule <Check size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Log Maintenance Complaint */}
      {activeModal === 'complaint' && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Maintenance Register</p>
            <h2>Register Maintenance Complaint</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.createComplaint({
                    studentId: form.elements['studentId'].value,
                    category: form.elements['category'].value,
                    priority: form.elements['priority'].value,
                    title: form.elements['title'].value,
                    description: form.elements['description'].value
                  });
                  setActiveModal(null);
                  triggerToast('Complaint logged with sequential ticket');
                  loadComplaints();
                } catch (err) {
                  triggerToast(err.message || 'Log failed');
                }
              }}
            >
              <div className="modal-field">
                <label>Select Resident *</label>
                <select name="studentId" required>
                  <option value="">-- Choose Resident --</option>
                  {students.map((st) => (
                    <option key={st.id || st._id} value={st.id || st._id}>
                      {st.name} (Room {st.room || 'General'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Issue Category</label>
                  <select name="category">
                    <option>Water</option>
                    <option>Electricity</option>
                    <option>Cleaning</option>
                    <option>Furniture</option>
                    <option>Internet</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Priority</label>
                  <select name="priority">
                    <option>Medium</option>
                    <option>Low</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
              <div className="modal-field">
                <label>Issue Title *</label>
                <input name="title" required placeholder="Brief description of defect" />
              </div>
              <div className="modal-field">
                <label>Detailed Description</label>
                <textarea name="description" required placeholder="Specify location, defect details..." />
              </div>
              <button className="primary-button" type="submit">
                Log Work Ticket <Wrench size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal: Update Maintenance Ticket */}
      {activeModal === 'updateComplaint' && selectedItem && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(480px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Work Order {selectedItem.complaintNumber}</p>
            <h2>Update Ticket Status</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.updateComplaint(selectedItem._id, {
                    status: form.elements['status'].value,
                    assignedStaff: form.elements['assignedStaff'].value,
                    resolutionDetails: form.elements['resolutionDetails'].value
                  });
                  setActiveModal(null);
                  triggerToast('Ticket status updated');
                  loadComplaints();
                } catch {
                  triggerToast('Update failed');
                }
              }}
            >
              <div className="modal-field">
                <label>Status</label>
                <select name="status" defaultValue={selectedItem.status}>
                  <option>Open</option>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Assigned Caretaker / Technician</label>
                <input name="assignedStaff" defaultValue={selectedItem.assignedStaff || ''} placeholder="e.g. Ramesh (Plumber)" />
              </div>
              <div className="modal-field">
                <label>Resolution Work Notes</label>
                <textarea name="resolutionDetails" defaultValue={selectedItem.resolutionDetails || ''} placeholder="Details of repair done..." />
              </div>
              <button className="primary-button" type="submit">
                Save Resolution <Check size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. Modal: Publish Notice Circular */}
      {activeModal === 'notice' && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setActiveModal(null)}>
          <div className="modal" role="dialog" style={{ width: 'min(500px, 94vw)' }}>
            <button className="modal-close" onClick={() => setActiveModal(null)} type="button">
              <X size={15} />
            </button>
            <p className="eyebrow">Official Circular</p>
            <h2>Publish to Notice Board</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                try {
                  await api.createNotice({
                    title: form.elements['title'].value,
                    message: form.elements['message'].value,
                    category: form.elements['category'].value,
                    audience: form.elements['audience'].value,
                    isImportant: form.elements['isImportant'].checked,
                    expiryDate: form.elements['expiryDate'].value || null
                  });
                  setActiveModal(null);
                  triggerToast('Notice circular published');
                  loadDigitalNotices();
                  loadDashboardData();
                } catch (err) {
                  triggerToast(err.message || 'Publishing failed');
                }
              }}
            >
              <div className="modal-field">
                <label>Notice Heading / Subject *</label>
                <input name="title" required placeholder="e.g. Hostel Gate Timings Reminder" />
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Category</label>
                  <select name="category">
                    <option>General</option>
                    <option>Rules &amp; Regulation</option>
                    <option>Mess</option>
                    <option>Maintenance</option>
                    <option>Emergency</option>
                    <option>Holiday</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Target Audience</label>
                  <input name="audience" defaultValue="All residents" />
                </div>
              </div>
              <div className="modal-field">
                <label>Notice Content &amp; Instructions *</label>
                <textarea name="message" required placeholder="Full notice body for residents..." rows={4} />
              </div>
              <div className="form-grid-2">
                <div className="modal-field">
                  <label>Valid Until Date</label>
                  <input name="expiryDate" type="date" />
                </div>
                <div className="modal-field" style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input name="isImportant" type="checkbox" /> Mark as Urgent Circular
                  </label>
                </div>
              </div>
              <button className="primary-button" type="submit">
                Broadcast Circular <Megaphone size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      <div className={`toast ${showToast ? 'show' : ''}`} id="toast" role="status">
        {toastMessage}
      </div>
    </div>
  );
}
