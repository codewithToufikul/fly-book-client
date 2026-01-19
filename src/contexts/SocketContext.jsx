import { createContext, useContext, useEffect, useState } from "react";
import createSocket from "../utils/socket";
import useUser from "../Hooks/useUser";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      // Disconnect if user logs out
      if (socket && socket.disconnect) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Create socket connection asynchronously to not block page load
    let newSocket = null;
    let isMounted = true;

    // Delay socket connection slightly to allow page to render first
    const connectTimeout = setTimeout(() => {
      try {
        newSocket = createSocket();
        if (!isMounted) {
          if (newSocket && newSocket.disconnect) {
            newSocket.disconnect();
          }
          return;
        }

        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("✅ Socket connected:", newSocket.id);
          if (user?.id && newSocket.emit) {
            newSocket.emit("joinUser", user.id);
          }
        });

        newSocket.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        newSocket.on("connect_error", (error) => {
          // Don't spam console in production
          if (import.meta.env.DEV) {
            console.warn("Socket connection error (non-blocking):", error.message);
          }
          // Socket will auto-reconnect, don't block the app
        });
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        // Don't set socket if creation failed - app will work without it
      }
    }, 500); // Small delay to let page render first

    return () => {
      isMounted = false;
      clearTimeout(connectTimeout);
      if (newSocket && newSocket.disconnect) {
        newSocket.disconnect();
      }
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

