import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Folder component to recursively render the tree structure
const Folder: React.FC<{ name: string; children: React.ReactNode; onCreateItem: (type: string, path: string) => void; path: string }> = ({ name, children, onCreateItem, path }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleCreateFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      onCreateItem('file', `${path}/${fileName}`); // Use the full path
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      onCreateItem('folder', `${path}/${folderName}`); // Use the full path
    }
  };

  return (
    <div style={{ paddingLeft: '20px' }}>
      <div 
        className="folder-container" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer', 
          position: 'relative' 
        }}
      >
        <div 
          onClick={toggleOpen} 
          style={{ fontWeight: isOpen ? 'bold' : 'normal', marginRight: '10px' }}
        >
          {isOpen ? '📂' : '📁'} {name}
        </div>
        
        {/* Buttons are shown on hover */}
        <div className="folder-options">
          <button onClick={handleCreateFolder} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            📂
          </button>
          <button onClick={handleCreateFile} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            📄
          </button>
        </div>
      </div>
      
      {isOpen && <div>{children}</div>}
    </div>
  );
};

// FileTree component to display the folder structure
const FileTree: React.FC<{ containerId: string; onFileClick: (path: string) => void }> = ({ containerId, onFileClick }) => {
  const [tree, setTree] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/getFolder/${containerId}/app`);
        const treeData = buildTreeFromPaths(Object.keys(response.data.tree));
        setTree(treeData);
      } catch (error) {
        console.error('Error fetching folder structure', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [containerId]);

  const handleCreateItem = async (type: string, path: string) => {
    try {
      await axios.post(`http://localhost:9000/api/createItem`, { type, path, containerId });
      // Refresh the tree after creating the file or folder
      const response = await axios.get(`http://localhost:9000/api/getFolder/${containerId}/app`);
      const treeData = buildTreeFromPaths(Object.keys(response.data.tree));
      setTree(treeData);
    } catch (error) {
      console.error('Error creating item', error);
    }
  };

  const renderTree = (node: Record<string, any>, path: string = '') => {
    return Object.keys(node).map((key) => {
      const currentPath = `${path}/${key}`;
      const isFile = key.includes('.'); // Determine if the item has an extension

      if (isFile) {
        return (
          <div key={key} style={{ paddingLeft: '20px', cursor: 'pointer' }} onClick={() => onFileClick(currentPath)}>
            📄 {key}
          </div>
        );
      } else {
        return (
          <Folder key={key} name={key} onCreateItem={handleCreateItem} path={currentPath}> {/* Pass the correct path */}
            {renderTree(node[key], currentPath)}
          </Folder>
        );
      }
    });
  };

  return <div style={{ overflowY: 'auto', height: '100%' }}>{loading ? <div>Loading...</div> : renderTree(tree)}</div>;
};

export default FileTree;

// Utility function to convert flat file paths to a nested structure
function buildTreeFromPaths(paths: string[]) {
  const tree: Record<string, any> = {};

  paths.forEach((path) => {
    const parts = path.split('/').filter(Boolean); // Split the path and remove empty elements
    let current = tree;

    parts.forEach((part, index) => {
      if (!current[part]) {
        // If it's the last part, determine if it's a file or folder
        current[part] = index === parts.length - 1 && part.includes('.') ? null : {};
      }
      current = current[part];
    });
  });

  return tree;
}
