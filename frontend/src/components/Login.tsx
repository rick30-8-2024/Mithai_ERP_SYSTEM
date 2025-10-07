import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSigninLoading, setIsSigninLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const [signin, setSignin] = useState({ username: '', password: '' });
  const [signup, setSignup] = useState({ username: '', password: '', role: 'user' });
  const baseUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSigninLoading(true);
    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signin),
      });
      const data = await res.json().catch(() => ({}));
      console.log('Sign In response:', data, 'status:', res.status);
      
      if (res.ok) {
        // Store credentials in localStorage
        localStorage.setItem('ERP_USERNAME', signin.username);
        localStorage.setItem('ERP_PASSWORD', signin.password);
        
        setMessage({ type: 'success', text: data.message || 'Login successful!' });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Login failed. Please try again.' });
      }
    } catch (err) {
      console.error('Sign In error:', err);
      setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setIsSigninLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSignupLoading(true);
    try {
      const res = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signup),
      });
      const data = await res.json().catch(() => ({}));
      console.log('Sign Up response:', data, 'status:', res.status);
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Account created successfully!' });
        setSignup({ username: '', password: '', role: 'user' });
        // Switch to sign in tab after successful signup
        setTimeout(() => {
          setTab('signin');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Signup failed. Please try again.' });
      }
    } catch (err) {
      console.error('Sign Up error:', err);
      setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="mode-label">{theme === 'light' ? 'Light' : 'Dark'}</div>
        <label className="switch" aria-label="Toggle light and dark mode">
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <span className="slider" />
        </label>
      </div>

      <main className="auth-container">
        <section className="auth-card">
          <h1 className="title">Sweet Manufacturing ERP</h1>
          <div className="tabs">
            <button
              className={`tab ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => setTab('signin')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => setTab('signup')}
              type="button"
            >
              Sign Up
            </button>
            <span
              className="tab-underline"
              aria-hidden
              style={{ transform: tab === 'signin' ? 'translateX(0%)' : 'translateX(100%)' }}
            />
          </div>

          {message && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: '8px',
                backgroundColor: theme === 'dark'
                  ? (message.type === 'success' ? '#1e4620' : '#4a1c1c')
                  : (message.type === 'success' ? '#d4edda' : '#f8d7da'),
                color: theme === 'dark'
                  ? (message.type === 'success' ? '#7bc67e' : '#f57676')
                  : (message.type === 'success' ? '#155724' : '#721c24'),
                border: `1px solid ${
                  theme === 'dark'
                    ? (message.type === 'success' ? '#2d5f2e' : '#6e2c2c')
                    : (message.type === 'success' ? '#c3e6cb' : '#f5c6cb')
                }`,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {message.text}
            </div>
          )}

          {tab === 'signin' ? (
            <form className="panel" onSubmit={handleSignIn}>
              <div className="field">
                <input
                  className="input"
                  type="text"
                  placeholder="Username"
                  value={signin.username}
                  onChange={e => setSignin({ ...signin, username: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showSigninPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signin.password}
                  onChange={e => setSignin({ ...signin, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSigninPassword(!showSigninPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    transition: 'opacity 0.2s ease',
                  }}
                  aria-label={showSigninPassword ? "Hide password" : "Show password"}
                >
                  {showSigninPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease' }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease' }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
              <button className="btn" type="submit" disabled={isSigninLoading}>
                {isSigninLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          ) : (
            <form className="panel" onSubmit={handleSignUp}>
              <div className="field">
                <input
                  className="input"
                  type="text"
                  placeholder="Username"
                  value={signup.username}
                  onChange={e => setSignup({ ...signup, username: e.target.value })}
                  required
                />
              </div>
              <div className="field" style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signup.password}
                  onChange={e => setSignup({ ...signup, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    transition: 'opacity 0.2s ease',
                  }}
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease' }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s ease' }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
              <div
                className="field"
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <select
                  className="input select"
                  value={signup.role}
                  onChange={e => setSignup({ ...signup, role: e.target.value })}
                  required
                  style={{ flex: 1 }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button className="btn" type="submit" style={{ height: 46 }} disabled={isSignupLoading}>
                  {isSignupLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ animation: 'spin 1s linear infinite' }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Signing Up...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default Login;