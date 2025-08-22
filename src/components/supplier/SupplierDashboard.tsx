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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuItemSelect = (item: string) => {
    setActiveMenuItem(item);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  const renderMainContent = () => {
    switch (activeMenuItem) {
      case "orders":
        return <SupplierOrdersView supplierId={user.id} />;
      case "profile":
        return <SupplierProfileView user={user} />;
      case "analytics":
        return (
          <div className="flex-1 p-3 md:p-6 bg-gray-50">
            <div className="text-center py-8 md:py-12">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">
                Order Analytics
              </h2>
              <p className="text-sm md:text-base text-gray-600">
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
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <SupplierSidebar
          activeItem={activeMenuItem}
          onItemSelect={handleMenuItemSelect}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SupplierSidebar
          activeItem={activeMenuItem}
          onItemSelect={handleMenuItemSelect}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <SupplierHeader
          title={getPageTitle()}
          userName={user.full_name}
          onLogout={onLogout}
          onMenuToggle={handleMobileMenuToggle}
        />

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
