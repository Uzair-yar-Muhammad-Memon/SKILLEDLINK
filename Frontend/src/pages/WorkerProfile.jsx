import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { citiesByProvince } from '../data/cities.js';

export default function WorkerProfile() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    bio: '',
    availabilityStatus: 'available'
  });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    yearsOfExperience: 0,
    description: ''
  });
  const [showSkillForm, setShowSkillForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      availabilityStatus: user.availabilityStatus || 'available'
    });
    setSkills(user.skills || []);
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skillName.trim()) {
      setMessage('❌ Skill name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/workers/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSkill)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Skill added successfully!');
        setSkills(data.data.skills || []);
        setNewSkill({ skillName: '', yearsOfExperience: 0, description: '' });
        setShowSkillForm(false);
        
        // Update local storage
        const updatedUser = { ...user, skills: data.data.skills };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.message || 'Failed to add skill'));
      }
    } catch (error) {
      setMessage('❌ Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/workers/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Skill removed successfully!');
        setSkills(data.data.skills || []);
        
        // Update local storage
        const updatedUser = { ...user, skills: data.data.skills };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.message || 'Failed to remove skill'));
      }
    } catch (error) {
      setMessage('❌ Failed to remove skill');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/workers/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Profile updated successfully!');
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.message || 'Failed to update profile'));
      }
    } catch (error) {
      setMessage('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 style={{ marginBottom: '10px', color: '#2c3e50' }}>Worker Profile</h1>
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
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
            <input type="text" value={user.name || ''} disabled style={{
                width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
                backgroundColor: '#f8f9fa', color: '#6c757d'
              }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
            <input type="email" value={user.email || ''} disabled style={{
                width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
                backgroundColor: '#f8f9fa', color: '#6c757d'
              }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>City *</label>
            <select name="city" value={formData.city} onChange={handleChange} required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <option value="">Select your city</option>
              {Object.entries(citiesByProvince).map(([province, cityList]) => (
                <optgroup key={province} label={province}>
                  {cityList.map(c => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {!formData.city && (
              <span style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '4px', display: 'block' }}>
                Select a city from the list. Can't find your city? Contact support.
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4"
              placeholder="Tell customers about your skills and experience..."
              style={{
                width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
                fontFamily: 'inherit', resize: 'vertical'
              }} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Availability Status *</label>
            <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange} required
              style={{
                width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
                backgroundColor: '#fff'
              }}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <button type="submit" disabled={saving} style={{
              width: '100%', padding: '14px',
              backgroundColor: saving ? '#95a5a6' : '#10b981',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Skills Management Section */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>My Skills</h2>
            <button 
              onClick={() => setShowSkillForm(!showSkillForm)}
              className="btn"
              type="button"
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: showSkillForm ? '#6c757d' : 'var(--primary)'
              }}
            >
              {showSkillForm ? 'Cancel' : '+ Add New Skill'}
            </button>
          </div>

          {showSkillForm && (
            <form onSubmit={handleAddSkill} style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '2px solid var(--border)'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Skill Name *</label>
                <input 
                  type="text" 
                  name="skillName" 
                  value={newSkill.skillName} 
                  onChange={handleSkillChange}
                  placeholder="e.g., Plumbing, Electrical Work, Carpentry"
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Years of Experience</label>
                <input 
                  type="number" 
                  name="yearsOfExperience" 
                  value={newSkill.yearsOfExperience} 
                  onChange={handleSkillChange}
                  min="0"
                  max="50"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
                <textarea 
                  name="description" 
                  value={newSkill.description} 
                  onChange={handleSkillChange}
                  placeholder="Describe your expertise in this skill..."
                  rows="3"
                  style={{
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button 
                type="submit"
                className="btn"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--primary)'
                }}
              >
                Add Skill
              </button>
            </form>
          )}

          {/* Skills List */}
          {skills.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No skills added yet</p>
              <p style={{ fontSize: '0.9rem' }}>Add your first skill to showcase your expertise!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {skills.map((skill, index) => (
                <div 
                  key={skill._id || index}
                  style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      color: 'var(--primary)', 
                      fontSize: '1.2rem',
                      fontWeight: '700'
                    }}>
                      {skill.skillName}
                    </h3>
                    {skill.yearsOfExperience > 0 && (
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#10b981', 
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        🏆 {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                      </p>
                    )}
                    {skill.description && (
                      <p style={{ 
                        margin: 0, 
                        color: '#6c757d', 
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                      }}>
                        {skill.description}
                      </p>
                    )}
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      color: '#95a5a6', 
                      fontSize: '0.8rem'
                    }}>
                      Added: {new Date(skill.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(skill._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      marginLeft: '15px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
