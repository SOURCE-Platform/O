import React from 'react';
import SettingsCard from './SettingsCard';

const SettingsPage = ({ deviceName }) => {
  console.log('SettingsPage component rendering for device:', deviceName);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Device Settings</h1>
      <SettingsCard deviceName={deviceName} />
    </div>
  );
};

export default SettingsPage;