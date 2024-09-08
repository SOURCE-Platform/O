// frontend/src/utils.js
export const formatSettingName = (name) => {
    const lowerCaseWords = new Set(['and', 'of', 'with', 'for', 'the', 'in', 'a', 'to', 'on', 'at', 'by', 'an', 'as', 'but', 'or', 'nor', 'so', 'yet']);
  
    return name
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split into words
      .map((word, index) => {
        if (index === 0 || !lowerCaseWords.has(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word.toLowerCase();
      })
      .join(' '); // Join back into a single string
  };