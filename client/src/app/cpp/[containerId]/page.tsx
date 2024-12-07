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

// Define the global port constant
const GLOBAL_PORT = 3000;

const FileTreePage: React.FC<FileTreePageProps> = ({ params }) => {
    const { containerId } = params;
    const [selectedFile, setSelectedFile] = useState<string | null>(
        "/app/1.cpp"
    ); // Track selected file

    // Use the global port for the iframe source
    const iframeSrc = `http://localhost:${GLOBAL_PORT}`; // Hardcoded iframe source with global port

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

        // Clean up the event listener when the component is unmounted
        return () => {
            window.removeEventListener("beforeunload", handleTabClose);
        };
    }, [containerId]);

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
                    <iframe
                        className="website"
                        src={iframeSrc}
                        title="Container Output"
                        style={{ width: "100%", height: "100%", border: "none" }} // Ensure proper display
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
