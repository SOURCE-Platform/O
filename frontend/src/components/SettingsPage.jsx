import React from 'react';
import SettingsCard from './SettingsCard';

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Device Settings</h1>
      <SettingsCard />
    </div>
  );
};

export default SettingsPage;