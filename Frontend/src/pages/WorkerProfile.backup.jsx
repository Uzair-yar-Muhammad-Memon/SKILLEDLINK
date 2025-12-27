import { useState, useEffect } from 'react';
import { WorkerAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

export default function WorkerProfile() {
  const { user, role } = useRole();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    availabilityStatus: 'available',
    skillCategory: ''
  });

  useEffect(() => {
    console.log('WorkerProfile mounted');
    if (!user) {
      console.log('No user, redirecting');
      navigate('/login');
      return;
    }
    
    console.log('User exists:', user);
    // Set profile from localStorage user data
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      availabilityStatus: user.availabilityStatus || 'available',
      skillCategory: user.skillCategory?.name || user.skillCategory || ''
    });
    
    // Try to fetch fresh data from API
    fetchProfile();
  }, [user]);

  if (!user) {
    return <div className="container" style={{ padding: '80px 20px' }}><p>Redirecting to login...</p></div>;
  }

  const fetchProfile = async () => {
    try {
      const response = await WorkerAPI.getMyProfile();
      if (response.success && response.data) {
        const worker = response.data;
        setProfile({
          name: worker.name || profile.name,
          email: worker.email || profile.email,
          phone: worker.phone || profile.phone,
          city: worker.city || profile.city,
          bio: worker.bio || profile.bio,
          availabilityStatus: worker.availabilityStatus || profile.availabilityStatus,
          skillCategory: worker.skillCategory?.name || profile.skillCategory
        });
      }
    } catch (error) {
      console.error('Could not fetch fresh profile data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updateData = {
        phone: profile.phone,
        city: profile.city,
        bio: profile.bio,
        availabilityStatus: profile.availabilityStatus
      };

      const response = await WorkerAPI.updateProfile(updateData);
      if (response.success) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '80px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px', color: '#2c3e50' }}>My Profile</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Update your profile information and availability status
        </p>

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

        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              Skill Category
            </label>
            <input
              type="text"
              value={profile.skillCategory}
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
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              City *
            </label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              required
              placeholder="Enter your city"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell customers about your experience and skills..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
              Availability Status *
            </label>
            <select
              name="availabilityStatus"
              value={profile.availabilityStatus}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#fff'
              }}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <small style={{ color: '#7f8c8d', fontSize: '14px' }}>
              This affects whether customers can contact you for new jobs
            </small>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: saving ? '#95a5a6' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !saving && (e.target.style.backgroundColor = '#059669')}
            onMouseOut={(e) => !saving && (e.target.style.backgroundColor = '#10b981')}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
