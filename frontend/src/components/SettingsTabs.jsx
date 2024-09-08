import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { formatSettingName } from '../utils/utils';


const SettingsTabs = ({ activeTab, onTabChange, settings }) => {
  // Filter out disabled settings
  const enabledSettings = Object.entries(settings).filter(([_, setting]) => setting.enabled);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-0">
      <TabsList className="flex justify-start bg-transparent">
        {enabledSettings.map(([settingName, _]) => (
          <TabsTrigger
            key={settingName}
            value={settingName}
            className="text-base font-normal text-gray-200 hover:text-white-100 transition-colors relative py-2 group mr-8"
          >
            <span className="relative pb-1 group-data-[state=active]:text-white-100">
              {formatSettingName(settingName)} {/* Use the formatting function here */}
              <span className="absolute bottom-0 left-0 w-full h-px bg-white-100 opacity-0 transition-opacity duration-300 ease-in-out group-data-[state=active]:opacity-100"></span>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default SettingsTabs;