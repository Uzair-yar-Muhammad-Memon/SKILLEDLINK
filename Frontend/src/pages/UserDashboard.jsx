import React, { useState, useEffect } from 'react';
import { ServiceAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';

export default function UserDashboard() {
  const { user } = useRole();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, total: 0 });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await ServiceAPI.getMyRequests();
      const requests = response.data || [];
      setMyRequests(requests);
      
      // Calculate stats
      const pending = requests.filter(r => r.status === 'pending').length;
      const accepted = requests.filter(r => r.status === 'accepted' || r.status === 'in-progress').length;
      const completed = requests.filter(r => r.status === 'completed').length;
      setStats({ pending, accepted, completed, total: requests.length });
      console.log('📊 Stats updated:', { pending, accepted, completed, total: requests.length });
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);
  
  // Listen for dashboard updates via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleDashboardUpdate = (data) => {
      console.log('📊 Dashboard update received:', data);
      fetchData(); // Refresh dashboard data
    };
    
    socket.on('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      socket.off('dashboardUpdate', handleDashboardUpdate);
    };
  }, [socket, fetchData]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this job request?')) return;
    try {
      await ServiceAPI.cancelJob(id);
      setMyRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r));
    } catch (error) {
      alert('Failed to cancel job: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'in-progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="section-title">🏠 Service Receiver Dashboard</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">🏠 Service Receiver Dashboard</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
          Welcome back, {user?.name || 'User'}! Find services and manage your requests.
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.total}</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Requests</div>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Pending</div>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔄</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.accepted}</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Active Jobs</div>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Completed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => navigate('/browse')}
            style={{ padding: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
            Browse Service Providers
          </button>
          <button 
            className="btn outline" 
            onClick={() => navigate('/user/requests')}
            style={{ padding: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '1.5rem' }}>📬</span>
            View My Requests
          </button>
          <button 
            className="btn outline" 
            onClick={() => navigate('/user/profile')}
            style={{ padding: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            My Profile
          </button>
          <button 
            className="btn outline" 
            onClick={() => window.location.href = '/contact'}
            style={{ padding: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
          >
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            Contact Support
          </button>
        </div>
      </div>

      {/* My Job Requests */}
      <div className="jobs-list-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>📋 My Service Requests</h2>
          <button className="btn" onClick={() => navigate('/browse')}>
            🔍 Find Service Providers
          </button>
        </div>
        
        {myRequests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
              You haven't sent any service requests yet.
            </p>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Browse service providers by skill and location, view their profiles, and send a request to the one you want to hire.
            </p>
            <button className="btn" onClick={() => navigate('/browse')}>
              🔍 Browse Service Providers
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myRequests.map(job => (
              <div key={job._id} style={{ 
                padding: '1.5rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{job.title}</h3>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: getStatusColor(job.status),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    textTransform: 'capitalize'
                  }}>
                    {job.status}
                  </span>
                </div>
                <p style={{ margin: '0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  {job.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                  <span>📍 {job.city}</span>
                  <span>🔧 {job.skill}</span>
                  <span>💰 ${job.budgetMin} - ${job.budgetMax}</span>
                  <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.status === 'pending' && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn outline" 
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                      onClick={() => handleCancel(job._id)}
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
                {job.status === 'completed' && (
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      className="btn" 
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: '#fbbf24', color: '#000' }}
                      onClick={() => {
                        // Extract worker info from job
                        const workerData = {
                          _id: job.workerId || job.worker?._id,
                          name: job.workerName || job.worker?.name || 'Worker',
                        };
                        setSelectedWorker(workerData);
                        setReviewModalOpen(true);
                      }}
                    >
                      ⭐ Leave Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedWorker && (
        <ReviewModal
          worker={selectedWorker}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedWorker(null);
          }}
          onSuccess={() => {
            alert('✅ Thank you for your review!');
            // Optionally refresh requests
          }}
        />
      )}
    </div>
  );
}
