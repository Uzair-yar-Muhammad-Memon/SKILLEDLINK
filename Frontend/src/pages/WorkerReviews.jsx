import React, { useState, useEffect } from 'react';
import { ReviewAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

export default function WorkerReviews() {
  const { user, role } = useRole();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0
  });

  useEffect(() => {
    console.log('WorkerReviews loaded - user:', user, 'role:', role);
    if (user) {
      fetchReviews();
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

  const fetchReviews = async () => {
    try {
      // Use user.id or user._id depending on what's available
      const userId = user._id || user.id;
      if (!userId) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }
      const response = await ReviewAPI.getWorkerReviews(userId);
      if (response.success) {
        setReviews(response.data || []);
        calculateStats(response.data || []);
      } else {
        console.log('No reviews found or API returned success:false');
        setReviews([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // Still show the page even if there's an error
      setReviews([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;

    const starCounts = {
      fiveStar: reviewsData.filter(r => r.rating === 5).length,
      fourStar: reviewsData.filter(r => r.rating === 4).length,
      threeStar: reviewsData.filter(r => r.rating === 3).length,
      twoStar: reviewsData.filter(r => r.rating === 2).length,
      oneStar: reviewsData.filter(r => r.rating === 1).length
    };

    setStats({ total, average, ...starCounts });
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: '20px',
              color: star <= rating ? '#fbbf24' : '#e5e7eb'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 style={{ marginBottom: '10px', color: '#2c3e50' }}>My Reviews</h1>
        <p style={{ color: '#7f8c8d' }}>
          See what your customers are saying about your work
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Overall Rating */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: '700', color: '#10b981', marginBottom: '10px' }}>
            {stats.average}
          </div>
          <div style={{ marginBottom: '10px' }}>
            {renderStars(Math.round(stats.average))}
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
            Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Star Distribution */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Rating Distribution</h3>
          {[
            { stars: 5, count: stats.fiveStar },
            { stars: 4, count: stats.fourStar },
            { stars: 3, count: stats.threeStar },
            { stars: 2, count: stats.twoStar },
            { stars: 1, count: stats.oneStar }
          ].map(({ stars, count }) => {
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={stars} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                marginBottom: '12px' 
              }}>
                <span style={{ width: '50px', fontSize: '14px', color: '#7f8c8d' }}>
                  {stars} ★
                </span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#fbbf24',
                    transition: 'width 0.3s'
                  }} />
                </div>
                <span style={{ width: '40px', fontSize: '14px', color: '#7f8c8d', textAlign: 'right' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{
          backgroundColor: '#fff',
          padding: '60px 30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>No Reviews Yet</h3>
          <p style={{ color: '#7f8c8d' }}>
            Complete some jobs to start receiving reviews from customers
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                backgroundColor: '#fff',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {/* Review Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                    {review.userId?.name || 'Anonymous Customer'}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <div style={{ 
                  color: '#7f8c8d', 
                  fontSize: '14px',
                  textAlign: 'right'
                }}>
                  {formatDate(review.createdAt)}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p style={{ 
                  color: '#4a5568', 
                  lineHeight: '1.6',
                  margin: 0 
                }}>
                  {review.comment}
                </p>
              )}

              {/* Service Info */}
              {review.serviceId && (
                <div style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#7f8c8d'
                }}>
                  Job: {review.serviceId.title || 'Service Request'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
