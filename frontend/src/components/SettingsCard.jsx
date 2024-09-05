import React, { useState, useEffect } from 'react';
import { Switch } from "./shadcn/switch.tsx";

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
  const [settings, setSettings] = useState({});

  useEffect(() => {
    // Here you would typically fetch the settings for the specific device
    // For now, we'll just use the default settings
    setSettings(defaultSettingsConfig);
  }, [deviceName]);

  const handleToggle = (settingTitle) => {
    setSettings(prev => ({
      ...prev,
      [settingTitle]: { ...prev[settingTitle], enabled: !prev[settingTitle].enabled }
    }));
    // Here you would typically save the updated settings for the specific device
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Settings for {deviceName}</h2>
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
    </div>
  );
};

export default SettingsCard;