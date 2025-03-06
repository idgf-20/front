import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileUpload.css';

const FileUpload = () => {
  const [htmlFilesData, setHtmlFilesData] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedCourses, setSelectedCourses] = useState({});
  const [semesters, setSemesters] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Redirect to login if user is not logged in
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
    }
  }, [navigate]);

  const saveCoursesToDB = async (courseName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: courseName, description: `Beschreibung für ${courseName}` }),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log('Course added:', data.course);
      } else if (response.status === 409) {
        console.log(`Course ${courseName} already exists.`);
      } else {
        console.error('Error adding course:', await response.json());
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  // Funktion zum Ersetzen von Umlauten und anderen Sonderzeichen.
  const replaceSpecialCharacters = (text) => {
    console.log('Before replacement:', text);
    const replaced = text
      .normalize('NFC')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'Ae')
      .replace(/Ö/g, 'Oe')
      .replace(/Ü/g, 'Ue')
      .replace(/ß/g, 'ss');
    console.log('After replacement:', replaced);
    return replaced;
  };

  const onHtmlFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let fileDataList = [];

    selectedFiles.forEach((file) => {
      const fileExtension = file?.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'html' && fileExtension !== 'htm') {
        setMessage('Bitte wählen Sie gültige HTML- oder HTM-Dateien aus!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const textContent = event.target.result;
          console.log('File content read:', textContent);

          const parser = new DOMParser();
          const doc = parser.parseFromString(textContent, 'text/html');

          const timetableTable = doc.querySelector('table[width="100%"]');
          if (!timetableTable) {
            setMessage(`Kein Stundenplan gefunden in der Datei: ${file.name}`);
            return;
          }

          const rows = Array.from(timetableTable.getElementsByTagName('tr')).slice(1);
          const timetableData = rows.map((row) => {
            const cells = row.getElementsByTagName('td');
            return {
              Instructor: replaceSpecialCharacters(cells[0]?.textContent?.trim() || ''),
              Course: replaceSpecialCharacters(cells[1]?.textContent?.trim() || ''),
              Day: replaceSpecialCharacters(cells[2]?.textContent?.trim() || ''),
              Time: replaceSpecialCharacters(cells[3]?.textContent?.trim() || ''),
              Room: replaceSpecialCharacters(cells[4]?.textContent?.trim() || ''),
            };
          });

          fileDataList.push({ fileName: file.name, timetable: timetableData });

          if (fileDataList.length === selectedFiles.length) {
            setHtmlFilesData(fileDataList);
            setSelectedFile(fileDataList[0]?.fileName || '');
            setSemesters((prev) => ({ ...prev, [fileDataList[0].fileName]: 1 }));
          }
        } catch (error) {
          setMessage('Fehler beim Parsen der HTML-Datei!');
          console.error(error);
        }
      };

      reader.readAsText(file, 'windows-1252'); 
    });
  };

  const onCourseSelect = (fileName, courseName) => {
    setSelectedCourses((prevSelectedCourses) => {
      const fileCourses = prevSelectedCourses[fileName] || [];
      const newSelectedCourses = fileCourses.includes(courseName)
        ? fileCourses.filter((course) => course !== courseName)
        : [...fileCourses, courseName];

      // Speichern den Kurs in der Datenbank, wenn er ausgewählt wird.
      if (!fileCourses.includes(courseName)) {
        saveCoursesToDB(courseName);
      }

      return {
        ...prevSelectedCourses,
        [fileName]: newSelectedCourses,
      };
    });
  };

  const onSemesterChange = (fileName, newSemester) => {
    setSemesters((prevSemesters) => ({
      ...prevSemesters,
      [fileName]: newSemester,
    }));
  };

  const removeDuplicateCourses = (timetable) => {
    const uniqueCourses = timetable.filter((value, index, self) =>
      index === self.findIndex((t) => t.Course === value.Course && t.Instructor === value.Instructor)
    );
    return uniqueCourses;
  };

  const onFileUpload = () => {
    if (htmlFilesData.length === 0) {
      setMessage('Bitte wählen Sie mindestens eine HTML/HTM-Datei aus!');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('Benutzer-ID ist nicht verfügbar. Weiterleitung zur Anmeldung...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    htmlFilesData.forEach((fileData) => {
      const selectedFileCourses = selectedCourses[fileData.fileName] || [];
      const selectedCoursesData = fileData.timetable.filter((item) =>
        selectedFileCourses.includes(item.Course)
      );
      const fileSemester = semesters[fileData.fileName];

      if (!fileSemester) {
        setMessage(`Bitte wählen Sie ein Semester für die Datei: ${fileData.fileName}`);
        return;
      }

      const formattedCoursesData = selectedCoursesData.map((course) => ({
        ...course,
        Course: replaceSpecialCharacters(course.Course),
      }));

      const formData = new FormData();
      formData.append(
        'file',
        new Blob([JSON.stringify({ timetable: formattedCoursesData })], { type: 'application/json' })
      );
      formData.append('userId', userId);
      formData.append('semester', fileSemester);

      fetch(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          setMessage(`Datei "${fileData.fileName}" erfolgreich hochgeladen!`);
          const userChoice = window.confirm('Möchtest du noch eine andere Datei hochladen?');
          if (userChoice) {
            window.location.reload();
          } else {
            navigate('/auswahl');
          }
        })
        .catch((error) => {
          setMessage('Hochladen der Datei fehlgeschlagen!');
          console.error('Fehler beim Hochladen der Datei:', error);
        });
    });
  };

  return (
    <div className="file-upload-container">
      <h2>Datei hochladen</h2>
      <input
        type="file"
        id="htmlFileInput"
        onChange={onHtmlFileChange}
        accept=".html,.htm"
        multiple
      />
      <label htmlFor="htmlFileInput">Wählen Sie HTML/HTM-Dateien</label>

      {htmlFilesData.length > 0 && (
        <div className="file-menu">
          <label htmlFor="fileSelect">Datei auswählen:</label>
          <select
            id="fileSelect"
            value={selectedFile}
            onChange={(e) => {
              const fileName = e.target.value;
              setSelectedFile(fileName);
              if (!semesters[fileName]) {
                setSemesters((prev) => ({ ...prev, [fileName]: 1 }));
              }
            }}
          >
            {htmlFilesData.map((fileData) => (
              <option key={fileData.fileName} value={fileData.fileName}>
                {fileData.fileName}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedFile && (
        <div className="semester-selection">
          <label htmlFor="semesterSelect">Semester auswählen:</label>
          <select
            id="semesterSelect"
            value={semesters[selectedFile] || 1}
            onChange={(e) => onSemesterChange(selectedFile, Number(e.target.value))}
          >
            {[...Array(7).keys()].map((sem) => (
              <option key={sem + 1} value={sem + 1}>
                Semester {sem + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedFile && htmlFilesData.length > 0 && (
        <div className="file-details">
          {htmlFilesData
            .filter((fileData) => fileData.fileName === selectedFile)
            .map((fileData, fileIndex) => {
              const uniqueTimetable = removeDuplicateCourses(fileData.timetable);
              return (
                <div key={fileIndex} className="file-block">
                  <p>
                    <strong>Ausgewählte Datei: {fileData.fileName}</strong>
                  </p>

                  {uniqueTimetable.length > 0 && (
                    <div className="course-list">
                      <h3>Kurse und Dozenten (für {fileData.fileName}):</h3>
                      <ul>
                        {uniqueTimetable.map((course, index) => (
                          <li key={index}>
                            <label>
                              <input
                                type="checkbox"
                                checked={
                                  selectedCourses[fileData.fileName]?.includes(course.Course) || false
                                }
                                onChange={() => onCourseSelect(fileData.fileName, course.Course)}
                              />
                              <strong>{course.Course}</strong> - {course.Instructor}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <button onClick={onFileUpload}>Hochladen</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
