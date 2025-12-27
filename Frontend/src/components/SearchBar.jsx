import React, { useState } from 'react';
import { categories } from '../data/categories.js';
import { cities } from '../data/cities.js';

export default function SearchBar({ onSearch }) {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');

  const submit = e => {
    e.preventDefault();
    onSearch({ city, category });
  };

  return (
    <form className="search-bar" onSubmit={submit} role="search" aria-label="Search workers by city and category">
      <input list="city-list" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
      <datalist id="city-list">
        {cities.map(c => <option key={c.slug} value={c.name} />)}
      </datalist>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button type="submit">Search</button>
    </form>
  );
}
