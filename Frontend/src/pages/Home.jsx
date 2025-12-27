import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext.jsx';
import { categories } from '../data/categories.js';
import CategoryCard from '../components/CategoryCard.jsx';

export default function Home() {
  const [titleVisible, setTitleVisible] = useState(false);
  const navigate = useNavigate();
  const { role } = useRole();

  React.useEffect(() => {
    setTimeout(() => setTitleVisible(true), 100);
  }, []);

  return (
    <div className="container">
      {/* Hero Section with Background */}
      <section className="hero hero--with-bg fade-in" style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop") center/cover',
        minHeight: '500px',
        borderRadius: '12px',
        padding: '3rem 2rem'
      }}>
        <div className="hero-content" style={{ color: '#fff' }}>
          <h1 className={titleVisible ? 'title-visible' : ''} style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Welcome to SkillLink</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            Connect with trusted local skilled workers or offer your professional services. 
            SkillLink helps plumbers, carpenters, electricians, tailors, painters, masons, gardeners, and tutors connect with customers in your city.
          </p>
          {!role && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button className="btn" onClick={() => navigate('/signup')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                🚀 Get Started
              </button>
              <button className="btn outline" onClick={() => navigate('/login')} style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'rgba(255,255,255,0.1)', borderColor: '#fff', color: '#fff' }}>
                🔑 Login
              </button>
            </div>
          )}
        </div>
        <div className="hero-card" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.3rem' }}>Why Choose SkillLink?</h2>
          <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '.95rem', lineHeight: '1.6' }}>
            <li>✓ Verified service providers with real ratings</li>
            <li>✓ Easy search by location and skill category</li>
            <li>✓ Direct communication - no middlemen</li>
            <li>✓ Separate dashboards for providers and customers</li>
            <li>✓ Secure and easy to use</li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="section-title slide-up">Service Categories</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-light)' }}>
          Browse our wide range of professional services
        </p>
        <div className="category-grid">
          {categories.map((c) => <CategoryCard key={c.id} icon={c.icon} name={c.name} blurb={c.blurb} />)}
        </div>
      </section>

      {/* About Section */}
      <section className="section" style={{ background: 'var(--card-bg)', padding: '3rem 2rem', borderRadius: '12px', margin: '2rem 0' }}>
        <h2 className="section-title">About SkillLink</h2>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem', color: 'var(--text)' }}>
            SkillLink is a community-driven platform focused solely on physical, hand-made services. Our mission is to make it effortless for households and small businesses to find reliable local workers for plumbing, carpentry, tailoring, electrical fixes, painting, masonry, gardening and tutoring.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text)' }}>
            We intentionally exclude digital or remote categories to preserve clarity and trust in local craftsmanship. Whether you are a service receiver needing a repair or a skilled worker growing your local presence, SkillLink provides clean discovery tools, transparent worker profiles and simple role-based dashboards.
          </p>
        </div>
      </section>

      <section className="section" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 className="section-title">Ready to Get Started?</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-light)' }}>
          Join SkillLink today as a Service Provider or Service Receiver
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '2rem', border: '2px solid var(--border)', borderRadius: '8px', maxWidth: '300px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>🔧 I'm a Service Provider</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)', fontSize: '.9rem' }}>
              Offer your skills and connect with customers looking for your services
            </p>
            {!role && (
              <button className="btn" onClick={() => navigate('/signup')} style={{ width: '100%' }}>
                Sign Up as Provider
              </button>
            )}
          </div>
          <div style={{ padding: '2rem', border: '2px solid var(--border)', borderRadius: '8px', maxWidth: '300px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>🏠 I Need Services</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)', fontSize: '.9rem' }}>
              Find and hire trusted local professionals for your needs
            </p>
            {!role && (
              <button className="btn" onClick={() => navigate('/signup')} style={{ width: '100%' }}>
                Sign Up as Customer
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
