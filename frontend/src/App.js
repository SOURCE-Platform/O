import React, { useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import HeaderTabs from './components/ui/HeaderTabs';
import DevicesAndData from './components/DevicesAndData';
import SettingsPage from './components/SettingsPage';

function App() {
  console.log('App component rendering');
  const [activeTab, setActiveTab] = useState('devices');
  const [showSettings, setShowSettings] = useState(false);
  const [currentDevice, setCurrentDevice] = useState('MyDevice');

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex bg-background text-foreground min-h-screen">
        <Sidebar onSettingsClick={toggleSettings} />
        <main className="flex-grow flex flex-col">
          <HeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-grow ml-8">
            {activeTab === 'devices' ? (
              <DevicesAndData onDeviceSelect={setCurrentDevice} currentDevice={currentDevice} />
            ) : (
              <div>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content</div>
            )}
          </div>
          {showSettings && <SettingsPage key={currentDevice} deviceName={currentDevice} />}
        </main>
      </div>
    </Suspense>
  );
}

export default App;