import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf'; // Importieren der PDF-Bibliothek
import 'jspdf-autotable'; // Importieren von autoTable
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons';
import './Auswahl.css';

const Auswahl = () => {
  const [timetable, setTimetable] = useState([]);
  const [userId, setUserId] = useState(null);
  const [courseColors, setCourseColors] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // Redirect to login page if the user is not logged in
      navigate('/');
      return;
    }
    setUserId(storedUserId);
    fetchTimetable(storedUserId);
    fetchCourseColors(storedUserId);
  }, [navigate]);

  

  const fetchTimetable = (userId) => {
    fetch(`http://localhost:3000/api/timetable?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => setTimetable(data))
      .catch((error) => console.error('Fehler beim Laden des Stundenplans:', error));
  };

  const fetchCourseColors = (userId) => {
    fetch(`http://localhost:3000/api/courseColors?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => setCourseColors(data))
      .catch((error) => console.error('Fehler beim Laden der Farben:', error));
  };

  const handleColorChange = (course, color) => {
    // Update local state for immediate UI feedback
    setCourseColors((prevColors) => ({
      ...prevColors,
      [course]: color,
    }));
  
    fetch('http://localhost:3000/api/courseColor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, course, color }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Optionally re-fetch colors to ensure the state is in sync with the backend
        fetchCourseColors(userId);
      })
      .catch((error) => console.error('Fehler beim Speichern der Farbe:', error));
  };
  

  const handleDeleteEntry = (id) => {
    // Zuerst den Eintrag aus dem Zustand entfernen
    setTimetable((prevTimetable) => prevTimetable.filter((entry) => entry.id !== id));

    // Dann die Löschanfrage an den Server senden
    fetch(`http://localhost:3000/api/timetable/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Fehler beim Löschen des Eintrags');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Eintrag erfolgreich gelöscht:', data);
      })
      .catch((error) => {
        console.error('Fehler beim Löschen des Eintrags:', error);
      });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); 
    doc.text('StudyPlannerManager', 50, 25); 
    const startY = 50;
  
    const tableColumns = ['Zeit', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const tableRows = [];
  
    const timeslots = [
      '08:00-09:00',
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
    ];
  
    const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  
    timeslots.forEach((time) => {
      const row = [time];
      days.forEach((day) => {
        const entry = timetable.find(
          (item) => item.tag === day && item.zeit === time
        );
        const cellContent = entry
          ? `${entry.kurs}\n(${entry.prof})\n${entry.raum}`
          : '-';
        row.push(cellContent);
      });
      tableRows.push(row);
    });
  
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: startY,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });
  
    doc.save('Stundenplan.pdf');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const renderTableData = () => {
    const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const timeslots = [
      '08:00-09:00',
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
    ];

    return timeslots.map((time) => (
      <tr key={time}>
        <td className="time-slot">{time}</td>
        {days.map((day) => {
          const entries = timetable.filter(
            (item) => item.tag === day && item.zeit === time
          );

          return (
            <td key={day}>
              {entries.length > 0 ? (
                <div className="multiple-entries">
                  {entries.map((entry, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '5px',
                        marginBottom: '5px',
                        backgroundColor: courseColors[entry.kurs] || '#f0f0f0',
                        borderRadius: '5px',
                      }}
                    >
                      <div>
                        <strong>{entry.kurs}</strong>
                      </div>
                      <div>{entry.prof}</div>
                      <div>{entry.raum}</div>
                      {/* Farbauswahl */}
                      <div className="color-picker-wrapper">
                        <FontAwesomeIcon
                          icon={faEyeDropper}
                          className="color-picker-icon"
                          onClick={() =>
                            document.getElementById(`color-picker-${entry.kurs}`).click()
                          }
                        />
                        <span className="color-picker-text">Farbe ändern</span>
                        <span className="color-picker-tooltip">
                          Hier klicken, um Farbe zu ändern
                        </span>
                        <input
                          id={`color-picker-${entry.kurs}`}
                          type="color"
                          value={courseColors[entry.kurs] || '#f0f0f0'}
                          onChange={(e) => handleColorChange(entry.kurs, e.target.value)}
                          className="color-picker-input"
                        />
                      </div>
                      {showDeleteButtons && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          Löschen
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-slot">-</div>
              )}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <main id="mainAuswahl">
      {/* Sidebar mit Burger-Menü */}
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <button className="toggle-delete-button" onClick={() => setShowDeleteButtons(!showDeleteButtons)}>
          {showDeleteButtons ? 'Löschen ausblenden' : 'Löschen anzeigen'}
        </button>
        <button className="uploadJsonButton1" onClick={() => navigate('/fileUpload')}>
          Datei hochladen
        </button>
        <button className="download-pdf-button" onClick={handleDownloadPdf}>
          Plan als PDF
        </button>
        <button onClick={() => navigate('/visualisierung')}>Zur Visualisierung</button>
        <button onClick={() => navigate('/meine-faecher')}>Module Infos</button>
        <button onClick={() => navigate('/praktikum')}>Praktikum</button>
        <button onClick={() => navigate('/')}>Abmelden</button>
      </div>

      <div className={`content ${menuOpen ? 'shifted' : ''}`}>
        <div className="burger-menu" onClick={toggleMenu}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </div>
        <h1>Stundenplan</h1>
        <table>
          <thead>
            <tr>
              <th>Zeit</th>
              <th>Montag</th>
              <th>Dienstag</th>
              <th>Mittwoch</th>
              <th>Donnerstag</th>
              <th>Freitag</th>
            </tr>
          </thead>
          <tbody>{renderTableData()}</tbody>
        </table>
      </div>
    </main>
  );
};

export default Auswahl;
