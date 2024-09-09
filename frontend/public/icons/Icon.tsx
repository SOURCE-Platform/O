import React from 'react';
import addIcon from '../../../icons/add.svg';
import chatIcon from '../../../icons/chat.svg';
import settingsIcon from '../../../icons/settings.svg';
import xIcon from '../../../icons/X.svg'; // Add this line

const iconMap = {
  add: addIcon,
  chat: chatIcon,
  settings: settingsIcon,
  x: xIcon, // Add this line
};

interface IconProps {
  name: keyof typeof iconMap;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  return (
    <img
      src={iconMap[name]}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={`icon ${className}`}
    />
  );
};