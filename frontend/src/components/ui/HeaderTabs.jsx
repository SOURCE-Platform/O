import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './tabs';

const HeaderTabs = ({ activeTab, onTabChange }) => {
  return (
    <header className="border-b border-gray-600 py-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="flex justify-start bg-transparent ml-16">
          {['devices', 'account', 'about', 'feedback', 'help'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="text-lg font-normal text-gray-200 hover:text-white-100 transition-colors relative py-2 group mr-8"
            >
              <span className="relative pb-1 group-data-[state=active]:text-white-100">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="absolute bottom-0 left-0 w-full h-px bg-white-100 opacity-0 transition-opacity duration-300 ease-in-out group-data-[state=active]:opacity-100"></span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </header>
  );
};

export default HeaderTabs;
