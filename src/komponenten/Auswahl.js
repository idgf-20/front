import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf'; // Importieren der PDF-Bibliothek
import 'jspdf-autotable'; // Importieren von autoTable
import './Auswahl.css';

const Auswahl = () => {
  const [timetable, setTimetable] = useState([]);
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
    fetchTimetable(storedUserId);
  }, [navigate]);

  

  const fetchTimetable = (userId) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/timetable?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => setTimetable(data))
      .catch((error) => console.error('Fehler beim Laden des Stundenplans:', error));
  };



  const handleDeleteEntry = (id) => {
    // Zuerst den Eintrag aus dem Zustand entfernen
    setTimetable((prevTimetable) => prevTimetable.filter((entry) => entry.id !== id));

    // Dann die Löschanfrage an den Server senden
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/timetable/${id}`, {
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
                        backgroundColor: '#f0f0f0',
                        borderRadius: '5px',
                      }}
                    >
                      <div>
                        <strong>{entry.kurs}</strong>
                      </div>
                      <div>{entry.prof}</div>
                      <div>{entry.raum}</div>
                      {}

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
