import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Wifi,
  Utensils,
  ShieldCheck,
  WashingMachine,
  MapPin,
  TrainFront,
  ShoppingBag,
  Hospital,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [registerMode, setRegisterMode] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/student');
    }
  }, [user, navigate]);

  const openLogin = (role) => {
    setSelectedRole(role.toLowerCase());
    setRegisterMode(false);
    setName('');
    setEmail('');
    setPassword('');
    setStatusMessage({ text: '', isError: false });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setStatusMessage({ text: '', isError: false });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ text: '', isError: false });

    try {
      if (registerMode) {
        await register(name, email, password);
        setRegisterMode(false);
        setPassword('');
        setStatusMessage({
          text: 'Account created successfully. Please sign in to continue.',
          isError: false
        });
      } else {
        const result = await login(email, password, selectedRole);
        closeModal();
        if (result.redirect) {
          navigate(result.redirect === '/admin.html' ? '/admin' : '/student');
        } else if (selectedRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setStatusMessage({
        text: err.message || 'Server connection failed. Please try again.',
        isError: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <header className="site-nav">
        <a className="brand" href="/">
          <span className="brand-mark">A</span>Arbor House
        </a>
        <nav className="nav-links">
          <a href="#facilities">Facilities</a>
          <a href="#rooms">Rooms</a>
          <a href="#location">Location</a>
          <button
            className="hero-button alt"
            onClick={() => openLogin('Student')}
            type="button"
          >
            Student sign in
          </button>
          <button
            className="login-toggle"
            onClick={() => openLogin('Admin')}
            type="button"
          >
            Admin sign in
          </button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A better place to stay</p>
            <h1>
              Find your <em>place</em> to grow.
            </h1>
            <p>
              A calm, connected PG for students who want comfort, good food, and a
              community that feels like home.
            </p>
            <div className="hero-buttons">
              <a className="hero-button" href="#rooms">
                Explore rooms <ArrowRight size={16} />
              </a>
              <button
                className="hero-button alt"
                onClick={() => openLogin('Student')}
                type="button"
              >
                Student login
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-caption">
              <strong>Arbor House PG</strong>
              <small>Safe, comfortable student living</small>
            </div>
          </div>
        </section>

        <section className="section facilities" id="facilities">
          <div className="section-head">
            <div>
              <p className="eyebrow">Everything included</p>
              <h2>Made for everyday student life.</h2>
            </div>
            <p className="section-intro">
              The little things are taken care of, so you can focus on classes,
              friends, and your next big idea.
            </p>
          </div>
          <div className="facility-grid">
            <article className="facility">
              <div className="facility-media">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80"
                  alt="Network equipment providing fast Wi-Fi"
                />
              </div>
              <div className="facility-content">
                <span className="facility-icon">
                  <Wifi size={19} />
                </span>
                <h3>Fast Wi-Fi</h3>
                <p>Reliable internet for classes, projects, and late-night study.</p>
              </div>
            </article>
            <article className="facility">
              <div className="facility-media">
                <img
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
                  alt="Fresh meal prepared in the Arbor House kitchen"
                />
              </div>
              <div className="facility-content">
                <span className="facility-icon">
                  <Utensils size={19} />
                </span>
                <h3>Fresh meals</h3>
                <p>Breakfast, lunch, and dinner made fresh every day.</p>
              </div>
            </article>
            <article className="facility">
              <div className="facility-media">
                <img
                  src="https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=700&q=80"
                  alt="Secure entrance to the Arbor House property"
                />
              </div>
              <div className="facility-content">
                <span className="facility-icon">
                  <ShieldCheck size={19} />
                </span>
                <h3>Safe &amp; secure</h3>
                <p>24/7 security, visitor checks, and a caring support team.</p>
              </div>
            </article>
            <article className="facility">
              <div className="facility-media">
                <img
                  src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=700&q=80"
                  alt="Clean laundry ready for pickup"
                />
              </div>
              <div className="facility-content">
                <span className="facility-icon">
                  <WashingMachine size={19} />
                </span>
                <h3>Laundry service</h3>
                <p>Easy pickup and drop-off laundry service within the property.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section rooms" id="rooms">
          <div className="section-head">
            <div>
              <p className="eyebrow">Choose your space</p>
              <h2>Rooms that feel like yours.</h2>
            </div>
            <p className="section-intro">
              Bright, practical spaces with everything you need to settle in
              quickly.
            </p>
          </div>
          <div className="room-grid">
            <article className="room">
              <div className="room-image single"></div>
              <div className="room-copy">
                <h3>Single room</h3>
                <p>
                  Your own quiet space with a bed, study desk, wardrobe, and
                  natural light.
                </p>
                <span>From ₹18,000 / month</span>
              </div>
            </article>
            <article className="room">
              <div className="room-image shared"></div>
              <div className="room-copy">
                <h3>Shared room</h3>
                <p>
                  A comfortable shared space to meet people, with personal storage
                  and study areas.
                </p>
                <span>From ₹12,500 / month</span>
              </div>
            </article>
          </div>
        </section>

        <section className="section location" id="location">
          <div>
            <p className="eyebrow">Right where you need to be</p>
            <h2>
              Close to campus.
              <br />
              Close to everything.
            </h2>
            <p className="section-intro">
              Arbor House is in a student-friendly neighbourhood with easy access
              to college, food, transport, and daily essentials.
            </p>
            <div className="location-list">
              <span className="location-item">
                <MapPin size={17} /> 8 min to campus
              </span>
              <span className="location-item">
                <TrainFront size={17} /> 5 min to metro
              </span>
              <span className="location-item">
                <ShoppingBag size={17} /> Shops nearby
              </span>
              <span className="location-item">
                <Hospital size={17} /> Hospital 2 km away
              </span>
            </div>
          </div>
          <div
            className="map-image"
            aria-label="Neighbourhood around Arbor House"
          ></div>
        </section>
      </main>

      <footer className="footer">
        <span>© 2026 Arbor House PG</span>
        <span>Questions? hello@arborhouse.in · +91 98765 43210</span>
      </footer>

      {/* Auth Modal */}
      <div
        className={`modal ${modalOpen ? 'open' : ''}`}
        id="login-modal"
        onClick={(e) => {
          if (e.target.id === 'login-modal') closeModal();
        }}
      >
        <div className="modal-box">
          <button
            className="modal-close"
            id="modal-close"
            aria-label="Close"
            onClick={closeModal}
            type="button"
          >
            <X size={18} />
          </button>
          <p className="eyebrow" id="login-eyebrow">
            {registerMode ? 'New student registration' : 'Welcome back'}
          </p>
          <h2 id="login-title">
            {registerMode
              ? 'Create student account'
              : `${selectedRole === 'admin' ? 'Admin' : 'Student'} login`}
          </h2>
          <p
            id="login-copy"
            style={{
              color: statusMessage.text
                ? statusMessage.isError
                  ? '#d9583d'
                  : '#1c9b8b'
                : undefined
            }}
          >
            {statusMessage.text ||
              (registerMode
                ? 'Create your account to access your room, rent, meals, and requests.'
                : selectedRole === 'admin'
                  ? 'Sign in to manage residents, rooms, payments, and daily operations.'
                  : 'Sign in to manage your room, rent, meals, and requests.')}
          </p>
          <form className="login-form" id="login-form" onSubmit={handleSubmit} autoComplete="off">
            {registerMode && (
              <>
                <label id="name-label" htmlFor="login-name">
                  Full name
                </label>
                <input
                  id="login-name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={registerMode}
                />
              </>
            )}
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              required
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-password"
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              required
              type="password"
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button className="login-submit" type="submit" disabled={submitting}>
              {submitting
                ? registerMode
                  ? 'Creating account...'
                  : 'Signing in...'
                : 'Continue'}{' '}
              <ArrowRight size={16} />
            </button>
          </form>

          {selectedRole === 'student' && (
            <button
              className="mode-toggle"
              id="mode-toggle"
              type="button"
              onClick={() => {
                setRegisterMode(!registerMode);
                setStatusMessage({ text: '', isError: false });
              }}
            >
              {registerMode
                ? 'Already have an account? Sign in'
                : 'New student? Create an account'}
            </button>
          )}

          <p className="login-note">
            Your details are protected with secure sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}
