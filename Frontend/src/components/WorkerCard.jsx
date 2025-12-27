import React from 'react';
import { Link } from 'react-router-dom';

export default function WorkerCard({ worker, showActions = true }) {
  return (
    <div className="worker-card" aria-label={`${worker.skill} worker card`}>
      <div className="worker-header">
        <div className="worker-avatar" aria-hidden="true">{worker.name.split(' ')[0][0]}</div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '.9rem' }}>{worker.name}</strong>
          <div className="worker-meta">
            <span>📍 {worker.city}</span>
            <span className="rating" aria-label={`Rating ${worker.rating}`}>★ {worker.rating}</span>
            {worker.reviewCount > 0 && (
              <span style={{ fontSize: '.75rem', color: 'var(--color-muted)' }}>
                ({worker.reviewCount})
              </span>
            )}
          </div>
        </div>
        <span className="worker-skill" aria-label={`Skill ${worker.skill}`}>{worker.skill}</span>
      </div>
      <p className="worker-desc">{worker.description}</p>
      {worker.availabilityStatus && (
        <div style={{ 
          padding: '.25rem .6rem', 
          borderRadius: '12px', 
          fontSize: '.7rem',
          fontWeight: '600',
          alignSelf: 'flex-start',
          marginBottom: '.5rem',
          backgroundColor: worker.availabilityStatus === 'available' ? '#d4edda' : '#f8d7da',
          color: worker.availabilityStatus === 'available' ? '#155724' : '#721c24'
        }}>
          {worker.availabilityStatus === 'available' ? '✓ Available' : 'Busy'}
        </div>
      )}
      {showActions && (
        <div style={{ display: 'flex', gap: '.5rem', marginTop: 'auto' }}>
          <Link 
            to={`/service/${worker.id}`} 
            className="btn" 
            style={{ fontSize: '.75rem', flex: 1, textAlign: 'center' }} 
            aria-label={`View profile of ${worker.name}`}
          >
            👁️ View Profile
          </Link>
        </div>
      )}
    </div>
  );
}
