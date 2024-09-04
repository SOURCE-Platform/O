import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './tabs';

const HeaderTabs = ({ activeTab, onTabChange }) => {
  return (
    <header className="p-4 border-b border-gray-700">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="flex justify-start bg-transparent">
          {['devices', 'account', 'about', 'feedback', 'help'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="text-lg font-normal text-gray-400 hover:text-white transition-colors relative px-3 py-2 group"
            >
              <span className="relative pb-1 group-data-[state=active]:text-white">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="absolute bottom-0 left-0 w-full h-px bg-white opacity-0 transition-opacity duration-300 ease-in-out group-data-[state=active]:opacity-100"></span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </header>
  );
};

export default HeaderTabs;
