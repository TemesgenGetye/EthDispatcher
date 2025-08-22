import React from "react";
import { Package, User, BarChart3, X } from "lucide-react";

interface SupplierSidebarProps {
  activeItem: string;
  onItemSelect: (item: string) => void;
  onClose?: () => void;
}

const SupplierSidebar: React.FC<SupplierSidebarProps> = ({
  activeItem,
  onItemSelect,
  onClose,
}) => {
  const menuItems = [
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
      description: "View and track orders",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      description: "Manage account details",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Order insights",
    },
  ];

  return (
    <div className="w-64 md:w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-semibold text-gray-900">
                Supplier Portal
              </h1>
              <p className="text-xs text-gray-500">Order Management</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Supplier Management System
        </div>
      </div>
    </div>
  );
};

export default SupplierSidebar;
