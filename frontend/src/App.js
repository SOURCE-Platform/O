import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HeaderTabs from './components/ui/HeaderTabs';
import DevicesAndData from './components/DevicesAndData';

function App() {
  const [activeTab, setActiveTab] = useState('devices');
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar onSettingsClick={toggleSettings} />
      <main className="flex-grow flex flex-col">
        <HeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-grow ml-8">
          {activeTab === 'devices' ? (
            <DevicesAndData />
          ) : (
            <div>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;