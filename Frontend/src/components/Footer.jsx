import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>SkillLink</h4>
            <p style={{ fontSize: '.75rem', lineHeight: '1.3' }}>Connecting local communities with reliable skilled workers for physical, hand-made services only.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <a href="/browse">Plumbing</a>
            <a href="/browse">Carpentry</a>
            <a href="/browse">Electrician</a>
            <a href="/browse">Tailoring</a>
            <a href="/browse">Painting</a>
            <a href="/browse">Masonry</a>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/post">Post a Job</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} SkillLink. All rights reserved.</div>
      </div>
    </footer>
  );
}
