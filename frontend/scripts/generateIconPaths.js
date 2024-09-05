const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/components/ui/icons');
const outputFile = path.join(iconsDir, 'iconPaths.ts');

function extractPathFromSVG(content) {
  const match = content.match(/<path[^>]*d="([^"]*)"[^>]*>/);
  return match ? match[1] : null;
}

function generateIconPaths() {
  const iconPaths = {};
  const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));

  svgFiles.forEach(file => {
    const filePath = path.join(iconsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const iconName = path.basename(file, '.svg');
    const pathData = extractPathFromSVG(content);

    if (pathData) {
      iconPaths[iconName] = pathData;
    } else {
      console.warn(`Warning: No path found in ${file}`);
    }
  });

  const output = `export const iconPaths = ${JSON.stringify(iconPaths, null, 2)};`;
  fs.writeFileSync(outputFile, output);

  console.log(`Icon paths generated in ${outputFile}`);
  console.log(`Generated paths for ${Object.keys(iconPaths).length} icons`);
}

generateIconPaths();