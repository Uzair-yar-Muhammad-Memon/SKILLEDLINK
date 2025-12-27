import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkerAPI, ReviewAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import SendRequestButton from '../components/SendRequestButton';
import ReviewModal from '../components/ReviewModal';

export default function ServiceDetails() {
  const { id } = useParams();
  const { user, role } = useRole();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkerDetails();
  }, [id]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const workerResponse = await WorkerAPI.getById(id);
      const workerData = workerResponse.data;
      
      setWorker({
        id: workerData._id,
        name: workerData.name,
        email: workerData.email,
        phone: workerData.phone,
        skill: workerData.skillCategory?.name || workerData.skillCategory || 'General',
        city: workerData.city,
        rating: workerData.ratingAverage || 0,
        reviewCount: workerData.reviewCount || 0,
        description: workerData.bio || 'Skilled worker available for hire',
        availabilityStatus: workerData.availabilityStatus || 'available'
      });

      // Fetch worker's services
      try {
        const servicesResponse = await WorkerAPI.getWorkerServices(id);
        setServices(servicesResponse.data || []);
      } catch (err) {
        console.log('No services found');
      }

      // Fetch reviews
      try {
        const reviewsResponse = await ReviewAPI.getWorkerReviews(id);
        setReviews(reviewsResponse.data || []);
      } catch (err) {
        console.log('No reviews found');
      }
    } catch (error) {
      console.error('Error fetching worker details:', error);
      setMessage('Failed to load worker details');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ fontSize: '16px', color: star <= rating ? '#fbbf24' : '#e5e7eb' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading worker details...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="dashboard-container">
        <div className="alert">Worker not found.</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">Service Provider Profile</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
          Review the provider's profile, skills, ratings, and reviews. Send a service request if you'd like to hire them.
        </p>
      </div>

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

      {/* Worker Profile Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="worker-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
            {worker.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>{worker.name}</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem', fontSize: '.9rem' }}>
              <span className="worker-skill">{worker.skill}</span>
              <span>📍 {worker.city}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderStars(worker.rating)}
                <span>({worker.reviewCount} reviews)</span>
              </span>
              <span style={{ 
                padding: '.25rem .6rem', 
                borderRadius: '12px', 
                fontSize: '.75rem',
                backgroundColor: worker.availabilityStatus === 'available' ? '#d4edda' : '#f8d7da',
                color: worker.availabilityStatus === 'available' ? '#155724' : '#721c24'
              }}>
                {worker.availabilityStatus === 'available' ? '✓ Available' : 'Busy'}
              </span>
            </div>
            <p style={{ margin: '0.5rem 0 1rem 0', lineHeight: '1.6' }}>{worker.description}</p>
            
            {/* Show request button for users if provider is available */}
            {role === 'user' && worker.availabilityStatus === 'available' && (
              <div style={{ marginBottom: '1rem' }}>
                <SendRequestButton 
                  worker={{ _id: worker.id, name: worker.name, city: worker.city, skillCategory: worker.skill }} 
                  onSuccess={() => {
                    setMessage('✅ Service request sent successfully! The provider will be notified.');
                    setTimeout(() => navigate('/user/requests'), 2000);
                  }}
                />
              </div>
            )}
            
            {role === 'user' && worker.availabilityStatus !== 'available' && (
              <div style={{ 
                padding: '1rem', 
                background: '#fef3c7', 
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                color: '#92400e',
                marginBottom: '1rem'
              }}>
                ℹ️ This provider is currently busy. Please check back later or browse other providers.
              </div>
            )}
            
            <div style={{ 
              padding: '0.75rem', 
              background: 'var(--card-bg)', 
              borderRadius: '6px',
              fontSize: '0.9rem',
              color: 'var(--text-light)',
              border: '1px solid var(--border)'
            }}>
              💡 <strong>Note:</strong> After the provider accepts your request, you'll be able to message them directly and coordinate the details.
            </div>
          </div>
        </div>
      </div>

      {/* Listed Services */}
      {services.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Listed Services</h3>
          <div className="grid-2">
            {services.map(s => (
              <div key={s._id} className="card">
                <strong style={{ fontSize: '.95rem', marginBottom: '.5rem', display: 'block' }}>{s.title}</strong>
                <p style={{ fontSize: '.85rem', lineHeight: '1.4', marginBottom: '.75rem' }}>{s.description}</p>
                <div style={{ fontSize: '.8rem', color: 'var(--color-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>💰 PKR {s.budgetMin}-{s.budgetMax}</span>
                  <span>📍 {s.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Customer Reviews ({reviews.length})</h3>
          {role === 'user' && user && (
            <button 
              className="btn" 
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: '#fbbf24', color: '#000' }}
              onClick={() => setReviewModalOpen(true)}
            >
              ⭐ Write a Review
            </button>
          )}
        </div>
        {reviews.length === 0 ? (
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>No reviews yet. Be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.slice(0, 5).map(review => (
              <div key={review._id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <strong style={{ fontSize: '.9rem' }}>{review.userId?.name || 'Anonymous'}</strong>
                  {renderStars(review.rating)}
                </div>
                <p style={{ fontSize: '.85rem', margin: 0, lineHeight: '1.5' }}>{review.comment}</p>
                <div style={{ fontSize: '.75rem', color: 'var(--color-muted)', marginTop: '.5rem' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && worker && (
        <ReviewModal
          worker={{ _id: worker.id, name: worker.name }}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            setMessage('✅ Thank you for your review!');
            fetchWorkerDetails(); // Refresh to show new review
            setTimeout(() => setMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
}
