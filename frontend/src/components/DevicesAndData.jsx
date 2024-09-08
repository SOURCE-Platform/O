import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import SettingsCard from './SettingsCard';
import { Icon } from './ui/icons/Icon.tsx';  // Keeping the .tsx extension

const DevicesAndData = ({ onDeviceSelect }) => {
  const [activeDevice, setActiveDevice] = useState('Surface 10');
  const [showSettings, setShowSettings] = useState(null);

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

  return (
    <div>
      <div className="mt-8  mx-8">
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

        {showSettings === activeDevice ? (
          <SettingsCard deviceName={activeDevice} />
        ) : (
          <p className="mt-6">This is where the Devices & Data content will go for {activeDevice}.</p>
        )}
      </div>
    </div>
  );
};

export default DevicesAndData;