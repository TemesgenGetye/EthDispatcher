import React from "react";
import { Phone, Mail, Truck, Calendar, MapPin, Package } from "lucide-react";
import type { AuthUser } from "../../hooks/useAuth";

interface DriverProfileViewProps {
  user: AuthUser;
}

const DriverProfileView: React.FC<DriverProfileViewProps> = ({ user }) => {
  // For now, use placeholder data for performance stats
  // In a real app, you would fetch this data from your API
  const completedOrders = []; // Placeholder - replace with actual data fetching

  // Safety check to ensure user object exists
  if (!user) {
    return (
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-gray-500">
            Loading user profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          My Profile
        </h2>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {user.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.full_name || "Unknown User"}
              </h3>
              <p className="text-gray-600 capitalize">
                {user.role || "driver"} • {user.status || "active"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {user.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {user.phone || "No phone"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-medium text-gray-900">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            {user.vehicle_info && Object.keys(user.vehicle_info).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {user.vehicle_info.vehicle_type || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-medium text-gray-900">
                      {user.vehicle_info.license_plate || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium text-gray-900">
                      {user.vehicle_info.capacity_kg
                        ? `${user.vehicle_info.capacity_kg} kg`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {completedOrders.length}
              </div>
              <div className="text-sm text-gray-600">Orders Completed</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">94.5%</div>
              <div className="text-sm text-gray-600">On-time Rate</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">4.8</div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileView;
