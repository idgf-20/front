import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    passwort: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('userId', result.userId);

        const timetableResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/timetable?userId=${result.userId}`);
        const timetable = await timetableResponse.json();

        if (timetable.length === 0) {
          alert('Erste Anmeldung! Sie haben keine Module. Sie werden zu den Schritten weitergeleitet.');
          navigate('/steps');
        } else {
          navigate('/auswahl');
        }
      } else {
        alert('Fehler beim Login: ' + result.error);
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Login.');
    }
  };

  return (
    <div className="login-page">
      {/**/}
      <div className="login-left">
        {/* Dekorative Kreise */}
        <div className="decorative-circle circle1"></div>
        <div className="decorative-circle circle2"></div>
        <div className="decorative-circle circle3"></div>

        {/**/}
        <img src={`${process.env.PUBLIC_URL}/logow.png`} alt="SPM Logo" className="spm-logo neon-glow" />
        <h2>Dein Weg zu mehr Struktur im Studium</h2>
        <p>Starte kostenlos und verwalte deinen Stundenplan einfach und effizient.</p>
      </div>
      
      {/* */}
      <div className="login-right">
        <div className="login-box">
          <h2>Willkommen</h2>
          <p>Melden Sie sich in Ihrem Konto an</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="input-label">E-Mail</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="mail@beispiel.com" 
              required 
            />

            <label htmlFor="password" className="input-label">Passwort</label>
            <input 
              type="password" 
              id="password" 
              name="passwort" 
              value={formData.passwort} 
              onChange={handleChange} 
              placeholder="********" 
              required 
            />

            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Angemeldet bleiben</label>
              </div>
              <a href="/forgot-password" className="forgot-password">Passwort vergessen?</a>
            </div>

            <button type="submit" className="login-btn">Anmelden</button>

            <p className="register-text">
            Noch kein konto? <a href="/regester">Jetzt regestrieren</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;