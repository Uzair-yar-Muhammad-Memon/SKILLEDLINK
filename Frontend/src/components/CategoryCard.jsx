import React from 'react';

export default function CategoryCard({ icon, name, blurb }) {
  return (
    <div className="category-card" aria-label={name}>
      <div className="category-icon" aria-hidden="true">{icon}</div>
      <h3>{name}</h3>
      <p>{blurb}</p>
    </div>
  );
}
