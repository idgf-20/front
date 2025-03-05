import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Regester.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    vorname: '',
    email: '',
    passwort: '',
    passwortwiederholen: ''
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

    // Überprüfen, ob die Passwörter übereinstimmen
    if (formData.passwort !== formData.passwortwiederholen) {
      alert('Die Passwörter stimmen nicht überein.');
      return;
    }

    try {
      // Verwenden des ursprünglichen API-URLs und Logik zum Erstellen des Benutzers
      const response = await fetch('http://localhost:3000/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          vorname: formData.vorname,
          email: formData.email,
          passwort: formData.passwort
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Registrierung erfolgreich!');
        // Formular zurücksetzen
        setFormData({
          name: '',
          vorname: '',
          email: '',
          passwort: '',
          passwortwiederholen: ''
        });
        // Zur Login-Seite navigieren
        navigate('/');
      } else {
        alert('Fehler bei der Registrierung: ' + result.error);
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="register-page">
      {/* Linke Seite mit dem dekorativen Hintergrund */}
      <div className="register-left">
        <div className="circle1"></div>
        <div className="circle2"></div>
        <div className="circle3"></div>

        <img src={`${process.env.PUBLIC_URL}/logow.png`} alt="SPM Logo" />
        <h2>Trete unserer Gemeinschaft bei</h2>
      </div>

      {/* Rechte Seite mit dem Formular */}
      <div className="register-right">
        <div className="register-box">
          <h2>Konto erstellen</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Nachname</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Geben Sie Ihren Nachnamen ein"
              required
            />

            <label htmlFor="vorname">Vorname</label>
            <input
              type="text"
              id="vorname"
              name="vorname"
              value={formData.vorname}
              onChange={handleChange}
              placeholder="Geben Sie Ihren Vornamen ein"
              required
            />

            <label htmlFor="email">E-Mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mail@beispiel.com"
              required
            />

            <label htmlFor="passwort">Passwort</label>
            <input
              type="password"
              id="passwort"
              name="passwort"
              value={formData.passwort}
              onChange={handleChange}
              placeholder="********"
              required
            />

            <label htmlFor="passwortwiederholen">Passwort wiederholen</label>
            <input
              type="password"
              id="passwortwiederholen"
              name="passwortwiederholen"
              value={formData.passwortwiederholen}
              onChange={handleChange}
              placeholder="********"
              required
            />

            <button type="submit" className="register-btn">Registrieren</button>

            <p className="register-text">
              Haben Sie schon ein Konto? <a href="/">Anmelden</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
