import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
  <div className="header">
    <header>
      <div className="header-content">
        <img src="./logow.png" alt="Logo" className="logo" />
        <h1>StudyPlanner&Manager</h1>
      </div>
    </header>
  </div>
);

export default Header;
