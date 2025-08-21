import React from "react";
import { Package, User, DollarSign, Settings } from "lucide-react";

interface DriverSidebarProps {
  activeItem: string;
  onItemSelect: (item: string) => void;
}

const DriverSidebar: React.FC<DriverSidebarProps> = ({ activeItem, onItemSelect }) => {
  const menuItems = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "Profile", icon: User },
    { id: "earnings", label: "Earnings", icon: DollarSign },
  ];

  return (
    <div className="w-16 bg-slate-800 h-screen flex flex-col items-center py-6 space-y-8">
      {/* Logo */}
      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">
        DD
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col justify-between h-full">
        <nav className="flex flex-col space-y-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onItemSelect(item.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors group relative ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
        <div>
          <Settings className="text-slate-400 hover:text-white size-5" />
        </div>
      </div>
    </div>
  );
};

export default DriverSidebar;