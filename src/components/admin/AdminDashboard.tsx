import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminDriversView from "./AdminDriversView";
import AdminOrdersView from "./AdminOrdersView";
import AdminSuppliersView from "./AdminSuppliersView";
import AdminReportsView from "./AdminReportsView";
import type { AuthUser } from "../../hooks/useAuth";

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");

  const getPageTitle = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return "Dashboard Overview";
      case "drivers":
        return "Driver Management";
      case "orders":
        return "Order Management";
      case "suppliers":
        return "Supplier Management";
      case "reports":
        return "Analytics & Reports";
      default:
        return "Dashboard";
    }
  };

  const renderMainContent = () => {
    switch (activeMenuItem) {
      case "drivers":
        return <AdminDriversView />;
      case "orders":
        return <AdminOrdersView />;
      case "suppliers":
        return <AdminSuppliersView />;
      case "reports":
        return <AdminReportsView />;
      default:
        return (
          <div className="flex-1 p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <div className="text-sm text-gray-600">Active Drivers</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  156
                </div>
                <div className="text-sm text-gray-600">Orders Today</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  12
                </div>
                <div className="text-sm text-gray-600">Active Suppliers</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  $45.2K
                </div>
                <div className="text-sm text-gray-600">Revenue Today</div>
              </div>
            </div>

            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to Admin Dashboard
              </h2>
              <p className="text-gray-600">
                Use the sidebar to navigate between different management
                sections.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <AdminSidebar
        activeItem={activeMenuItem}
        onItemSelect={setActiveMenuItem}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={getPageTitle()}
          userName={user.full_name}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
