import React from "react";
import { Bell, ChevronDown, LogOut } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  userName: string;
  onLogout?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  userName,
  onLogout,
}) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer group relative">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {userName
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "A"}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {userName || "Admin"}
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

export default AdminHeader;
