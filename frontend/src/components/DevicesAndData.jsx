import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import SettingsCard from './SettingsCard';
import { Icon } from './ui/icons/Icon.tsx'; 
import SettingsTabs from './SettingsTabs';

const DevicesAndData = ({ onDeviceSelect }) => {
  const [activeDevice, setActiveDevice] = useState('Surface 10');
  const [showSettings, setShowSettings] = useState(null);
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState(null);

  const devices = [
    { name: 'Surface 10', type: 'default' },
    { name: 'iPhone 15', type: 'default' },
    { name: 'Arch Linux Laptop', type: 'server' },
  ];

  const toggleSettings = (deviceName) => {
    setShowSettings(prevDevice => prevDevice === deviceName ? null : deviceName);
  };

  const handleDeviceChange = (device) => {
    setActiveDevice(device);
    onDeviceSelect(device);
  };

  const handleSettingsChange = useCallback((updatedSettings) => {
    setSettings(updatedSettings);
    const firstEnabledSetting = Object.entries(updatedSettings).find(([_, setting]) => setting.enabled);
    setActiveTab(firstEnabledSetting ? firstEnabledSetting[0] : null);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let fetchedSettings;
        if (window.__TAURI__) {
          const { invoke } = await import('@tauri-apps/api/tauri');
          fetchedSettings = await invoke('get_device_settings', { deviceName: activeDevice });
        } else {
          const storedSettings = localStorage.getItem(`settings_${activeDevice}`);
          fetchedSettings = storedSettings ? JSON.parse(storedSettings) : {};
        }
        handleSettingsChange(fetchedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [activeDevice, handleSettingsChange]);

  return (
    <div>
      <div className="mt-8 mx-8">
        <Tabs value={activeDevice} onValueChange={handleDeviceChange} className="mb-6">
          <TabsList className="flex justify-start bg-transparent">
            {devices.map((device) => (
              <TabsTrigger
                key={device.name}
                value={device.name}
                className="text-base font-normal text-gray-200 hover:text-white-100 transition-colors relative py-2 group mr-8"
              >
                <span className="relative pb-1 group-data-[state=active]:text-white-100">
                  {device.type === 'server' && (
                    <span className="bg-gray-950 text-white-900 text-xs px-1 py-0.5 rounded mr-2">
                      SERVER
                    </span>
                  )}
                  {device.name}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-white-100 opacity-0 transition-opacity duration-300 ease-in-out group-data-[state=active]:opacity-100"></span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="w-full mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-normal text-white-100">{activeDevice}</h1>
          <button 
            className="p-2 hover:bg-gray-700 rounded-md"
            onClick={() => toggleSettings(activeDevice)}
          >
            <Icon name="device-settings" size={24} className="text-white-100" />   
          </button>
        </div>

        {showSettings === activeDevice && (
          <SettingsCard 
            deviceName={activeDevice} 
            onSettingsChange={handleSettingsChange}
          />
        )}

        <SettingsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          settings={settings}
        />
      </div>
    </div>
  );
};

export default DevicesAndData;