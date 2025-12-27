import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Header />
      <main 
        id="main" 
        tabIndex={-1} 
        role="main" 
        className={`page-${transitionStage}`}
        style={{ minHeight: '60vh' }}
        onAnimationEnd={() => {
          if (transitionStage === 'fadeOut') {
            setTransitionStage('fadeIn');
            setDisplayLocation(location);
          }
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
