import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Icon } from '../ui/icons/Icon.tsx'; // Update this import

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
    addFilesAndFolders(files);
  };

  const handleClick = () => {
    setIsFilePickerActive(true);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    setIsDragActive(false);
    setIsFilePickerActive(false);
    const files = e.target.files;
    if (files.length > 0) {
      addFilesAndFolders(files);
    }
  };

  const addFilesAndFolders = async (items) => {
    try {
      const fileDetails = await processItems(items);
      console.log('File and folder details before sending to backend:', fileDetails);
      const analyzedItems = await invoke('analyze_files_and_folders', { items: fileDetails });
      console.log('Analyzed items received from backend:', analyzedItems);
      
      setSelectedFiles(prevFiles => {
        const newItems = analyzedItems.filter(newItem => 
          !prevFiles.some(existingItem => existingItem.path === newItem.path)
        );
        return [...prevFiles, ...newItems];
      });
    } catch (error) {
      console.error('Error analyzing files and folders:', error);
    }
  };

  const processItems = async (items) => {
    const result = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.webkitRelativePath) {
        // This is a file within a folder
        const pathParts = item.webkitRelativePath.split('/');
        let currentLevel = result;
        for (let j = 0; j < pathParts.length - 1; j++) {
          let folder = currentLevel.find(f => f.name === pathParts[j] && f.isDirectory);
          if (!folder) {
            folder = {
              name: pathParts[j],
              path: pathParts.slice(0, j + 1).join('/'),
              type: 'directory',
              size: 0,
              lastModified: item.lastModified,
              isDirectory: true,
              children: []
            };
            currentLevel.push(folder);
          }
          currentLevel = folder.children;
        }
        currentLevel.push(await processFile(item));
      } else {
        // This is a file not within a folder
        result.push(await processFile(item));
      }
    }
    return result;
  };

  const processFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return {
      name: file.name,
      path: file.webkitRelativePath || file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      contents: Array.from(uint8Array),
      isDirectory: false
    };
  };

  const processDirectory = async (directoryEntry) => {
    const dirReader = directoryEntry.createReader();
    const entries = await readAllDirectoryEntries(dirReader);
    
    const processedEntries = await Promise.all(entries.map(async (entry) => {
      if (entry.isDirectory) {
        return processDirectory(entry);
      } else {
        const file = await getFileFromEntry(entry);
        return processFile(file);
      }
    }));

    return {
      name: directoryEntry.name,
      path: directoryEntry.fullPath,
      type: 'directory',
      size: 0,
      lastModified: Date.now(),
      contents: [],
      isDirectory: true,
      children: processedEntries.flat()
    };
  };

  const readAllDirectoryEntries = async (dirReader) => {
    const entries = [];
    let readEntries = await readEntriesPromise(dirReader);
    while (readEntries.length > 0) {
      entries.push(...readEntries);
      readEntries = await readEntriesPromise(dirReader);
    }
    return entries;
  };

  const readEntriesPromise = (dirReader) => {
    return new Promise((resolve, reject) => {
      dirReader.readEntries(resolve, reject);
    });
  };

  const getFileFromEntry = (entry) => {
    return new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
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
          webkitdirectory="" 
          directory=""
        />
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm text-white-800 font-light mb-2">Selected Files:</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="border-t border-gray-700">
                {selectedFiles.map((file, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-b-0">
                    <td className="pr-4">
                      <span className="text-sm text-white-700">{file.name}</span>
                    </td>
                    <td className="pr-4">
                      <span className="text-xs text-gray-400">{file.size}</span>
                    </td>
                    <td className="pr-4">
                      <span className="text-xs text-gray-400">{file.item_type}</span>
                    </td>
                    <td className="pl-4 text-right">
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-2 rounded-full hover:bg-gray-850 hover:text-white-100 transition-colors duration-200"
                      >
                        <Icon name="x" size={16} className="text-white-900" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesAndFolders;