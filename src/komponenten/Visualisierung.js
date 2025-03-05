import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import 'chart.js/auto';
import './Auswahl.css';

const Visualisierung = () => {
  const [semesterData, setSemesterData] = useState([]);
  const [modulesTableData, setModulesTableData] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }
    
    const fetchSemesterData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/timetable?userId=${userId}`);
        const data = await response.json();

        const modulePerSemester = data.reduce((acc, entry) => {
          const { semester, kurs } = entry;
          const baseKurs = kurs.replace(/(V|P|U)$/gi, '').trim().replace(/-$/, '');
          if (!acc[semester]) {
            acc[semester] = new Set();
          }
          acc[semester].add(baseKurs);
          return acc;
        }, {});

        const sortedSemesters = Object.keys(modulePerSemester).sort((a, b) => a - b);

        setSemesterData(
          sortedSemesters.map((semester) => ({
            semester,
            count: modulePerSemester[semester].size,
          }))
        );

        const tableData = {};
        sortedSemesters.forEach((semester) => {
          tableData[semester] = Array.from(modulePerSemester[semester]);
        });
        setModulesTableData(tableData);
      } catch (error) {
        console.error('Error fetching semester data:', error);
      }
    };

    fetchSemesterData();
  }, [navigate]);

  const chartData = {
    labels: semesterData.map((item) => `Semester ${item.semester}`),
    datasets: [
      {
        label: 'Anzahl der einzigartigen Module',
        data: semesterData.map((item) => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: semesterData.map((item) => `Semester ${item.semester}`),
    datasets: [
      {
        label: 'Verteilung der Module',
        data: semesterData.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Semester',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Anzahl der Module',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    layout: {
      padding: {
        bottom: 50,
      },
    },
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  function redirectToTimetable() {
    navigate('/fileUpload');
  }

  function redirectToPlan() {
    navigate('/auswahl');
  }

  const redirectToMeineFaecher = () => {
    navigate('/meine-faecher');
  };

  const redirectToPraktikum = () => {
    navigate('/Praktikum');
  };

  const renderTable = () => {
    const semesters = Object.keys(modulesTableData).sort((a, b) => a - b);
    const maxRows = Math.max(...semesters.map((semester) => modulesTableData[semester].length));

    return (
      <table border="1" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nr.:</th>
            {semesters.map((semester, index) => (
              <th key={index}>Semester {semester}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td>{rowIndex + 1}</td>
              {semesters.map((semester, index) => (
                <td key={index}>{modulesTableData[semester][rowIndex] || ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <main id="mainAuswahl">
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <button className="uploadJsonButton1" onClick={redirectToTimetable}>
          HTML-Datei hochladen
        </button>
        <button className="visualize-button" onClick={redirectToPlan}>
          Plan anzeigen
        </button>
        <button className="course-button" onClick={redirectToMeineFaecher}>
          Module Infos
        </button>
        <button className="praktikum-button" onClick={redirectToPraktikum}>
          Praktikum
        </button>
      </div>

      <div className={`content ${menuOpen ? 'shifted' : ''}`}>
        <div className="burger-menu" onClick={toggleMenu}>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${menuOpen ? 'open' : ''}`}></div>
        </div>

        <h1>Visualisierung: Anzahl der einzigartigen Module pro Semester</h1>
        <div style={{ width: '50%', margin: '20px auto' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <h2>Verteilung der Module</h2>
        <div style={{ width: '40%', margin: '20px auto' }}>
          <Pie data={pieChartData} />
        </div>

        <h2>Module pro Semester</h2>
        {renderTable()}
      </div>
    </main>
  );
};

export default Visualisierung;
