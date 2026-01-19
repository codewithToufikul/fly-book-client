import { Outlet } from "react-router";
import { SocketProvider } from "../../contexts/SocketContext";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import CoinEarningProvider from "../CoinEarningProvider/CoinEarningProvider";

const RootLayout = () => {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <CoinEarningProvider>
          <Outlet />
        </CoinEarningProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
};

export default RootLayout;

