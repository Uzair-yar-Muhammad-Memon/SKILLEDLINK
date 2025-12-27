import React, { useState, useEffect } from 'react';
import { WorkerAPI, ServiceAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import { useSocket } from '../context/SocketContext';
import WorkerCard from '../components/WorkerCard.jsx';

export default function WorkerDashboard() {
  const { user } = useRole();
  const { socket } = useSocket();
  const [currentWorker, setCurrentWorker] = useState(null);
  const [listed, setListed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('plumber');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [availability, setAvailability] = useState('Within 48 hours');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      console.log('WorkerDashboard fetchData - user:', user);
      
      if (!user) {
        console.log('No user found, checking localStorage...');
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          console.log('Found user in localStorage:', savedUser);
        } else {
          console.log('No user in localStorage either');
          setErrors({ fetch: 'No user logged in. Please login first.' });
          setLoading(false);
          return;
        }
      }
      
      try {
        setLoading(true);
        const workerId = user.id || user._id;
        
        if (!workerId) {
          console.error('No worker ID found in user object:', user);
          setErrors({ fetch: `Unable to load profile. User object: ${JSON.stringify(user)}` });
          setLoading(false);
          return;
        }
        
        console.log('Fetching worker with ID:', workerId);
        const workerResponse = await WorkerAPI.getById(workerId);
        console.log('Worker response:', workerResponse);
        
        const workerData = workerResponse.data;
        const worker = {
          id: workerData.id || workerData._id,
          name: workerData.name,
          skill: workerData.skillCategory?.name || workerData.skillCategory,
          category: workerData.skillCategory?.name?.toLowerCase() || 'general',
          city: workerData.city,
          rating: workerData.ratingAverage || 0,
          description: workerData.bio || 'No bio provided',
          avatar: ''
        };
        
        console.log('Setting currentWorker:', worker);
        setCurrentWorker(worker);
        setCity(workerData.city || '');
        
        // Fetch worker's services
        console.log('Fetching worker services...');
        const servicesResponse = await WorkerAPI.getMyServices();
        console.log('Services response:', servicesResponse);
        setListed(servicesResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ fetch: `Failed to load profile: ${error.message}` });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Listen for dashboard updates via socket
  useEffect(() => {
    if (!socket) return;
    
    const handleDashboardUpdate = (data) => {
      console.log('📊 Worker dashboard update received:', data);
      // Trigger a refresh by toggling a state or refetching
      // For simplicity, we can just show a console message
      // In a real app, you'd refetch the worker's requests/stats
    };
    
    socket.on('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      socket.off('dashboardUpdate', handleDashboardUpdate);
    };
  }, [socket]);

  const addService = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title required.';
    if (!description.trim() || description.trim().length < 20) newErrors.description = 'Min 20 characters.';
    if (!estimatedCost.trim()) newErrors.estimatedCost = 'Cost required.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    
    try {
      const serviceData = {
        title: title.trim(),
        description: description.trim(),
        skill: category,
        city: city,
        budgetMin: Number(estimatedCost) || 0,
        budgetMax: Number(estimatedCost) || 0,
      };
      
      const response = await WorkerAPI.addService(serviceData);
      const newService = response.data;
      
      setListed(l => [newService, ...l]);
      setTitle(''); 
      setCategory('plumber'); 
      setCity(currentWorker?.city || ''); 
      setDescription(''); 
      setEstimatedCost(''); 
      setAvailability('Within 48 hours'); 
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add service. Please try again.' });
    }
  };

  // Debug logging
  console.log('WorkerDashboard render - user:', user, 'loading:', loading, 'currentWorker:', currentWorker, 'errors:', errors);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="section-title">Worker Dashboard</h1>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="section-title">Worker Dashboard</h1>
        </div>
        <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
          {errors.fetch}
        </div>
        <button className="btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!currentWorker && !loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="section-title">Worker Dashboard</h1>
          <p>Unable to load worker profile. User data: {JSON.stringify(user)}</p>
        </div>
        <button className="btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!currentWorker) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">Worker Dashboard</h1>
      </div>
      {errors.submit && (
        <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
          {errors.submit}
        </div>
      )}
      <div style={{ marginBottom: '1.5rem' }}>
        <WorkerCard worker={currentWorker} showActions={false} />
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add Service</h3>
          {errors.submit && (
            <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
              {errors.submit}
            </div>
          )}
          <form onSubmit={addService} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <div className="form-control">
              <label htmlFor="svc-title">Title</label>
              <input id="svc-title" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!errors.title} />
              {errors.title && <span style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.title}</span>}
            </div>
            <div className="form-control">
              <label htmlFor="svc-category">Category</label>
              <select id="svc-category" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="electrician">Electrician</option>
                <option value="tailor">Tailor</option>
                <option value="painter">Painter</option>
                <option value="mason">Mason</option>
                <option value="gardener">Gardener</option>
                <option value="tutor">Tutor</option>
                <option value="repair">Home Repair</option>
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="svc-city">City</label>
              <input id="svc-city" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="form-control">
              <label htmlFor="svc-desc">Description</label>
              <textarea id="svc-desc" value={description} onChange={e => setDescription(e.target.value)} aria-invalid={!!errors.description} />
              {errors.description && <span style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.description}</span>}
            </div>
            <div className="form-grid" style={{ gap: '.75rem' }}>
              <div className="form-control">
                <label htmlFor="svc-cost">Est. Cost (PKR)</label>
                <input id="svc-cost" type="number" min="0" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} aria-invalid={!!errors.estimatedCost} />
                {errors.estimatedCost && <span style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.estimatedCost}</span>}
              </div>
              <div className="form-control">
                <label htmlFor="svc-availability">Availability</label>
                <input id="svc-availability" value={availability} onChange={e => setAvailability(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit">Save Service</button>
              <button type="reset" className="btn outline" onClick={() => { setTitle(''); setCategory('plumber'); setCity(currentWorker?.city || ''); setDescription(''); setEstimatedCost(''); setAvailability('Within 48 hours'); setErrors({}); }}>Reset</button>
            </div>
          </form>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Listed Services</h3>
          {listed.length === 0 && <p style={{ fontSize: '.75rem' }}>No services yet.</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {listed.map(s => (
              <li key={s._id || s.id} style={{ border: '1px solid var(--color-border)', borderRadius: '6px', padding: '.55rem .7rem', fontSize: '.7rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                <strong style={{ fontSize: '.75rem' }}>{s.title}</strong>
                <span style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', color: 'var(--color-muted)' }}>
                  <span>{s.skill || s.category}</span>
                  <span>{s.city}</span>
                  <span>PKR {s.budgetMin || s.estimatedCost}</span>
                  <span>{s.status || s.availability}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
