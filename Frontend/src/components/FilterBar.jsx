import React from 'react';
import { categories } from '../data/categories.js';
import { citiesByProvince } from '../data/cities.js';

export default function FilterBar({ city, setCity, category, setCategory }) {
  return (
    <div className="filter-bar">
      <select value={city} onChange={e => setCity(e.target.value)}>
        <option value="">All Cities</option>
        {Object.entries(citiesByProvince).map(([province, list]) => (
          <optgroup key={province} label={province}>
            {list.map(c => (
              <option key={c.slug} value={c.name}>{c.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );
}
