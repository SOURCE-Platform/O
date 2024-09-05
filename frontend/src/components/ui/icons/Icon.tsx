import React, { useEffect, useState } from 'react';

interface IconProps {
  name: 'add' | 'chat' | 'settings';
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/icons/${name}.svg`)
      .then(response => response.text())
      .then(data => {
        // Remove width, height, and fill attributes from the SVG
        const cleanedSvg = data.replace(/<svg[^>]*>/, (match) => {
          return match
            .replace(/width="[^"]*"/, '')
            .replace(/height="[^"]*"/, '')
            .replace(/fill="[^"]*"/, 'fill="currentColor"');
        });
        setSvgContent(cleanedSvg);
      })
      .catch(error => console.error(`Error loading SVG for ${name}:`, error));
  }, [name]);

  if (!svgContent) {
    return null; // or a placeholder
  }

  return (
    <div 
      className={`icon-wrapper ${className}`} 
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};