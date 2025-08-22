import React, { useState } from "react";
import {
  Package,
  Users,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminDriversView from "./AdminDriversView";
import AdminOrdersView from "./AdminOrdersView";
import AdminSuppliersView from "./AdminSuppliersView";
import { useOrders } from "../../hooks/useOrders";
import { useDrivers } from "../../hooks/useDrivers";
import { useSuppliers } from "../../hooks/useSuppliers";
import type { AuthUser } from "../../hooks/useAuth";

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");

  // Fetch real data from hooks
  const { orders, loading: ordersLoading } = useOrders();
  const { drivers, loading: driversLoading } = useDrivers();
  const { suppliers, loading: suppliersLoading } = useSuppliers();

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
      default: {
        // Calculate real statistics
        const isLoading = ordersLoading || driversLoading || suppliersLoading;

        if (isLoading) {
          return (
            <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          );
        }

        // Calculate statistics
        const activeDrivers = drivers.filter(
          (d) => d.status === "active"
        ).length;
        const totalOrders = orders.length;
        const activeSuppliers = suppliers.filter(
          (s) => s.status === "active"
        ).length;

        // Today's orders
        const today = new Date().toISOString().split("T")[0];
        const todaysOrders = orders.filter(
          (order) => order.created_at && order.created_at.startsWith(today)
        );

        // Calculate today's revenue
        const todaysRevenue = todaysOrders.reduce(
          (sum, order) => sum + order.price,
          0
        );

        // Order status breakdown
        const pendingOrders = orders.filter(
          (o) => o.status === "pending"
        ).length;
        const assignedOrders = orders.filter(
          (o) => o.status === "assigned"
        ).length;
        const deliveryOrders = orders.filter(
          (o) => o.status === "out_for_delivery"
        ).length;
        const deliveredOrders = orders.filter(
          (o) => o.status === "delivered"
        ).length;
        const cancelledOrders = orders.filter(
          (o) => o.status === "cancelled"
        ).length;
        const returnedOrders = orders.filter(
          (o) => o.status === "returned"
        ).length;

        // Recent orders (last 5)
        const recentOrders = orders.slice(0, 5);

        // Priority breakdown
        const highPriorityOrders = orders.filter(
          (o) => o.priority === "high"
        ).length;
        const mediumPriorityOrders = orders.filter(
          (o) => o.priority === "medium"
        ).length;
        const lowPriorityOrders = orders.filter(
          (o) => o.priority === "low"
        ).length;

        return (
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back, {user.full_name}!
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your delivery management system
                today.
              </p>
            </div>

            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {activeDrivers}
                    </div>
                    <div className="text-sm text-gray-600">Active Drivers</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {drivers.filter((d) => d.status === "inactive").length}{" "}
                  inactive
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {todaysOrders.length}
                    </div>
                    <div className="text-sm text-gray-600">Orders Today</div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {totalOrders} total orders
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {activeSuppliers}
                    </div>
                    <div className="text-sm text-gray-600">
                      Active Suppliers
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {suppliers.filter((s) => s.status === "inactive").length}{" "}
                  inactive
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      $
                      {todaysRevenue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-sm text-gray-600">Revenue Today</div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  $
                  {orders
                    .reduce((sum, order) => sum + order.price, 0)
                    .toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                  total
                </div>
              </div>
            </div>

            {/* Order Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Order Status Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {pendingOrders}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalOrders > 0
                                ? (pendingOrders / totalOrders) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">Assigned</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {assignedOrders}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalOrders > 0
                                ? (assignedOrders / totalOrders) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Out for Delivery
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {deliveryOrders}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalOrders > 0
                                ? (deliveryOrders / totalOrders) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Delivered</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {deliveredOrders}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalOrders > 0
                                ? (deliveredOrders / totalOrders) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Cancelled/Returned
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {cancelledOrders + returnedOrders}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalOrders > 0
                                ? ((cancelledOrders + returnedOrders) /
                                    totalOrders) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Priority Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">
                        High Priority
                      </span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {highPriorityOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">
                        Medium Priority
                      </span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">
                      {mediumPriorityOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">
                        Low Priority
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {lowPriorityOrders}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">
                    Completion Rate
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            totalOrders > 0
                              ? (deliveredOrders / totalOrders) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {totalOrders > 0
                        ? Math.round((deliveredOrders / totalOrders) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Orders
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.serial_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.customer_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.supplier?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "out_for_delivery"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "assigned"
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === "pending"
                                  ? "bg-gray-100 text-gray-800"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {order.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                order.priority === "high"
                                  ? "bg-red-500"
                                  : order.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              title={`${order.priority} priority`}
                            ></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            $
                            {order.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      }
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
