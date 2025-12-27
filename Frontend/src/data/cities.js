// Expanded Pakistan city list by province. Keep names normalized (Title Case) for UI consistency.
// You can add/remove entries; ensure each object has a unique slug.

export const cities = [
  // Federal / Capital Territory
  { name: 'Islamabad', province: 'Federal', slug: 'islamabad' },

  // Punjab
  { name: 'Lahore', province: 'Punjab', slug: 'lahore' },
  { name: 'Faisalabad', province: 'Punjab', slug: 'faisalabad' },
  { name: 'Rawalpindi', province: 'Punjab', slug: 'rawalpindi' },
  { name: 'Multan', province: 'Punjab', slug: 'multan' },
  { name: 'Gujranwala', province: 'Punjab', slug: 'gujranwala' },
  { name: 'Sialkot', province: 'Punjab', slug: 'sialkot' },
  { name: 'Bahawalpur', province: 'Punjab', slug: 'bahawalpur' },
  { name: 'Sheikhupura', province: 'Punjab', slug: 'sheikhupura' },

  // Sindh
  { name: 'Karachi', province: 'Sindh', slug: 'karachi' },
  { name: 'Hyderabad', province: 'Sindh', slug: 'hyderabad' },
  { name: 'Sukkur', province: 'Sindh', slug: 'sukkur' },
  { name: 'Khairpur', province: 'Sindh', slug: 'khairpur' },
  { name: 'Gambat', province: 'Sindh', slug: 'gambat' },
  { name: 'Larkana', province: 'Sindh', slug: 'larkana' },
  { name: 'Nawabshah', province: 'Sindh', slug: 'nawabshah' },
  { name: 'Mirpur Khas', province: 'Sindh', slug: 'mirpur-khas' },

  // Khyber Pakhtunkhwa
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', slug: 'peshawar' },
  { name: 'Mardan', province: 'Khyber Pakhtunkhwa', slug: 'mardan' },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', slug: 'abbottabad' },
  { name: 'Swat', province: 'Khyber Pakhtunkhwa', slug: 'swat' },
  { name: 'Kohat', province: 'Khyber Pakhtunkhwa', slug: 'kohat' },

  // Balochistan
  { name: 'Quetta', province: 'Balochistan', slug: 'quetta' },
  { name: 'Gwadar', province: 'Balochistan', slug: 'gwadar' },
  { name: 'Khuzdar', province: 'Balochistan', slug: 'khuzdar' },
  { name: 'Turbat', province: 'Balochistan', slug: 'turbat' },

  // Gilgit-Baltistan
  { name: 'Gilgit', province: 'Gilgit-Baltistan', slug: 'gilgit' },
  { name: 'Skardu', province: 'Gilgit-Baltistan', slug: 'skardu' },

  // Azad Kashmir
  { name: 'Muzaffarabad', province: 'Azad Kashmir', slug: 'muzaffarabad' },
  { name: 'Mirpur', province: 'Azad Kashmir', slug: 'mirpur' }
];

// Grouped map (province => array of cities) if needed for UI sections
export const citiesByProvince = cities.reduce((acc, c) => {
  acc[c.province] = acc[c.province] || [];
  acc[c.province].push(c);
  return acc;
}, {});
