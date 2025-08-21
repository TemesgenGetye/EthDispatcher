import React, { useState } from "react";
import SupplierSidebar from "./SupplierSidebar";
import SupplierHeader from "./SupplierHeader";
import SupplierOrdersView from "./SupplierOrdersView";
import SupplierProfileView from "./SupplierProfileView";
import type { AuthUser } from "../../hooks/useAuth";

interface SupplierDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
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
      case "analytics":
        return "Order Analytics";
      default:
        return "Dashboard";
    }
  };

  const renderMainContent = () => {
    switch (activeMenuItem) {
      case "orders":
        return <SupplierOrdersView supplierId={user.id} />;
      case "profile":
        return <SupplierProfileView user={user} />;
      case "analytics":
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Order Analytics
              </h2>
              <p className="text-gray-600">
                Analytics and reporting features coming soon.
              </p>
            </div>
          </div>
        );
      default:
        return <SupplierOrdersView supplierId={user.id} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SupplierSidebar
        activeItem={activeMenuItem}
        onItemSelect={setActiveMenuItem}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <SupplierHeader
          title={getPageTitle()}
          userName={user.full_name}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
