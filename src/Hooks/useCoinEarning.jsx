import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useUser from "./useUser";
import usePublicAxios from "./usePublicAxios";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";

const useCoinEarning = () => {
  const { user, refetch } = useUser();
  const queryClient = useQueryClient();
  const axiosPublic = usePublicAxios();
  const socket = useSocket();
  const [isActive, setIsActive] = useState(true);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const accumulatedSecondsRef = useRef(0);
  const intervalRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  const tokenRef = useRef(null);

  // Get token from localStorage
  useEffect(() => {
    tokenRef.current = localStorage.getItem("token");
  }, []);

  // Add coins to wallet
  const addCoins = useCallback(async (minutes) => {
    if (!tokenRef.current || !user?.id || minutes <= 0) {
      console.log("❌ Cannot add coins:", {
        hasToken: !!tokenRef.current,
        hasUserId: !!user?.id,
        minutes
      });
      return;
    }

    console.log(`💰 Adding coins: ${minutes} minute(s) = ${minutes * 5} coins`);

    try {
      const response = await axiosPublic.post(
        "/wallet/add-coins",
        { minutes },
        {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        }
      );

      console.log("✅ Coin add response:", response.data);

      if (response.data?.success) {
        // Invalidate query cache to force refetch
        queryClient.invalidateQueries(["userProfile"]);

        // Update user data
        refetch();

      } else {
        console.error("❌ Coin add failed:", response.data);
      }
    } catch (error) {
      console.error("❌ Error adding coins:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Show error toast for debugging
      if (import.meta.env.DEV) {
        toast.error(`Failed to add coins: ${error.response?.data?.error || error.message}`);
      }
    }
  }, [user?.id, axiosPublic, refetch, queryClient]);

  // Track user activity
  useEffect(() => {
    if (!user?.id) return;

    let lastActivityTime = Date.now();
    const ACTIVITY_TIMEOUT = 60000; // 1 minute of inactivity

    const handleActivity = () => {
      lastActivityTime = Date.now();
      setIsActive(true);

      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Set new timeout
      activityTimeoutRef.current = setTimeout(() => {
        setIsActive(false);
      }, ACTIVITY_TIMEOUT);
    };

    // Track mouse movement
    const handleMouseMove = () => handleActivity();
    // Track keyboard activity
    const handleKeyPress = () => handleActivity();
    // Track scroll
    const handleScroll = () => handleActivity();
    // Track click
    const handleClick = () => handleActivity();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keypress", handleKeyPress);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("click", handleClick);

    // Initial activity
    handleActivity();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keypress", handleKeyPress);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [user?.id]);

  // Start earning system
  const startEarning = useCallback(() => {
    if (!user?.id) return;

    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log("✅ Starting coin earning system with accumulator");

    // We will check every 1 second
    intervalRef.current = setInterval(() => {
      // 1. Basic checks
      if (document.hidden) {
        // If tab is hidden/minimized, do not count time
        return;
      }

      if (!isActive) {
        // If user is inactive (no mouse/keyboard for 60s), do not count time
        return;
      }

      // 2. Increment accumulator
      accumulatedSecondsRef.current += 1;

      // Log for debugging (less frequent)
      if (accumulatedSecondsRef.current % 10 === 0) {
        console.log(`⏱️ Accumulated active time: ${accumulatedSecondsRef.current}s`);
      }

      // 3. Check if we reached a minute (60s)
      if (accumulatedSecondsRef.current >= 60) {
        console.log("💰 Earned 1 minute credit! Adding coins...");
        addCoins(1); // Add 1 minute worth of coins

        // Update total locally for UI
        setTotalMinutes((prev) => prev + 1);

        // Reset accumulator
        accumulatedSecondsRef.current = 0;
      }
    }, 1000); // Run every second

  }, [user?.id, isActive, addCoins]);

  // Track page visibility
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause earning
        setIsActive(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Page is visible, resume earning
        setIsActive(true);
        startEarning();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id, startEarning]);

  // Initialize earning system
  useEffect(() => {
    console.log("🔄 Earning system effect:", {
      hasUserId: !!user?.id,
      isActive,
      hidden: document.hidden
    });

    if (!user?.id) {
      // Clean up if user logs out
      console.log("🧹 Cleaning up earning system: No user");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      accumulatedSecondsRef.current = 0;
      setTotalMinutes(0);
      return;
    }

    // Start earning when user is logged in and page is visible
    if (isActive && !document.hidden) {
      console.log("🚀 Starting earning system");
      startEarning();
    } else {
      console.log("⏸️ Earning system paused:", { isActive, hidden: document.hidden });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.id, isActive, startEarning]);

  // Listen for wallet updates from socket
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleWalletUpdate = (data) => {
      console.log("💰 Wallet updated via socket in useCoinEarning:", data);
      // Invalidate query cache
      queryClient.invalidateQueries(["userProfile"]);
      // Update user data when wallet is updated
      refetch();
    };

    socket.on("walletUpdated", handleWalletUpdate);

    return () => {
      socket.off("walletUpdated", handleWalletUpdate);
    };
  }, [socket, user?.id, refetch, queryClient]);

  // Expose manual test function for debugging (only in dev)
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.testCoinEarning = () => {
        console.log("🧪 Manual test: Adding 1 minute of coins");
        addCoins(1);
      };
      window.testCoinEarningStatus = () => {
        console.log("🧪 Coin Earning Status:", {
          isActive,
          totalMinutes,
          hasUser: !!user?.id,
          hasToken: !!tokenRef.current,
          pageHidden: document.hidden,
          accumulatedSeconds: accumulatedSecondsRef.current,
        });
      };
    }
  }, [isActive, totalMinutes, user?.id, addCoins]);

  return {
    isActive,
    totalMinutes,
  };
};

export default useCoinEarning;

