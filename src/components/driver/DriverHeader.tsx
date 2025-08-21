import React from "react";
import { Bell, ChevronDown, LogOut, Circle } from "lucide-react";

interface DriverHeaderProps {
  title: string;
  userName: string;
  userStatus: string;
  onLogout?: () => void;
}

const DriverHeader: React.FC<DriverHeaderProps> = ({
  title,
  userName,
  userStatus,
  onLogout,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "break":
        return "text-yellow-500";
      case "inactive":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center space-x-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <Circle
            className={`w-3 h-3 fill-current ${getStatusColor(userStatus)}`}
          />
          <span className="text-sm font-medium text-gray-700 capitalize">
            {userStatus}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer group relative">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {userName
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {userName || "Unknown User"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DriverHeader;
