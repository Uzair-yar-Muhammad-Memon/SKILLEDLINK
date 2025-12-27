import React, { useState, useEffect, useMemo } from 'react';
import { WorkerAPI } from '../api/client';
import { useRole } from '../context/RoleContext';
import FilterBar from '../components/FilterBar.jsx';
import WorkerCard from '../components/WorkerCard.jsx';

export default function BrowseServices() {
  const { user } = useRole();
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('nearest'); // nearest, rating, name

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        console.log('Fetching workers with filters - city:', city, 'category:', category);
        const response = await WorkerAPI.list({ city, category });
        console.log('Workers API response:', response);
        const workersData = (response.data || []).map(w => ({
          id: w._id,
          name: w.name,
          skill: w.skillCategory?.name || 'General',
          category: w.skillCategory?.name?.toLowerCase() || 'general',
          city: w.city,
          rating: w.ratingAverage || 0,
          reviewCount: w.reviewCount || 0,
          description: w.bio || 'Skilled worker available for hire',
          avatar: '',
          phone: w.phone,
          availabilityStatus: w.availabilityStatus || 'available'
        }));
        console.log('Mapped workers data:', workersData);
        setWorkers(workersData);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkers();
  }, [city, category]);

  const filtered = useMemo(() => {
    let result = workers;
    
    // Apply search filter
    if (query) {
      result = result.filter(w => {
        return w.description.toLowerCase().includes(query.toLowerCase()) || 
               w.name.toLowerCase().includes(query.toLowerCase()) ||
               w.skill.toLowerCase().includes(query.toLowerCase()) ||
               w.city.toLowerCase().includes(query.toLowerCase());
      });
    }
    
    // Apply sorting
    if (sortBy === 'nearest' && user?.city) {
      result = [...result].sort((a, b) => {
        // Prioritize same city
        if (a.city === user.city && b.city !== user.city) return -1;
        if (a.city !== user.city && b.city === user.city) return 1;
        return 0;
      });
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  }, [workers, query, sortBy, user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">🔍 Browse Service Providers</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
          Find trusted local skilled workers by skill category and city. View profiles, ratings, and reviews before sending a service request.
        </p>
      </div>
      
      <FilterBar city={city} setCity={setCity} category={category} setCategory={setCategory} />
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ 
            padding: '.55rem .7rem', 
            border: '1px solid var(--color-border)', 
            borderRadius: '8px', 
            flex: '1',
            minWidth: '250px',
            fontSize: '.9rem'
          }}
          placeholder="Search by name, skill, city, or keyword..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          style={{ 
            padding: '.55rem .7rem', 
            border: '1px solid var(--color-border)', 
            borderRadius: '8px',
            fontSize: '.9rem'
          }}
        >
          <option value="nearest">Nearest to Me</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading workers...</p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', fontSize: '.85rem', color: 'var(--color-muted)' }}>
            Found {filtered.length} worker{filtered.length !== 1 ? 's' : ''}
            {user?.city && sortBy === 'nearest' && ` (prioritizing ${user.city})`}
          </div>
          <div className="worker-grid">
            {filtered.map(w => <WorkerCard key={w.id} worker={w} />)}
          </div>
          {filtered.length === 0 && (
            <div className="alert" role="status">
              No workers match your filters. Try adjusting your search criteria.
            </div>
          )}
        </>
      )}
    </div>
  );
}
