import { io } from "socket.io-client";

// Get the socket URL from environment variable or use default
const getSocketUrl = () => {
  // Always use API server for socket connection
  // Check environment variable first
  if (import.meta.env.VITE_SOCKET_SERVER_URL) {
    return import.meta.env.VITE_SOCKET_SERVER_URL;
  }
  
  // Production: use API server
  if (window.location.hostname === "flybook.com.bd" || window.location.hostname.includes("flybook")) {
    return "https://fly-book-server-lzu4.onrender.com";
  }
  
  // Development: use localhost or API server
  return import.meta.env.VITE_SOCKET_URL || "https://fly-book-server-lzu4.onrender.com";
};

// Socket configuration with better error handling
const socketConfig = {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 3, // Reduced attempts
  reconnectionDelayMax: 5000,
  timeout: 10000, // Connection timeout
  autoConnect: true,
};

/**
 * Create a socket connection with proper configuration
 * @returns {Socket} Socket.io client instance
 */
export const createSocket = () => {
  try {
    const url = getSocketUrl();
    console.log("Connecting to socket server:", url);
    return io(url, socketConfig);
  } catch (error) {
    console.error("Failed to create socket:", error);
    // Return a dummy socket that won't crash the app
    return {
      on: () => {},
      emit: () => {},
      disconnect: () => {},
      connected: false,
    };
  }
};

export default createSocket;

