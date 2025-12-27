import React, { useState, useEffect } from 'react';
import { ServiceAPI } from '../api/client';
import { useSocket } from '../context/SocketContext';

export default function WorkerMyJobs() {
  const { socket } = useSocket();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, accepted, in-progress, completed

  useEffect(() => {
    fetchJobs();
  }, []);
  
  // Listen for dashboard updates via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleDashboardUpdate = (data) => {
      console.log('💼 My jobs update received:', data);
      fetchJobs(); // Refresh the jobs list
    };
    
    socket.on('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      socket.off('dashboardUpdate', handleDashboardUpdate);
    };
  }, [socket]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await ServiceAPI.getMyJobs();
      setMyJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (jobId) => {
    if (!window.confirm('Mark this job as completed?')) return;
    try {
      await ServiceAPI.completeJob(jobId);
      alert('Job marked as completed!');
      fetchJobs();
    } catch (error) {
      alert('Failed to complete job: ' + error.message);
    }
  };

  const filteredJobs = myJobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#3b82f6';
      case 'in-progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="section-title">My Jobs</h1>
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  const stats = {
    accepted: myJobs.filter(j => j.status === 'accepted').length,
    inProgress: myJobs.filter(j => j.status === 'in-progress').length,
    completed: myJobs.filter(j => j.status === 'completed').length
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">My Accepted Jobs</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.accepted}</div>
          <div style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>Accepted</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>In Progress</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
          <div style={{ fontSize: '.8rem', color: 'var(--color-muted)' }}>Completed</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <button 
          className={filter === 'all' ? 'btn' : 'btn outline'}
          onClick={() => setFilter('all')}
          style={{ fontSize: '.85rem' }}
        >
          All ({myJobs.length})
        </button>
        <button 
          className={filter === 'accepted' ? 'btn' : 'btn outline'}
          onClick={() => setFilter('accepted')}
          style={{ fontSize: '.85rem' }}
        >
          Accepted ({stats.accepted})
        </button>
        <button 
          className={filter === 'in-progress' ? 'btn' : 'btn outline'}
          onClick={() => setFilter('in-progress')}
          style={{ fontSize: '.85rem' }}
        >
          In Progress ({stats.inProgress})
        </button>
        <button 
          className={filter === 'completed' ? 'btn' : 'btn outline'}
          onClick={() => setFilter('completed')}
          style={{ fontSize: '.85rem' }}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Jobs List */}
      <div className="jobs-list-wrapper">
        {filteredJobs.length === 0 ? (
          <div className="card">
            <p style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>
              No jobs found with the selected filter.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredJobs.map(job => (
            <div key={job._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{job.title}</h3>
                <div style={{ 
                  padding: '.25rem .75rem', 
                  borderRadius: '12px', 
                  fontSize: '.7rem', 
                  fontWeight: '600',
                  backgroundColor: getStatusColor(job.status) + '20',
                  color: getStatusColor(job.status)
                }}>
                  {job.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              
              <p style={{ margin: '0 0 .75rem 0', fontSize: '.85rem', lineHeight: '1.5' }}>
                {job.description}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', fontSize: '.8rem', flexWrap: 'wrap', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                <span>📍 {job.city}</span>
                <span>🔧 {job.skill}</span>
                <span>💰 PKR {job.budgetMin} - {job.budgetMax}</span>
                <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <div style={{ 
                backgroundColor: 'var(--color-bg)', 
                padding: '.75rem', 
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '.85rem'
              }}>
                <strong>Customer:</strong> {job.userId?.name} | 📞 {job.userId?.phone} | 📍 {job.userId?.city}
              </div>

              {(job.status === 'accepted' || job.status === 'in-progress') && (
                <button 
                  className="btn" 
                  style={{ fontSize: '.85rem' }}
                  onClick={() => handleComplete(job._id)}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
