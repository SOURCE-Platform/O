import React, { useState, useRef, useEffect } from 'react';

const FilesAndFolders = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFilePickerActive, setIsFilePickerActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleWindowFocus = () => {
      setIsDragActive(false);
      setIsFilePickerActive(false);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsFilePickerActive(false);
    
    const files = [...e.dataTransfer.files];
    addFiles(files);
  };

  const handleClick = () => {
    setIsFilePickerActive(true);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    setIsDragActive(false);
    setIsFilePickerActive(false);
    const files = [...e.target.files];
    addFiles(files);
  };

  const addFiles = (files) => {
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleFileInputBlur = () => {
    setIsDragActive(false);
    setIsFilePickerActive(false);
  };

  const handleFileInputFocus = () => {
    setIsFilePickerActive(true);
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-sm text-white-800 font-light mb-2">Select files and folders to add to SOURCE</h3>
      <div className="h-[200px] overflow-hidden mb-4">
        <div 
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            h-full w-full
            flex items-center justify-center
            rounded-lg 
            transition-colors duration-300 ease-in-out
            border-2 border-dashed
            cursor-pointer
            group
            ${isDragActive || isFilePickerActive ? 'bg-gray-850 border-white-800' : 'bg-gray-925 border-gray-300'}
            hover:bg-gray-800 hover:border-white-800
          `}
        >
          <p className={`font-light text-center ${isDragActive || isFilePickerActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
            {isDragActive ? (
              'Drop the files here ...'
            ) : isFilePickerActive ? (
              'Add files from device ...'
            ) : (
              <>
                Drag 'n' drop some files here <br />
                or <br />
                Click to select files
              </>
            )}
          </p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
          onBlur={handleFileInputBlur} 
          onFocus={handleFileInputFocus} 
          multiple 
        />
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm text-white-800 font-light mb-2">Selected Files:</h4>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                <span className="text-sm text-white-700">{file.name}</span>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilesAndFolders;