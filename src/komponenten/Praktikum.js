import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Praktikum.css';

const Praktikum = () => {
  const [praktikumEntries, setPraktikumEntries] = useState([]);
  const [formData, setFormData] = useState({
    kurs: '',
    datum: '',
    uhrzeit_start: '',
    uhrzeit_end: '',
    beschreibung: '',
    raum: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    fetchPractikumEntries(userId);
  }, [navigate]);

  const fetchPractikumEntries = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/praktikum/user?student_id=${userId}`);
      const data = await response.json();
      setPraktikumEntries(data);
    } catch (error) {
      console.error('Error fetching praktikum entries:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('User ID not found.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/praktikum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          student_id: userId, 
          uhrzeit: `${formData.uhrzeit_start} - ${formData.uhrzeit_end}`
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setPraktikumEntries((prevEntries) => [...prevEntries, newEntry]);
        setFormData({ kurs: '', datum: '', uhrzeit_start: '', uhrzeit_end: '', beschreibung: '', raum: '' });
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert('Error adding praktikum: ' + error.error);
      }
    } catch (error) {
      console.error('Error adding praktikum entry:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/praktikum/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPraktikumEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      } else {
        const error = await response.json();
        alert('Error deleting praktikum: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting praktikum entry:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  function redirectToPlan() {
    window.location.href = 'auswahl';
  }
  const redirectToTimetable = () => {
    navigate('/fileUpload');
  };

  const redirectToVisualization = () => {
    navigate('/visualisierung');
  };

  const redirectToMeineFaecher = () => {
    navigate('/meine-faecher');
  };

  const renderEntries = () => {
    return praktikumEntries.map((entry) => (
      <tr key={entry.id}>
        <td>{entry.kurs}</td>
        <td>{new Date(entry.datum).toLocaleDateString('de-DE')}</td>
        <td>{entry.uhrzeit}</td>
        <td>{entry.beschreibung}</td>
        <td>{entry.raum}</td>
        {showDeleteButtons && (
          <td>
            <button onClick={() => handleDelete(entry.id)} className="delete">
              Löschen
            </button>
          </td>
        )}
      </tr>
    ));
  };

  return (
    <main id="mainPraktikum">
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <button className="uploadJsonButton1" onClick={redirectToTimetable}>
          HTML-Datei hochladen
        </button>
        <button className="visualize-button" onClick={redirectToPlan}>
          Plan anzeigen
        </button>
        <button className="visualize-button" onClick={redirectToVisualization}>
          Zur Visualisierung
        </button>
        <button className="course-button" onClick={redirectToMeineFaecher}>
          Module Infos
        </button>
      </div>

      <div className={`content ${menuOpen ? 'shifted' : ''}`}>
        <div className="burger-menu" onClick={toggleMenu}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </div>

        <h1>Praktikum Einträge</h1>
        <div className="controls">
          <button onClick={() => setShowAddForm(!showAddForm)} className="eintragHinzufügen">
            {showAddForm ? 'Formular verbergen' : 'Neuen Eintrag hinzufügen'}
          </button>

          <button onClick={() => setShowDeleteButtons(!showDeleteButtons)} className="loechenAnzeigen">
            {showDeleteButtons ? 'Löschen verbergen' : 'Löschen anzeigen'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="add-form">
            <input type="text" name="kurs" value={formData.kurs} onChange={handleChange} placeholder="Kurs" required />
            <input type="date" name="datum" value={formData.datum} onChange={handleChange} required />
            <input type="time" name="uhrzeit_start" value={formData.uhrzeit_start} onChange={handleChange} required />
            <input type="time" name="uhrzeit_end" value={formData.uhrzeit_end} onChange={handleChange} required />
            <input type="text" name="beschreibung" value={formData.beschreibung} onChange={handleChange} placeholder="Beschreibung" required />
            <input type="text" name="raum" value={formData.raum} onChange={handleChange} placeholder="Raum" required />
            <button type="submit" className="inFormularHinzufuegen">Eintrag hinzufügen</button>
          </form>
        )}

        <table className="praktikum-table">
          <thead>
            <tr>
              <th>Kurs</th>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Beschreibung</th>
              <th>Raum</th>
              {showDeleteButtons && <th>Aktion</th>}
            </tr>
          </thead>
          <tbody>{renderEntries()}</tbody>
        </table>
      </div>
    </main>
  );
};

export default Praktikum;
