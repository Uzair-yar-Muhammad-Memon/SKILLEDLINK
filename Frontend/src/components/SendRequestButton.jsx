import React, { useState } from 'react';
import { RequestAPI } from '../api/client';

export default function SendRequestButton({ worker, onSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    urgency: 'medium',
    scheduledDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestData = {
        workerId: worker._id,
        title: formData.title,
        description: formData.description,
        category: worker.skillCategory,
        location: formData.location,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        urgency: formData.urgency,
        scheduledDate: formData.scheduledDate || undefined
      };

      await RequestAPI.create(requestData);
      alert('✅ Service request sent successfully! The worker will be notified.');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        budget: '',
        urgency: 'medium',
        scheduledDate: ''
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        className="btn" 
        onClick={() => setShowForm(true)}
        style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
      >
        📬 Send Service Request
      </button>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{ 
        background: 'var(--bg)', 
        padding: '2rem', 
        borderRadius: '12px', 
        maxWidth: '600px', 
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Send Service Request</h2>
          <button 
            onClick={() => setShowForm(false)}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: 'var(--text)'
            }}
          >×</button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px' }}>
          <strong>{worker.name}</strong>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            {worker.skillCategory} • {worker.city}
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            background: '#fee', 
            color: '#c33', 
            borderRadius: '6px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fix kitchen sink"
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work you need done..."
              required
              rows={4}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Your address or area"
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Budget (₨)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Optional"
                min="0"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border)',
                  fontSize: '1rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Preferred Date
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="btn outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Sending...' : '📤 Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
