import React from 'react';

export default function About() {
  return (
    <div className="section section--pattern">
      <div className="container">
        <h1 className="section-title">About SkillLink</h1>
        <div className="card translucent" style={{ maxWidth: '860px' }}>
          <p style={{ fontSize: '.9rem', lineHeight: '1.5' }}>
            SkillLink is a community-driven platform focused solely on physical, hand-made services. Our mission is to make it effortless for households and small businesses to find reliable local workers for plumbing, carpentry, tailoring, electrical fixes, painting, masonry, gardening and tutoring. We intentionally exclude digital or remote categories to preserve clarity and trust in local craftsmanship.
          </p>
          <p style={{ fontSize: '.9rem', lineHeight: '1.5' }}>
            Whether you are a service receiver needing a repair or a skilled worker growing your local presence, SkillLink provides clean discovery tools, transparent worker profiles and simple role-based dashboards.
          </p>
        </div>
      </div>
    </div>
  );
}
