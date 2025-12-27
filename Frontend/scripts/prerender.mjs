import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { ThemeProvider } from '../src/context/ThemeContext.jsx';
import { RoleProvider } from '../src/context/RoleContext.jsx';

// Page components
import Home from '../src/pages/Home.jsx';
import About from '../src/pages/About.jsx';
import Contact from '../src/pages/Contact.jsx';
import BrowseServices from '../src/pages/BrowseServices.jsx';
import Login from '../src/pages/Login.jsx';
import PostJob from '../src/pages/PostJob.jsx';
import ServiceDetails from '../src/pages/ServiceDetails.jsx';
import Signup from '../src/pages/Signup.jsx';
import UserDashboard from '../src/pages/UserDashboard.jsx';
import WorkerDashboard from '../src/pages/WorkerDashboard.jsx';

// Paths configuration
const FRONTEND_ROOT = process.cwd(); // assume script executed from Frontend directory
const INDEX_HTML = path.join(FRONTEND_ROOT, 'index.html');
const OUT_DIR = path.join(FRONTEND_ROOT, 'prerender');

if (!fs.existsSync(INDEX_HTML)) {
  console.error('index.html not found. Run from Frontend directory.');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const indexTemplate = fs.readFileSync(INDEX_HTML, 'utf8');

// Simple helper to inject markup into #root
function injectIntoIndex(markup) {
  return indexTemplate.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
}

const pages = [
  { path: '/', name: 'home', Component: Home },
  { path: '/about', name: 'about', Component: About },
  { path: '/contact', name: 'contact', Component: Contact },
  { path: '/browse', name: 'browse-services', Component: BrowseServices },
  { path: '/login', name: 'login', Component: Login },
  { path: '/post', name: 'post-job', Component: PostJob },
  { path: '/service/placeholder', name: 'service-details', Component: ServiceDetails },
  { path: '/signup', name: 'signup', Component: Signup },
  { path: '/user', name: 'user-dashboard', Component: UserDashboard },
  { path: '/worker', name: 'worker-dashboard', Component: WorkerDashboard }
];

console.log(`Prerendering ${pages.length} pages...`);

pages.forEach(({ path: routePath, name, Component }) => {
  try {
    const element = (
      <React.StrictMode>
        <ThemeProvider>
          <RoleProvider>
            <StaticRouter location={routePath}>
              <Component />
            </StaticRouter>
          </RoleProvider>
        </ThemeProvider>
      </React.StrictMode>
    );
    const markup = renderToString(element);
    const fullHtml = injectIntoIndex(markup);
    const filePath = path.join(OUT_DIR, `${name}.html`);
    fs.writeFileSync(filePath, fullHtml, 'utf8');
    console.log(`✔ ${name}.html`);
  } catch (err) {
    console.error(`✖ Failed to prerender ${name}:`, err);
  }
});

console.log('Prerender complete. Output in /prerender');
