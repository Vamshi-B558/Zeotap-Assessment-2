import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [ingestedData, setIngestedData] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage('');
    setColumns([]);
    setSelectedColumns([]);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const firstLine = text.split('\n')[0];
        const cols = firstLine.split(',').map(col => col.trim());
        setColumns(cols);
        setSelectedColumns(cols);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleColumnChange = (e) => {
    const col = e.target.name;
    if (e.target.checked) {
      setSelectedColumns(prev => [...prev, col]);
    } else {
      setSelectedColumns(prev => prev.filter(c => c !== col));
    }
  };

  const handleJwtChange = (e) => {
    setJwtToken(e.target.value);
  };

  const fetchData = async () => {
    if (!jwtToken) {
      setMessage('Please enter JWT token to fetch data.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5002/data', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        setMessage(`Failed to fetch data: ${response.status} ${errorText}`);
        return;
      }
      const data = await response.json();
      setIngestedData(data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching data: ' + error.message);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }
    if (selectedColumns.length === 0) {
      setMessage('Please select at least one column.');
      return;
    }
    if (!jwtToken) {
      setMessage('Please enter JWT token.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('columns', JSON.stringify(selectedColumns));

    try {
      const response = await fetch('http://localhost:5002/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        setMessage(`Upload failed: ${response.status} ${errorText}`);
        return;
      }
      const data = await response.json();
      setMessage(`${data.message} Ingested records: ${data.ingestedRecords}`);
      fetchData(); // Refresh ingested data after upload
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Bidirectional ClickHouse & Flat File Data Ingestion Tool</h1>
      <p>Welcome to the data ingestion tool frontend.</p>

      <div>
        <label>JWT Token:</label>
        <input type="text" value={jwtToken} onChange={handleJwtChange} style={{width: '400px'}} />
      </div>

      <div>
        <input type="file" onChange={handleFileChange} />
      </div>

      {columns.length > 0 && (
        <div>
          <p>Select columns to ingest:</p>
          {columns.map(col => (
            <label key={col} style={{marginRight: '10px'}}>
              <input
                type="checkbox"
                name={col}
                checked={selectedColumns.includes(col)}
                onChange={handleColumnChange}
              />
              {col}
            </label>
          ))}
        </div>
      )}

      <button onClick={handleUpload}>Upload and Ingest</button>

      {message && <p>{message}</p>}

      <h2>Ingested Data (up to 100 rows):</h2>
      {ingestedData.length > 0 ? (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              {columns.length > 0 ? columns.map(col => <th key={col}>{col}</th>) : <th>No data</th>}
            </tr>
          </thead>
          <tbody>
            {ingestedData.map((row, index) => (
              <tr key={index}>
                {columns.map(col => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No ingested data available.</p>
      )}
    </div>
  );
}

export default App;
