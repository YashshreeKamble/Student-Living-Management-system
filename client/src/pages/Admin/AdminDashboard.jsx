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
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [inAccountSettings, setInAccountSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Admin dashboard data
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);

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

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await api.getAdminDashboard();
      setStudents(data.students || []);
      setRooms(
        data.rooms && data.rooms.length > 0
          ? data.rooms
          : [
              { room: 'A-204', students: '2 students', beds: '2 / 2 beds', vacancy: 'Full' },
              { room: 'B-108', students: '1 student', beds: '1 / 1 bed', vacancy: 'Full' },
              { room: 'C-302', students: '1 student', beds: '1 / 2 beds', vacancy: '1 vacant' },
              { room: 'B-206', students: '0 students', beds: '0 / 1 bed', vacancy: 'Maintenance' }
            ]
      );
      setPayments(
        data.payments && data.payments.length > 0
          ? data.payments
          : [
              { student: 'Karan Malhotra', amount: '₹12,500', date: '22 Aug, 09:18', status: 'Received' },
              { student: 'Devika Shah', amount: '₹14,000', date: '21 Aug, 16:42', status: 'Received' },
              { student: 'Rohan Sethi', amount: '₹11,800', date: 'Due 24 Aug', status: 'Pending' },
              { student: 'Priya Nair', amount: '₹13,500', date: 'Due 20 Aug', status: 'Overdue' }
            ]
      );
      setNotices(data.notices || []);
    } catch {
      triggerToast('Admin data could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setAccountName(user.name);
      setAccountEmail(user.email);
    }
    loadDashboardData();
  }, [user, loadDashboardData]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleApproveStudent = async (studentId) => {
    const room = window.prompt('Enter room number (e.g. A-204):');
    if (!room?.trim()) return;
    const bed = window.prompt('Enter bed number (e.g. Bed 1):');
    if (!bed?.trim()) return;

    try {
      await api.approveStudent(studentId, room.trim(), bed.trim());
      triggerToast('Student approved and bed allocated');
      loadDashboardData();
    } catch (err) {
      triggerToast(err.message || 'Student approval failed');
    }
  };

  const handleSendNotice = async () => {
    const title = window.prompt('Notice title:');
    if (!title?.trim()) return;
    const message = window.prompt('Notice message for students:');
    if (!message?.trim()) return;

    try {
      await api.sendNotice(title.trim(), message.trim());
      triggerToast('Notice sent to students');
      loadDashboardData();
    } catch {
      triggerToast('Notice could not be sent');
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

  const statusClass = (status) => {
    if (status === 'Overdue' || status === 'Maintenance') return 'red';
    if (status === 'Pending' || status === 'Full') return 'amber';
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

  return (
    <div className="admin-page">
      <header className="admin-topbar">
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
            {inAccountSettings ? 'Dashboard' : 'Account settings'}
          </button>
          <button className="admin-logout" id="logout" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </header>

      <main className="admin-content">
        {inAccountSettings ? (
          <div>
            <button
              className="back-dashboard"
              id="back-dashboard"
              onClick={() => setInAccountSettings(false)}
              type="button"
            >
              <ArrowLeft size={15} /> Back to dashboard
            </button>
            <div className="account-dashboard">
              <p className="eyebrow">Admin account</p>
              <h2>Account settings</h2>
              <p className="account-copy" id="account-copy" style={{ color: accountError ? '#d9583d' : undefined }}>
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
          <>
            <section className="admin-heading">
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
                  id="send-notice"
                  onClick={handleSendNotice}
                  type="button"
                >
                  <Megaphone size={15} /> Send notice
                </button>
              </div>
            </section>

            <section className="admin-stats">
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
              {/* Room Inventory */}
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

              {/* Communication / Notices */}
              <article className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <p className="eyebrow">Communication</p>
                    <h2>Recent notices</h2>
                  </div>
                </div>
                <div id="notice-list">
                  {notices.length === 0 ? (
                    <p style={{ color: '#82929a', fontSize: '12px', marginTop: '16px' }}>
                      No notices published yet.
                    </p>
                  ) : (
                    notices.map((notice, idx) => (
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
                    ))
                  )}
                </div>
              </article>

              {/* Student Directory Table */}
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
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                            No registered students yet.
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              {/* Financial Transactions */}
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
      </main>

      <div className={`toast ${showToast ? 'show' : ''}`} id="toast" role="status">
        {toastMessage}
      </div>
    </div>
  );
}
