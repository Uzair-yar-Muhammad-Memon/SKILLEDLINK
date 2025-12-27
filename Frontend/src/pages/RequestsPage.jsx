import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import { useSocket } from '../context/SocketContext';
import ReviewModal from '../components/ReviewModal';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const { role } = useRole();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, [filter, role]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for request status updates
    const handleRequestAccepted = () => {
      console.log('🔔 Real-time: Request accepted, reloading...');
      loadRequests();
    };

    const handleRequestCompleted = () => {
      console.log('🔔 Real-time: Request completed, reloading...');
      loadRequests();
    };

    const handleRequestRejected = () => {
      console.log('🔔 Real-time: Request rejected, reloading...');
      loadRequests();
    };

    const handleNewRequest = () => {
      console.log('🔔 Real-time: New request received, reloading...');
      loadRequests();
    };
    
    const handleDashboardUpdate = (data) => {
      console.log('🔔 Real-time: Dashboard update received:', data);
      loadRequests();
    };

    socket.on('requestAccepted', handleRequestAccepted);
    socket.on('requestCompleted', handleRequestCompleted);
    socket.on('requestRejected', handleRequestRejected);
    socket.on('newServiceRequest', handleNewRequest);
    socket.on('dashboardUpdate', handleDashboardUpdate);

    return () => {
      socket.off('requestAccepted', handleRequestAccepted);
      socket.off('requestCompleted', handleRequestCompleted);
      socket.off('requestRejected', handleRequestRejected);
      socket.off('newServiceRequest', handleNewRequest);
      socket.off('dashboardUpdate', handleDashboardUpdate);
    };
  }, [socket]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'all' ? null : filter;
      
      const response = role === 'user' 
        ? await RequestAPI.getUserRequests(statusFilter)
        : await RequestAPI.getWorkerRequests(statusFilter);
      
      console.log('Loaded requests:', response.data);
      if (response.data) {
        response.data.forEach(req => {
          console.log(`Request ${req._id}: status = ${req.status}`);
        });
      }
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!window.confirm('Accept this service request? The work will be marked as in-progress.')) return;
    
    try {
      console.log('Accepting request:', requestId);
      const response = await RequestAPI.accept(requestId);
      console.log('Accept response:', response);
      console.log('New status should be:', response.data?.status);
      alert('✅ Request accepted! Work is now in progress. You can message the customer.');
      await loadRequests();
    } catch (error) {
      console.error('Accept error:', error);
      alert('Failed to accept request: ' + error.message);
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('Why are you declining this request? (optional)');
    if (reason === null) return;
    
    try {
      await RequestAPI.reject(requestId, reason);
      alert('Request declined.');
      loadRequests();
    } catch (error) {
      alert('Failed to reject request: ' + error.message);
    }
  };

  const handleComplete = async (requestId) => {
    if (!window.confirm('Mark this job as completed? Customer will be notified.')) return;
    
    try {
      await RequestAPI.complete(requestId);
      alert('✅ Job marked as completed! Customer can now leave a review.');
      loadRequests();
    } catch (error) {
      alert('Failed to complete request: ' + error.message);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Cancel this service request?')) return;
    
    try {
      await RequestAPI.cancel(requestId);
      alert('Request cancelled.');
      loadRequests();
    } catch (error) {
      alert('Failed to cancel request: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      accepted: '#10b981',
      rejected: '#ef4444',
      'in-progress': '#3b82f6',
      completed: '#6366f1',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      low: { bg: '#e0f2fe', color: '#0369a1' },
      medium: { bg: '#fef3c7', color: '#92400e' },
      high: { bg: '#fed7aa', color: '#9a3412' },
      urgent: { bg: '#fecaca', color: '#991b1b' }
    };
    const style = styles[urgency] || styles.medium;
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        background: style.bg,
        color: style.color
      }}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading requests...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>{role === 'user' ? 'My Service Requests' : 'Job Requests'}</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
        {role === 'user' 
          ? 'View and manage your service requests'
          : 'View and respond to service requests from customers'}
      </p>

      {/* Status Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        flexWrap: 'wrap', 
        marginBottom: '2rem',
        overflowX: 'auto',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        {['all', 'pending', 'in-progress', 'completed', 'rejected', 'cancelled'].map((status) => {
          const counts = {
            all: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            'in-progress': requests.filter(r => r.status === 'in-progress').length,
            completed: requests.filter(r => r.status === 'completed').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
            cancelled: requests.filter(r => r.status === 'cancelled').length
          };
          
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={filter === status ? 'btn' : 'btn outline'}
              style={{ 
                fontSize: '0.9rem', 
                padding: '0.5rem 1rem',
                position: 'relative'
              }}
            >
              {status === 'all' ? '📝 All' : 
               status === 'pending' ? '⏳ Pending' :
               status === 'in-progress' ? '🔨 In Progress' :
               status === 'completed' ? '✅ Completed' :
               status === 'rejected' ? '❌ Rejected' :
               '🚫 Cancelled'}
              {counts[status] > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  background: filter === status ? 'rgba(255,255,255,0.3)' : 'var(--primary)',
                  color: filter === status ? 'white' : 'white',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {counts[status]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'var(--card-bg)', 
          borderRadius: '12px' 
        }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
            No {filter !== 'all' ? filter : ''} requests found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((request) => (
            <div 
              key={request._id} 
              style={{ 
                padding: '1.5rem', 
                background: 'var(--card-bg)', 
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{request.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    <span>
                      {role === 'user' 
                        ? `👷 ${request.worker?.name}` 
                        : `👤 ${request.user?.name}`}
                    </span>
                    <span>📍 {request.location}</span>
                    {request.budget && <span>💰 ₨{request.budget}</span>}
                    {getUrgencyBadge(request.urgency)}
                  </div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '8px', 
                  background: getStatusColor(request.status),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  {request.status.toUpperCase()}
                  {/* Debug: show raw status */}
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.25rem' }}>({request.status})</span>
                </div>
              </div>

              <p style={{ margin: '1rem 0', color: 'var(--text)' }}>
                {request.description}
              </p>

              {/* Status Information Box for Users */}
              {role === 'user' && (
                <div style={{
                  padding: '0.75rem',
                  background: request.status === 'pending' ? '#fef3c7' : 
                             request.status === 'in-progress' ? '#dbeafe' : 
                             request.status === 'completed' ? '#d1fae5' : 
                             request.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  borderLeft: `4px solid ${getStatusColor(request.status)}`
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                    {request.status === 'pending' && '⏳ Status: Waiting for Provider Response'}
                    {request.status === 'in-progress' && '🔨 Status: Work In Progress'}
                    {request.status === 'completed' && '✅ Status: Work Completed'}
                    {request.status === 'rejected' && '❌ Status: Provider Declined'}
                    {request.status === 'cancelled' && '🚫 Status: Cancelled'}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
                    {request.status === 'pending' && `Your request has been sent to ${request.worker?.name}. You'll be notified once they respond.`}
                    {request.status === 'in-progress' && `${request.worker?.name} has accepted your request and is currently working on it. You can message them below.`}
                    {request.status === 'completed' && `${request.worker?.name} has completed the work${request.completedDate ? ` on ${new Date(request.completedDate).toLocaleDateString()}` : ''}. Please leave a review!`}
                    {request.status === 'rejected' && `${request.worker?.name} declined this request.${request.workerNotes ? ' See their notes below.' : ''}`}
                    {request.status === 'cancelled' && 'You cancelled this request.'}
                  </p>
                </div>
              )}

              {request.workerNotes && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'var(--bg)', 
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  borderLeft: '3px solid var(--primary)'
                }}>
                  <strong>Worker Notes:</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{request.workerNotes}</p>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap', 
                marginTop: '1rem' 
              }}>
                {/* Worker actions */}
                {role === 'worker' && request.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleAccept(request._id)}
                      className="btn"
                      style={{ fontSize: '0.9rem' }}
                    >
                      ✅ Accept & Start Work
                    </button>
                    <button 
                      onClick={() => handleReject(request._id)}
                      className="btn outline"
                      style={{ fontSize: '0.9rem' }}
                    >
                      ❌ Decline
                    </button>
                  </>
                )}

                {role === 'worker' && request.status === 'in-progress' && (
                  <>
                    <button 
                      onClick={() => handleComplete(request._id)}
                      className="btn"
                      style={{ fontSize: '0.9rem', background: '#10b981' }}
                    >
                      ✓ Mark as Completed
                    </button>
                    <button 
                      onClick={() => navigate(`/messages/${request._id}`)}
                      className="btn outline"
                      style={{ fontSize: '0.9rem' }}
                    >
                      💬 Message Customer
                    </button>
                  </>
                )}

                {role === 'worker' && request.status === 'completed' && (
                  <button 
                    onClick={() => navigate(`/messages/${request._id}`)}
                    className="btn outline"
                    style={{ fontSize: '0.9rem' }}
                  >
                    💬 Message Customer
                  </button>
                )}

                {/* User actions */}
                {role === 'user' && request.status === 'pending' && (
                  <button 
                    onClick={() => handleCancel(request._id)}
                    className="btn outline"
                    style={{ fontSize: '0.9rem' }}
                  >
                    🚫 Cancel Request
                  </button>
                )}

                {role === 'user' && request.status === 'in-progress' && (
                  <button 
                    onClick={() => navigate(`/messages/${request._id}`)}
                    className="btn outline"
                    style={{ fontSize: '0.9rem' }}
                  >
                    💬 Message Worker
                  </button>
                )}

                {role === 'user' && request.status === 'completed' && (
                  <button 
                    onClick={() => navigate(`/messages/${request._id}`)}
                    className="btn outline"
                    style={{ fontSize: '0.9rem' }}
                  >
                    💬 Message Worker
                  </button>
                )}

                {/* Review button for completed jobs (users only) */}
                {role === 'user' && request.status === 'completed' && request.worker && (
                  <button 
                    onClick={() => {
                      setSelectedWorker(request.worker);
                      setReviewModalOpen(true);
                    }}
                    className="btn"
                    style={{ fontSize: '0.9rem', background: '#fbbf24', color: '#000' }}
                  >
                    ⭐ Leave Review
                  </button>
                )}

                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: '0.85rem', 
                  color: 'var(--text-light)',
                  alignSelf: 'center'
                }}>
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
            loadRequests();
          }}
        />
      )}
    </div>
  );
}
