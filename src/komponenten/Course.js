import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Course.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    fetchSelectedCourses(userId);
  }, [navigate]);

  const fetchSelectedCourses = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/selected-courses?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Kurse');
      }
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Fehler:', error);
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  function redirectToPlan() {
    navigate('/auswahl');
  }

  function redirectToVisualization() {
    navigate('/visualisierung');
  }

  function redirectToTimetable() {
    navigate('/fileUpload');
  }



  const redirectToPraktikum = () => {
    navigate('/praktikum');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (courses.length === 0) {
    return <div>Keine Kurse gefunden, die Sie ausgewählt haben.</div>;
  }

  return (
    <main id="mainAuswahl">
      {/* Sidebar */}
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
        <button className="praktikum-button" onClick={redirectToPraktikum}>
          Praktikum
        </button>
      </div>

      {/* Content */}
      <div className={`content ${menuOpen ? 'shifted' : ''}`}>
        <div className="burger-menu" onClick={toggleMenu}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </div>

        <div className="courses-container">
          <h1>Ausgewählte Kurse</h1>
          <table className="courses-table">
            <thead>
              <tr>
                <th>Kursname</th>
                <th>Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Courses;
