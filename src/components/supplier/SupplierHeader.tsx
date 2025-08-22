import React from "react";
import { LogOut, Bell, User, Menu } from "lucide-react";

interface SupplierHeaderProps {
  title: string;
  userName: string;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({
  title,
  userName,
  onLogout,
  onMenuToggle,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Page Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              Welcome back, {userName || "Supplier"}
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 md:space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {userName || "Supplier"}
              </div>
              <div className="text-xs text-gray-500">Supplier Account</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-2 md:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1 md:space-x-2 text-sm md:text-base"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SupplierHeader;
