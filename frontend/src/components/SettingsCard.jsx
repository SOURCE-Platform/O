import React, { useState, useEffect } from 'react';
import { Switch } from "./shadcn/switch.tsx";

// Remove this line as we're not using it directly
// import { invoke } from '@tauri-apps/api/tauri';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const SettingItem = ({ title, description, enabled, onToggle }) => (
  <div 
    className={`py-2 px-4 flex items-center transition-all duration-300 cursor-pointer border
      ${enabled ? 'border-gray-600 bg-gray-850' : 'border-gray-600 bg-transparent'}
    `}
    onClick={() => onToggle(title)}
  >
    <div className="flex-grow pr-4">
      <h3 className={`text-xs font-regular ${enabled ? 'text-white-700' : 'text-gray-500'}`}>
        {capitalizeFirstLetter(title)}
      </h3>
    </div>
    <div className="flex items-center">
      <div className="w-8 text-right mr-2">
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
);

const SettingsCard = ({ deviceName }) => {
  const [settings, setSettings] = useState({});
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
        fetchedSettings = storedSettings ? JSON.parse(storedSettings) : {};
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
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [deviceName]);

  const handleToggle = async (settingTitle) => {
    const updatedSettings = {
      ...settings,
      [settingTitle]: { 
        ...settings[settingTitle], 
        enabled: !settings[settingTitle].enabled 
      }
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
    <div className="p-4 rounded-lg bg-gray-950">
      <h2 className="text-l text-white-700 font-regular mb-2">Data Sources</h2>
      {error && <p className="text-red-500">Error: {error}</p>}
      {Object.keys(settings).length === 0 ? (
        <p>Loading settings...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -mt-[1px] -ml-[1px]">
          {Object.entries(settings).map(([title, settingData], index) => (
            <div key={title} className="mt-[-1px] ml-[-1px]">
              <SettingItem
                title={title}
                description={settingData.description}
                enabled={settingData.enabled}
                onToggle={handleToggle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsCard;