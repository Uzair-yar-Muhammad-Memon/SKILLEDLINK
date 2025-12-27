import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../api/client';
import { citiesByProvince } from '../data/cities.js';

export default function Signup() {
  const { setAuth, user, role } = useRole();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      navigate(role === 'worker' ? '/worker' : '/user', { replace: true });
    }
  }, [user, role, navigate]);
  const [selectedRole, setSelectedRole] = useState('user');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('plumber');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) newErrors.email = 'Enter a valid email.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!city.trim()) newErrors.city = 'City is required.';
    if (selectedRole === 'worker' && description.trim().length < 20) newErrors.description = 'Provide at least 20 characters about your service.';
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setSuccessMessage('');
      try {
        let response;
        let userData;
        
        if (selectedRole === 'worker') {
          response = await AuthAPI.registerWorker(fullName, email, password, phone, city, skill, description);
          userData = response.data.worker;
        } else {
          response = await AuthAPI.registerUser(fullName, email, password, phone, city);
          userData = response.data.user;
        }
        
        // Ensure we have the role and id fields
        userData.role = selectedRole;
        if (!userData.id && userData._id) {
          userData.id = userData._id;
        }
        
        console.log('Setting auth with userData:', userData);
        setAuth(userData);
        
        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          navigate(selectedRole === 'worker' ? '/worker' : '/user');
        }, 1000);
      } catch (error) {
        setErrors({ submit: error.message || 'Registration failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">Welcome to SkillLink</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>Create an account to get started - Connect with local skilled workers or offer your services</p>
      </div>
      <div className="profile-form-wrapper" style={{ maxWidth: '700px' }}>
        <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="form-control">
            <label>Full Name</label>
            <input placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
            {errors.fullName && <span id="fullName-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.fullName}</span>}
          </div>
          <div className="form-control">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
            {errors.email && <span id="email-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.email}</span>}
          </div>
          <div className="form-control">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} />
            {errors.password && <span id="password-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.password}</span>}
          </div>
          <div className="form-control">
            <label>Phone</label>
            <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
            {errors.phone && <span id="phone-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.phone}</span>}
          </div>
          <div className="form-control">
            <label>City</label>
            <select 
              value={city} 
              onChange={e => setCity(e.target.value)} 
              aria-invalid={!!errors.city} 
              aria-describedby={errors.city ? 'city-error' : undefined}
            >
              <option value="">Select your city</option>
              {Object.entries(citiesByProvince).map(([province, cityList]) => (
                <optgroup key={province} label={province}>
                  {cityList.map(c => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.city && <span id="city-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.city}</span>}
            {!city && !errors.city && (
              <span style={{ color: 'var(--text-muted)', fontSize: '.8rem', marginTop: '0.25rem' }}>
                Select a city from the list. Can't find your city? Contact support.
              </span>
            )}
          </div>
          <div className="form-control">
            <label>Role</label>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
              <option value="user">Service Receiver</option>
              <option value="worker">Service Provider (Worker)</option>
            </select>
          </div>
          {selectedRole === 'worker' && (
            <div className="form-control">
              <label>Primary Skill Category</label>
              <select value={skill} onChange={e => setSkill(e.target.value)}>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="electrician">Electrician</option>
                <option value="tailor">Tailor</option>
                <option value="painter">Painter</option>
                <option value="mason">Mason</option>
                <option value="gardener">Gardener</option>
                <option value="tutor">Tutor</option>
                <option value="repair">Home Repair</option>
              </select>
            </div>
          )}
        </div>
        {selectedRole === 'worker' && (
          <div className="form-control">
            <label>Short Service Description</label>
            <textarea placeholder="Describe your experience and offerings" value={description} onChange={e => setDescription(e.target.value)} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} />
            {errors.description && <span id="description-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.description}</span>}
          </div>
        )}
        {successMessage && (
          <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem' }}>
            {successMessage}
          </div>
        )}
        {errors.submit && (
          <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
            {errors.submit}
          </div>
        )}
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ marginBottom: '0.5rem', color: 'var(--text-light)' }}>Already have an account?</p>
          <button type="button" className="btn outline" onClick={() => navigate('/login')} disabled={loading}>Login Here</button>
        </div>
        </form>
      </div>
    </div>
  );
}
