import React, { useState, useEffect } from 'react';
import { Switch } from "./shadcn/switch.tsx";

// Remove this line as we're not using it directly
// import { invoke } from '@tauri-apps/api/tauri';

const defaultSettingsConfig = {
  Screen: { 
    enabled: false,
    description: "Records screen activity and learns what you do based on your screen activity."
  },
  'Session info': { 
    enabled: false,
    description: "Captures what apps and sites you have open in any session. Learns how your sessions evolve over time."
  },
  'Background processes': { 
    enabled: false,
    description: "Captures what background processes are running to determine what functionality you rely on while you compute."
  },
  Keyboard: { 
    enabled: false,
    description: "Learns your typing patterns and keyboard shortcuts to better learn how you communicate and what functionality you rely on."
  },
  Mouse: { 
    enabled: false,
    description: "Captures your mouse movements and clicks to learn how you interact with your computer."
  },
  Camera: { 
    enabled: false,
    description: "Sees how you react while using your devices to determine what events trigger what emotions and behaviors."
  },
  Mic: { 
    enabled: false,
    description: "Listens to you while you're on calls and comments you might have while using your device inorder to better understand you. "
  },
};

const SettingItem = ({ title, description, enabled, onToggle }) => (
  <div 
    className={`p-4 rounded-lg shadow-md flex transition-all duration-300 cursor-pointer
      ${enabled 
        ? 'bg-gray-700 border border-white-700' 
        : 'bg-gray-800 border border-transparent'
      }`}
    onClick={() => onToggle(title)}
  >
    <div className="flex-grow pr-4">
      <h3 className="text-base font-medium text-white-100 mb-2">{title}</h3>
      <p className="text-xs text-white-700">
        {description}
      </p>
    </div>
    <div className="flex flex-col items-end">
      <div className="flex items-center">
        <div className="w-8 text-left">
          <span className="text-xs text-white-700">{enabled ? 'On' : 'Off'}</span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={() => {
            onToggle(title);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label={`Switch ${title}`}
        />
      </div>
    </div>
  </div>
);

const SettingsCard = ({ deviceName }) => {
  const [settings, setSettings] = useState(defaultSettingsConfig);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    console.log('Fetching settings for device:', deviceName);
    try {
      let fetchedSettings;
      if (window.__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        fetchedSettings = await invoke('get_device_settings', { deviceName });
      } else {
        // Use localStorage for browser environment
        const storedSettings = localStorage.getItem(`settings_${deviceName}`);
        fetchedSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettingsConfig;
      }
      console.log('Fetched settings:', fetchedSettings);
      if (typeof fetchedSettings === 'object' && fetchedSettings !== null) {
        setSettings(fetchedSettings);
      } else {
        throw new Error('Invalid settings data received');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error.toString());
      setSettings(defaultSettingsConfig);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [deviceName]);

  const handleToggle = async (settingTitle) => {
    const updatedSettings = {
      ...settings,
      [settingTitle]: { ...settings[settingTitle], enabled: !settings[settingTitle].enabled }
    };
    setSettings(updatedSettings);

    console.log('Saving updated settings:', updatedSettings);
    
    try {
      if (window.__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('save_device_settings', { deviceName, settings: updatedSettings });
      } else {
        // Save to localStorage for browser environment
        localStorage.setItem(`settings_${deviceName}`, JSON.stringify(updatedSettings));
      }
      console.log('Settings saved successfully');
      setError(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(`Failed to save settings: ${error}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings for {deviceName}</h2>
      {error && <p className="text-red-500">Error: {error}</p>}
      {Object.keys(settings).length === 0 ? (
        <p>Loading settings...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(settings).map(([title, settingData]) => (
            <SettingItem
              key={title}
              title={title}
              description={settingData.description}
              enabled={settingData.enabled}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsCard;