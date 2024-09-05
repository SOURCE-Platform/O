import React from 'react';
import { Icon } from './ui/icons/Icon.tsx';  // Keeping the .tsx extension

const Sidebar = () => {
  const handleSettingsClick = (e) => {
    // Prevent default button behavior
    e.preventDefault();
    // No action performed
  };

  return (
    <div className="w-[70px] min-w-[70px] max-w-[70px] h-screen bg-gray-900 border-r border-gray-600 flex flex-col justify-between py-4 flex-shrink-0 sticky top-0">
      <div className="flex flex-col items-center space-y-4 overflow-y-auto">
        <button className="p-2 hover:bg-gray-700 rounded-md">
          <Icon name="add" size={24} className="text-white-100" />
        </button>
        <button className="p-2 hover:bg-gray-700 rounded-md">
          <Icon name="chat" size={24} className="text-white-100" />
        </button>
      </div>
      <div className="flex flex-col items-center mt-auto">
        <button 
          className="p-2 hover:bg-gray-700 rounded-md"
          onClick={handleSettingsClick}
        >
          <Icon name="settings" size={29} className="text-white-100" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;