import React, { useEffect } from 'react';
import './Footer.css';

const Footer = () => {
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const footer = document.querySelector('.footer');

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        footer.classList.add('hidden');
      } else {
        footer.classList.remove('hidden');
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="footer">
      <footer>
        <div className="footer-content">
          <p>StudyPlanner&Manager</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
