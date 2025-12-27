import React, { useState, useEffect } from 'react';
import { ServiceAPI } from '../api/client';
import { useSocket } from '../context/SocketContext';

export default function WorkerJobRequests() {
  const { socket } = useSocket();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);
  
  // Listen for dashboard updates via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleDashboardUpdate = (data) => {
      console.log('📋 Job requests update received:', data);
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
      const response = await ServiceAPI.getAvailableJobs();
      setAvailableJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId) => {
    if (!window.confirm('Do you want to accept this job?')) return;
    try {
      await ServiceAPI.acceptJob(jobId);
      alert('Job accepted successfully!');
      fetchJobs(); // Refresh the list
    } catch (error) {
      alert('Failed to accept job: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="section-title">Available Job Requests</h1>
          <p>Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">Available Job Requests</h1>
        <p style={{ fontSize: '.9rem', color: 'var(--color-muted)' }}>
          Jobs matching your skills in your city
        </p>
      </div>
      <div className="jobs-list-wrapper">

      {availableJobs.length === 0 ? (
        <div className="card">
          <p style={{ fontSize: '.85rem', color: 'var(--color-muted)' }}>
            No available jobs at the moment. Check back later!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {availableJobs.map(job => (
            <div key={job._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 .5rem 0', fontSize: '1.1rem' }}>{job.title}</h3>
                  <p style={{ margin: '0 0 .75rem 0', fontSize: '.9rem', lineHeight: '1.5' }}>
                    {job.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '.85rem', flexWrap: 'wrap', color: 'var(--color-muted)' }}>
                    <span>📍 {job.city}</span>
                    <span>🔧 {job.skill}</span>
                    <span>💰 PKR {job.budgetMin} - {job.budgetMax}</span>
                    <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
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

              <button 
                className="btn" 
                onClick={() => handleAccept(job._id)}
              >
                Accept This Job
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
