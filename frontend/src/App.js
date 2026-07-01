import React, { useState } from 'react';
import './App.css';
import { uploadFile } from './api';

function App() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('JPG');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Idle');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('Ready');
      setProgress(0);
      setDownloadUrl('');
    }
  };

const handleConvert = async () => {
    if (!file) return;

    setStatus('Uploading and converting...');
    setProgress(30);

    try {
      // Convert 'JPG' or 'PNG' into 'jpg' or 'png' explicitly
      const standardizedFormat = format.toLowerCase();
      const responseData = await uploadFile(file, standardizedFormat);
      
      if (responseData && responseData.downloadLink) {
        setProgress(100);
        setDownloadUrl(responseData.downloadLink);
        setStatus('Conversion Complete!');
      } else {
        throw new Error("Malformed API response structure.");
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      setStatus('Conversion Failed');
      setProgress(0);
      alert(error.message || "Error processing file conversion on server.");
    }
  };

  const handleDownloadFile = () => {
    if (!downloadUrl) return;
    const temporaryLink = document.createElement('a');
    temporaryLink.href = downloadUrl;
    temporaryLink.setAttribute('download', downloadUrl.split('/').pop());
    document.body.appendChild(temporaryLink);
    temporaryLink.click();
    document.body.removeChild(temporaryLink);
  };

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <h2 className="logo">FileMorph</h2>
        <nav>
          <button className="nav-btn active">Converter App</button>
          <button className="nav-btn">Conversion History</button>
        </nav>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-content">
        <header className="main-header">
          <h1>Converter Workspace</h1>
        </header>

        <div className="upload-container">
          <div className="upload-zone">
            <h3>Convert Your Files</h3>
            <p className="subtitle">Securely convert your documents or images in real-time</p>
            
            <div className="controls">
              <label>Target Format: </label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="JPG">JPG (.jpg)</option>
                <option value="PNG">PNG (.png)</option>
                <option value="PDF">PDF (.pdf)</option>
                <option value="DOCX">DOCX (.docx)</option>
              </select>
            </div>

            <label className="custom-file-upload">
              <input type="file" onChange={handleFileChange} />
              Choose File
            </label>
            <p className="filename-hint">{file ? file.name : "No file chosen"}</p>

            <button onClick={handleConvert} className="convert-btn" disabled={!file}>
              Convert File
            </button>

            {/* Progress Visualization */}
            {progress > 0 && (
              <div className="progress-wrapper">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="status-text">{status} ({progress}%)</p>
              </div>
            )}

            {/* Download Link Delivery */}
            {status === 'Conversion Complete!' && downloadUrl && (
              <div className="download-section">
                <button onClick={handleDownloadFile} className="download-btn">
                  Download Converted File
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
