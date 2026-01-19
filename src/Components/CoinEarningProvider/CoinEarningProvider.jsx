import { useEffect } from "react";
import useCoinEarning from "../../Hooks/useCoinEarning";

/**
 * CoinEarningProvider - Automatically tracks user activity and adds coins
 * This component should be placed in RootLayout to work across all pages
 */
const CoinEarningProvider = ({ children }) => {
  // This hook will automatically track activity and add coins
  const { isActive, totalMinutes } = useCoinEarning();

  useEffect(() => {
    console.log("🎯 CoinEarningProvider mounted", { isActive, totalMinutes });
  }, [isActive, totalMinutes]);

  return <>{children}</>;
};

export default CoinEarningProvider;

