import React, { useState } from 'react';
import { citiesByProvince } from '../data/cities.js';
import { ServiceAPI } from '../api/client';
import { useRole } from '../context/RoleContext';

export default function PostJob() {
  const { user } = useRole();
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('plumber');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!city) newErrors.city = 'City is required.';
    if (!description.trim() || description.trim().length < 30) newErrors.description = 'Provide at least 30 characters.';
    if (budget && Number(budget) < 0) newErrors.budget = 'Budget cannot be negative.';
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      if (!user) {
        setErrors({ submit: 'You must be logged in to post a job.' });
        return;
      }
      
      setLoading(true);
      try {
        const jobData = {
          title: title.trim(),
          description: description.trim(),
          skill: category,
          city: city,
          budgetMin: budget ? Number(budget) : 0,
          budgetMax: budget ? Number(budget) : 0,
        };
        
        await ServiceAPI.create(jobData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setTitle(''); setCity(''); setCategory('plumber'); setBudget(''); setDescription('');
      } catch (error) {
        setErrors({ submit: error.message || 'Failed to post job. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="section-title">Post a Job</h1>
      </div>
      <div className="profile-form-wrapper">
        {submitted && (
          <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem' }}>
            Job posted successfully!
          </div>
        )}
        {errors.submit && (
          <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
            {errors.submit}
          </div>
        )}
        <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="form-control">
            <label htmlFor="job-title">Title</label>
            <input id="job-title" placeholder="e.g. Fix bathroom leak" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'job-title-error' : undefined} />
            {errors.title && <span id="job-title-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.title}</span>}
          </div>
          <div className="form-control">
            <label htmlFor="job-city">City</label>
            <select id="job-city" value={city} onChange={e => setCity(e.target.value)} aria-invalid={!!errors.city} aria-describedby={errors.city ? 'job-city-error' : undefined}>
              <option value="">Select city</option>
              {Object.entries(citiesByProvince).map(([province, list]) => (
                <optgroup key={province} label={province}>
                  {list.map(c => (
                    <option key={c.slug} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.city && <span id="job-city-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.city}</span>}
          </div>
          <div className="form-control">
            <label htmlFor="job-category">Category</label>
            <select id="job-category" value={category} onChange={e => setCategory(e.target.value)}>
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
            <label htmlFor="job-budget">Expected Budget (PKR)</label>
            <input id="job-budget" type="number" min="0" placeholder="3000" value={budget} onChange={e => setBudget(e.target.value)} aria-invalid={!!errors.budget} aria-describedby={errors.budget ? 'job-budget-error' : undefined} />
            {errors.budget && <span id="job-budget-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.budget}</span>}
          </div>
        </div>
        <div className="form-control">
          <label htmlFor="job-desc">Description</label>
          <textarea id="job-desc" placeholder="Describe the job requirements, timing, and any materials." value={description} onChange={e => setDescription(e.target.value)} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'job-desc-error' : undefined} />
          {errors.description && <span id="job-desc-error" style={{ color: 'crimson', fontSize: '.7rem' }}>{errors.description}</span>}
        </div>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button type="reset" className="btn outline" onClick={() => { setTitle(''); setCity(''); setCategory('plumber'); setBudget(''); setDescription(''); setErrors({}); }} disabled={loading}>Reset</button>
        </div>
        </form>
      </div>
    </div>
  );
}
