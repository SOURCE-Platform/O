import React, { useState } from 'react';
import HeaderTabs from './components/ui/HeaderTabs';

// Placeholder components for tab contents
const DevicesContent = () => <div>Devices & Data Content</div>;
const AccountContent = () => <div>Account Content</div>;
const AboutContent = () => <div>About Content</div>;
const FeedbackContent = () => <div>Feedback Content</div>;
const HelpContent = () => <div>Help Content</div>;

function App() {
  const [activeTab, setActiveTab] = useState('devices');

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <HeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-grow p-6">
        <div className="p-4 rounded-lg">
          {activeTab === 'devices' && <DevicesContent />}
          {activeTab === 'account' && <AccountContent />}
          {activeTab === 'about' && <AboutContent />}
          {activeTab === 'feedback' && <FeedbackContent />}
          {activeTab === 'help' && <HelpContent />}
        </div>
      </main>
    </div>
  );
}

export default App;