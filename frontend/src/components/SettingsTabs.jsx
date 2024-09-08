import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { formatSettingName } from '../utils/utils';
import FilesAndFolders from './SettingsSections/FilesAndFolders';
import Screen from './SettingsSections/Screen';
import Session from './SettingsSections/Session';
import Processes from './SettingsSections/Processes';
import Keyboard from './SettingsSections/Keyboard';
import Mouse from './SettingsSections/Mouse';
import Camera from './SettingsSections/Camera';
import Mic from './SettingsSections/Mic';

const SettingsTabs = ({ activeTab, onTabChange, settings }) => {
  // Filter out disabled settings
  const enabledSettings = Object.entries(settings).filter(([_, setting]) => setting.enabled);

  const renderSettingSection = (settingName) => {
    switch (settingName) {
      case 'files_and_folders':
        return <FilesAndFolders />;
      case 'screen':
        return <Screen />;
      case 'session':
        return <Session />;
      case 'processes':
        return <Processes />;
      case 'keyboard':
        return <Keyboard />;
      case 'mouse':
        return <Mouse />;
      case 'camera':
        return <Camera />;
      case 'mic':
        return <Mic />;
      default:
        return null;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex flex-col">
      <TabsList className="flex justify-start bg-transparent mb-4">
        {enabledSettings.map(([settingName, _]) => (
          <TabsTrigger
            key={settingName}
            value={settingName}
            className="text-base font-normal text-gray-200 hover:text-white-100 transition-colors relative py-2 group mr-8"
          >
            <span className="relative pb-1 group-data-[state=active]:text-white-100">
              {formatSettingName(settingName)}
              <span className="absolute bottom-0 left-0 w-full h-px bg-white-100 opacity-0 transition-opacity duration-300 ease-in-out group-data-[state=active]:opacity-100"></span>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div>
        {enabledSettings.map(([settingName, _]) => (
          <TabsContent key={settingName} value={settingName}>
            {renderSettingSection(settingName)}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default SettingsTabs;