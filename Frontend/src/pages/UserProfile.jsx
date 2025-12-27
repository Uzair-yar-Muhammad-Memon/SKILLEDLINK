import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { citiesByProvince } from '../data/cities.js';
import '../styles.css';

export default function UserProfile() {
  const { user, role } = useRole();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
    console.log('UserProfile loaded - user:', user, 'role:', role);
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || ''
      });
    } else {
      console.log('No user data, redirecting to login');
      setTimeout(() => navigate('/login'), 100);
    }
  }, [user, role, navigate]);

  // Don't render anything if no user
  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: profile.phone,
          city: profile.city
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update localStorage with new user data
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 style={{ marginBottom: '10px', color: '#2c3e50' }}>My Profile</h1>
        <p style={{ color: '#7f8c8d' }}>
          Update your profile information
        </p>
      </div>

      <div className="profile-form-wrapper">
        {message && (
          <div style={{
            padding: '12px 20px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Read-only fields */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              Name
            </label>
            <input
              type="text"
              value={profile.name}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            />
          </div>

          {/* Editable fields */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              City
            </label>
            <select
              name="city"
              value={profile.city}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
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
            {!profile.city && (
              <span style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '4px', display: 'block' }}>
                Select a city from the list. Can't find your city? Contact support.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: saving ? '#95a5a6' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !saving && (e.target.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => !saving && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
