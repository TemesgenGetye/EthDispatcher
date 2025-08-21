import React, { useState } from "react";
import DriverSidebar from "./DriverSidebar";
import DriverHeader from "./DriverHeader";
import DriverOrdersView from "./DriverOrdersView";
import DriverProfileView from "./DriverProfileView";
import type { AuthUser } from "../../hooks/useAuth";

interface DriverDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({
  user,
  onLogout,
}) => {
  const [activeMenuItem, setActiveMenuItem] = useState("orders");

  const getPageTitle = () => {
    switch (activeMenuItem) {
      case "orders":
        return "My Orders";
      case "profile":
        return "My Profile";
      case "earnings":
        return "Earnings";
      default:
        return "Dashboard";
    }
  };

  const renderMainContent = () => {
    switch (activeMenuItem) {
      case "orders":
        return <DriverOrdersView driverId={user.id} />;
      case "profile":
        return <DriverProfileView user={user} />;
      case "earnings":
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Earnings Overview
              </h2>
              <p className="text-gray-600">
                Earnings tracking feature coming soon.
              </p>
            </div>
          </div>
        );
      default:
        return <DriverOrdersView driverId={user.id} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <DriverSidebar
        activeItem={activeMenuItem}
        onItemSelect={setActiveMenuItem}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DriverHeader
          title={getPageTitle()}
          userName={user.full_name}
          userStatus={user.status}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </div>
    </div>
  );
};

export default DriverDashboard;
