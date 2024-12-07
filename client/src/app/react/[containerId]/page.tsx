"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FileTree from "../../components/FileStructure"; // Adjust the path as necessary
import TerminalWithSocket from "../../components/TerminalComponent"; // Adjust path as necessary
import IDE from "../../components/IDE"; // Adjust path as necessary

interface FileTreePageProps {
  params: {
    containerId: string;
  };
}

const fetchPort = async (containerId: string): Promise<number | null> => {
  try {
    const response = await axios.get<{ port: number }>(
      `http://localhost:9000/api/findPort/${containerId}`
    );
    return response.data.port;
  } catch (error) {
    console.error("Error fetching port:", error);
    return null;
  }
};

const FileTreePage: React.FC<FileTreePageProps> = ({ params }) => {
  const { containerId } = params;
  const [port, setPort] = useState<number | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(
    "/app/src/App.js"
  ); // Track selected file

  // Fetch the port for the container when the component mounts or containerId changes
  useEffect(() => {
    const fetchPortData = async () => {
      const portValue = await fetchPort(containerId);
      setPort(portValue);
      if (portValue) {
        setIframeSrc(`http://localhost:${portValue}`);
      }
      setLoading(false);
    };

    fetchPortData();
  }, [containerId]);

  // Set up the interval to refresh iframe every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (port) {
        setIframeSrc(
          `http://localhost:${port}?timestamp=${new Date().getTime()}`
        );
      }
    }, 10000); // 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [port]);

  // Handle tab close by killing the container
  useEffect(() => {
    const handleTabClose = async () => {
      try {
        // Send a request to the server to kill the container
        await axios.post(`http://localhost:9000/api/killcontainer`, {
          containerId,
        });
      } catch (error) {
        console.error("Error stopping container:", error);
      }
    };

    // Set up the beforeunload event listener to kill the container on tab close
    window.addEventListener("beforeunload", handleTabClose);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [containerId]);

  const refreshIframe = () => {
    if (port) {
      setIframeSrc(
        `http://localhost:${port}?timestamp=${new Date().getTime()}`
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!port) {
    return <div>Error: Unable to find port for container {containerId}</div>;
  }

  return (
    <div className="container">
      <div className="sidebar">
        <FileTree containerId={containerId} onFileClick={setSelectedFile} />
      </div>
      <div className="editor">
        <IDE selectedFile={selectedFile} containerId={containerId} />
      </div>
      <div className="preterm">
        <div className="preview">
          <button className="refresh-button" onClick={refreshIframe}>
            Refresh Preview
          </button>
          <iframe
            className="website"
            src={iframeSrc}
            title="Container Output"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
        <div className="terminal">
          <TerminalWithSocket containerId={containerId} />
        </div>
      </div>
    </div>
  );
};

export default FileTreePage;
