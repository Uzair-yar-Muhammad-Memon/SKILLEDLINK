import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useRole } from '../context/RoleContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { NotificationAPI } from '../api/client';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { role, logout } = useRole();
  const socketContext = useSocket();
  const notifications = socketContext?.notifications || [];
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(o => !o);
  const toggleNotifications = async () => {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);
    
    // Mark notifications as read when opening the panel
    if (willOpen && unreadCount > 0 && socketContext?.clearNotifications) {
      socketContext.clearNotifications();
    }
  };
  
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  return (
    <header role="banner">
      <div className={`container navbar ${menuOpen ? 'navbar--open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span className="brand">SkillLink <span className="tag responsive-hide">Hand-made Skills</span></span>
        </div>
        <button
          className="mobile-nav-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={toggleMenu}
        >{menuOpen ? '✕' : '☰'}</button>
        <nav id="site-navigation" className="nav-links" aria-label="Main navigation">
          {role === 'user' && (
            <>
              <NavLink to="/user" onClick={() => setMenuOpen(false)}>🏠 Dashboard</NavLink>
              <NavLink to="/browse" onClick={() => setMenuOpen(false)}>🔍 Browse Services</NavLink>
              <NavLink to="/user/requests" onClick={() => setMenuOpen(false)}>📬 My Requests</NavLink>
              <NavLink to="/user/profile" onClick={() => setMenuOpen(false)}>👤 Profile</NavLink>
              <NavLink to="/home" onClick={() => setMenuOpen(false)}>🏡 Home</NavLink>
              <NavLink to="/about" onClick={() => setMenuOpen(false)}>ℹ️ About</NavLink>
            </>
          )}
          
          {role === 'worker' && (
            <>
              <NavLink to="/worker" onClick={() => setMenuOpen(false)}>🔧 Dashboard</NavLink>
              <NavLink to="/worker/requests" onClick={() => setMenuOpen(false)}>📬 Job Requests</NavLink>
              <NavLink to="/worker/profile" onClick={() => setMenuOpen(false)}>✏️ My Profile</NavLink>
              <NavLink to="/worker/reviews" onClick={() => setMenuOpen(false)}>⭐ Reviews</NavLink>
              <NavLink to="/home" onClick={() => setMenuOpen(false)}>🏡 Home</NavLink>
              <NavLink to="/about" onClick={() => setMenuOpen(false)}>ℹ️ About</NavLink>
            </>
          )}
          
          {!role && (
            <>
              <NavLink to="/" onClick={() => setMenuOpen(false)}>🏠 Home</NavLink>
              <NavLink to="/about" onClick={() => setMenuOpen(false)}>ℹ️ About</NavLink>
            </>
          )}
        </nav>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          {role && (
            <div style={{ position: 'relative' }}>
                <button
                  className="theme-toggle"
                  onClick={toggleNotifications}
                  style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      border: '2px solid var(--bg)'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {notifOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '0.5rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '350px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border)',
                      fontWeight: 'bold',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>🔔 Notifications</span>
                      <button
                        onClick={() => setNotifOpen(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-light)',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >×</button>
                    </div>
                    
                    {(!notifications || notifications.length === 0) ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                        No notifications yet
                      </div>
                    ) : (
                      <div>
                        {notifications.slice().reverse().map((notif, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border)',
                              background: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setNotifOpen(false);
                              if (notif.type === 'message' && notif.data?.requestId) {
                                navigate(`/messages/${notif.data.requestId}`);
                              } else {
                                navigate(role === 'user' ? '/user/requests' : '/worker/requests');
                              }
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {notif.type === 'request' ? '📬' :
                                 notif.type === 'accepted' ? '✅' :
                                 notif.type === 'rejected' ? '❌' :
                                 notif.type === 'completed' ? '🎉' :
                                 notif.type === 'message' ? '💬' : '🔔'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: notif.read ? 'normal' : 'bold', fontSize: '0.9rem' }}>
                                  {notif.title}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                  {notif.message}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                  {new Date(notif.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

          )}
          
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle color theme"
            aria-label={theme === 'blue' ? 'Switch to green theme' : 'Switch to blue theme'}
          >{theme === 'blue' ? 'Blue → Green' : 'Green → Blue'}</button>
          
          {!role && (
            <>
              <button className="btn outline" onClick={() => navigate('/login')}>Login</button>
              <button className="btn" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
          {role && (
            <button className="btn outline" onClick={() => { logout(); setMenuOpen(false); navigate('/signup'); }}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
}
