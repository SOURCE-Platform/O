import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css'; // Make sure to create this CSS file

function App() {
  const [recordingLocation, setRecordingLocation] = useState('');
  const [frameRate, setFrameRate] = useState(30);

  useEffect(() => {
    invoke('get_settings')
      .then((settings: any) => {
        setRecordingLocation(settings.recording_location);
        setFrameRate(settings.frame_rate);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const debounceSave = setTimeout(() => {
      invoke('update_settings', { recordingLocation, frameRate })
        .catch(console.error);
    }, 500);

    return () => clearTimeout(debounceSave);
  }, [recordingLocation, frameRate]);

  const handleChangeLocation = async () => {
    try {
      const newLocation = await invoke('open_folder_dialog');
      setRecordingLocation(newLocation as string);
    } catch (error) {
      console.error('Failed to select new location:', error);
    }
  };

  return (
    <div className="settings-container">
      <h1>Screen Recorder Settings</h1>
      <div className="setting-section">
        <h2>Recording Location</h2>
        <p className="current-location">{recordingLocation}</p>
        <button onClick={handleChangeLocation}>Change Location</button>
      </div>
      <div className="setting-section">
        <h2>Frame Rate</h2>
        <div className="frame-rate-options">
          {[1, 5, 10, 15, 20, 25, 30].map((rate) => (
            <label key={rate} className="frame-rate-option">
              <input
                type="radio"
                value={rate}
                checked={frameRate === rate}
                onChange={() => setFrameRate(rate)}
              />
              {rate} fps
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;