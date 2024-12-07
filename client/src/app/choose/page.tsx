"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Choose() {
    const router = useRouter();

    const handlesubmitReact = async () => {
        const response = await axios.get("http://localhost:9000/api/react-container");
        const containerId = response.data.containerId;
        console.log(response);
        router.push(`/react/${containerId}`);
    };
    const handlesubmitCpp = async () => {
        const response = await axios.get("http://localhost:9000/api/cpp-container");
        const containerId = response.data.containerId;
        console.log(response);
        router.push(`/cpp/${containerId}`);
    };
    const handlesubmitPython = async () => {
        const response = await axios.get("http://localhost:9000/api/python-container");
        const containerId = response.data.containerId;
        console.log(response);
        router.push(`/py/${containerId}`);
    };

    // Inject the keyframes styles dynamically when the component is mounted
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerHTML = `
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            @keyframes slideIn {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0); }
            }
            @keyframes buttonAppear {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet); // Clean up by removing the injected style on unmount
        };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.buttonContainer}>
                <button style={styles.button} onClick={handlesubmitReact}>
                    React
                </button>
                <button style={styles.button} onClick={handlesubmitCpp}>
                    CPP
                </button>
                <button style={styles.button} onClick={handlesubmitPython}>
                    Python
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#121212",  // Dark background color
        color: "#ffffff",  // Light text color
        fontFamily: "'Arial', sans-serif",
        animation: "fadeIn 2s ease-out",
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "column" as "column", // Ensure it's a valid value for flexDirection
        gap: "20px",
        animation: "slideIn 1s ease-out",
    },
    button: {
        padding: "15px 30px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#ffffff",  // Text color on button
        backgroundColor: "#333333",  // Dark button background
        border: "1px solid #444444",  // Dark border color
        borderRadius: "8px",
        cursor: "pointer",
        transition: "transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",  // Dark shadow
        animation: "buttonAppear 1s ease-out",
    },
    buttonHover: {
        backgroundColor: "#555555",  // Darker button on hover
        transform: "translateY(-5px)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
    },
    buttonFocus: {
        outline: "none",
        boxShadow: "0 0 0 2px rgba(38, 143, 255, 0.5)",
    },
};
