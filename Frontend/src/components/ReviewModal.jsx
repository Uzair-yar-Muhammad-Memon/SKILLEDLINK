import React, { useState } from 'react';
import { ReviewAPI } from '../api/client';

export default function ReviewModal({ worker, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await ReviewAPI.add(worker._id || worker.id, rating, comment);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#2c3e50' }}>
          Rate Your Experience
        </h2>
        
        <p style={{ marginBottom: '1.5rem', color: '#7f8c8d', fontSize: '0.95rem' }}>
          How was your experience with <strong>{worker.name}</strong>?
        </p>

        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            fontSize: '0.9rem'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.95rem' }}>
              Rating *
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              fontSize: '2.5rem'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    color: (hoveredRating || rating) >= star ? '#fbbf24' : '#e5e7eb',
                    transition: 'color 0.2s',
                    fontSize: '2.5rem',
                    lineHeight: '1'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.85rem' }}>
                {rating === 1 && '⭐ Poor'}
                {rating === 2 && '⭐⭐ Fair'}
                {rating === 3 && '⭐⭐⭐ Good'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.95rem' }}>
              Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service provider..."
              rows="4"
              maxLength="500"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#7f8c8d', textAlign: 'right' }}>
              {comment.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e9ecef',
                color: '#495057',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              style={{
                padding: '10px 24px',
                backgroundColor: rating === 0 || submitting ? '#95a5a6' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
