import React, { useState } from "react";
import {
  Search,
  Truck,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useDrivers } from "../../hooks/useDrivers";
import { useOrders } from "../../hooks/useOrders";
import CreateDriverModal from "./CreateDriverModal";

const AdminDriversView: React.FC = () => {
  const { drivers, loading, error, updateDriverStatus, createDriver } =
    useDrivers();
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "break":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "inactive":
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      case "break":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDriverOrders = (driverId: string) => {
    return orders.filter((order) => order.driver_id === driverId);
  };

  const getActiveOrders = (driverId: string) => {
    return orders.filter(
      (order) =>
        order.driver_id === driverId &&
        ["assigned", "out_for_delivery"].includes(order.status)
    ).length;
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDriverStatus(
        id,
        newStatus as "active" | "inactive" | "break"
      );
    } catch (err) {
      console.error("Failed to update driver status:", err);
    }
  };

  const handleCreateDriver = async (driverData: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    vehicle_type: string;
    license_plate: string;
    capacity_kg: number;
    status: "active" | "inactive" | "break";
  }) => {
    try {
      const driverToCreate = {
        ...driverData,
        role: "driver" as const,
        vehicle_info: {
          vehicle_type: driverData.vehicle_type,
          license_plate: driverData.license_plate,
          capacity_kg: driverData.capacity_kg,
        },
      };
      await createDriver(driverToCreate);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create driver:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading drivers</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "active").length,
    inactive: drivers.filter((d) => d.status === "inactive").length,
    break: drivers.filter((d) => d.status === "break").length,
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Driver Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and manage your delivery driver fleet
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Driver</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {statusCounts.total}
            </div>
            <div className="text-sm text-gray-600">Total Drivers</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.active}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.break}
            </div>
            <div className="text-sm text-gray-600">On Break</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {statusCounts.inactive}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search drivers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="break">On Break</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => {
          const driverOrders = getDriverOrders(driver.id);
          const activeOrdersCount = getActiveOrders(driver.id);
          const completedOrders = driverOrders.filter(
            (o) => o.status === "delivered"
          ).length;

          return (
            <div
              key={driver.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {driver.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {driver.vehicle_info?.vehicle_type || "Vehicle"} -{" "}
                      {driver.vehicle_info?.license_plate || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(driver.status)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      driver.status
                    )}`}
                  >
                    {driver.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{driver.email}</span>
                </div>
                {driver.vehicle_info?.capacity_kg && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Capacity: {driver.vehicle_info.capacity_kg} kg</span>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {activeOrdersCount}
                  </div>
                  <div className="text-xs text-gray-600">Active Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {completedOrders}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>

              {/* Status Control */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <select
                  value={driver.status}
                  onChange={(e) =>
                    handleStatusChange(driver.id, e.target.value)
                  }
                  className="text-sm px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="break">On Break</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Joined</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(driver.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Drivers Found
          </h3>
          <p className="text-gray-600">
            No drivers match your current search and filter criteria.
          </p>
        </div>
      )}

      {/* Create Driver Modal */}
      {showCreateModal && (
        <CreateDriverModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDriver}
        />
      )}
    </div>
  );
};

export default AdminDriversView;
