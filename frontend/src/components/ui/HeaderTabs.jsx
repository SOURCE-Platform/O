import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import './HeaderTabs.css';

const HeaderTabs = ({ activeTab, onTabChange }) => {
  return (
    <header className="header-tabs">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="tabs-list">
          <TabsTrigger value="devices" className="tab-trigger">
            <span>Devices & Data</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="tab-trigger">
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="tab-trigger">
            <span>About</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="tab-trigger">
            <span>Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="tab-trigger">
            <span>Help</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
};

export default HeaderTabs;
