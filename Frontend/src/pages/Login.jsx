import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../api/client';

export default function Login() {
  const { setAuth, user, role } = useRole();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      navigate(role === 'worker' ? '/worker' : '/user', { replace: true });
    }
  }, [user, role, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAs, setLoginAs] = useState('user');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) newErrors.email = 'Enter a valid email.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const response = loginAs === 'worker' 
          ? await AuthAPI.loginWorker(email, password)
          : await AuthAPI.loginUser(email, password);
        const userData = response.data.user || response.data.worker;
        userData.role = loginAs;
        
        // Ensure we have the id field
        if (!userData.id && userData._id) {
          userData.id = userData._id;
        }
        
        console.log('Login userData:', userData);
        setAuth(userData);
        navigate(loginAs === 'worker' ? '/worker' : '/user');
      } catch (error) {
        setErrors({ submit: error.message || 'Login failed. Please check your credentials.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">Welcome Back</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>Login to access your dashboard and manage your services</p>
      </div>
      <div className="profile-form-wrapper" style={{ maxWidth: '500px' }}>
        <form onSubmit={submit} noValidate>
        <div className="form-control">
          <label htmlFor="login-as">Login As</label>
          <select id="login-as" value={loginAs} onChange={e => setLoginAs(e.target.value)}>
            <option value="user">Service Receiver</option>
            <option value="worker">Service Provider (Worker)</option>
          </select>
        </div>
        <div className="form-control">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'login-email-error' : undefined} />
          {errors.email && <span id="login-email-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.email}</span>}
        </div>
        <div className="form-control">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'login-password-error' : undefined} />
          {errors.password && <span id="login-password-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.password}</span>}
        </div>
        {errors.submit && (
          <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
            {errors.submit}
          </div>
        )}
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ marginBottom: '0.5rem', color: 'var(--text-light)' }}>Don't have an account?</p>
          <button type="button" className="btn outline" onClick={() => navigate('/signup')}>Create Account</button>
        </div>
        </form>
      </div>
    </div>
  );
}
