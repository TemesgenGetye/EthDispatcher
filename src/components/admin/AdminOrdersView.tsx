import React, { useState } from "react";
import {
  Search,
  Plus,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { useOrders } from "../../hooks/useOrders";
import { useDrivers } from "../../hooks/useDrivers";
import { Order } from "../../lib/supabase";
import CreateOrderModal from "./CreateOrderModal";
import EditOrderModal from "./EditOrderModal";

const AdminOrdersView: React.FC = () => {
  const {
    orders,
    loading,
    error,
    assignDriver,
    updateOrderStatus,
    deleteOrder,
    updateOrder,
    refetch,
  } = useOrders();
  const { drivers } = useDrivers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "out_for_delivery":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "assigned":
        return <User className="w-4 h-4 text-purple-600" />;
      case "pending":
        return <Package className="w-4 h-4 text-gray-600" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case "returned":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "returned":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.driver?.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDriverAssignment = async (orderId: string, driverId: string) => {
    try {
      await assignDriver(orderId, driverId);
    } catch (err) {
      console.error("Failed to assign driver:", err);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as Order["status"]);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleUpdateOrder = async (orderData: Partial<Order>) => {
    if (!editingOrder) return;
    try {
      await updateOrder(editingOrder.id, orderData);
      setEditingOrder(null);
      console.log("Order updated successfully");
    } catch (err) {
      console.error("Failed to update order:", err);
      throw err;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      try {
        await deleteOrder(orderId);
        console.log("Order deleted successfully");
      } catch (err) {
        console.error("Failed to delete order:", err);
        alert("Failed to delete order. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading orders</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    outForDelivery: orders.filter((o) => o.status === "out_for_delivery")
      .length,
    assigned: orders.filter((o) => o.status === "assigned").length,
    pending: orders.filter((o) => o.status === "pending").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    returned: orders.filter((o) => o.status === "returned").length,
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Order Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track all delivery orders across your fleet
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {statusCounts.total}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.delivered}
            </div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.outForDelivery}
            </div>
            <div className="text-sm text-gray-600">Out for Delivery</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {statusCounts.assigned}
            </div>
            <div className="text-sm text-gray-600">Assigned</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {statusCounts.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts.returned}
            </div>
            <div className="text-sm text-gray-600">Returned</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers, drivers..."
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
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold text-gray-900">
                    {order.serial_number}
                  </span>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${getPriorityColor(
                    order.priority
                  )}`}
                  title={`${order.priority} priority`}
                ></div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ${order.price}
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Customer & Locations */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {order.customer_name}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Pickup
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.pickup_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Delivery
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supplier</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.supplier?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.items_count} packages
                  </span>
                </div>
                {order.weight_kg && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.weight_kg} kg
                    </span>
                  </div>
                )}
                {order.distance_km && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.distance_km} km
                    </span>
                  </div>
                )}
              </div>

              {/* Driver Assignment & Actions */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Assigned Driver
                  </label>
                  <select
                    value={order.driver_id || ""}
                    onChange={(e) =>
                      e.target.value &&
                      handleDriverAssignment(order.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={
                      order.status === "delivered" ||
                      order.status === "cancelled"
                    }
                  >
                    <option value="">Select Driver</option>
                    {drivers
                      .filter((d) => d.status === "active")
                      .map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.full_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {order.estimated_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Estimated Time
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.estimated_time}
                    </span>
                  </div>
                )}

                {/* Edit/Delete Actions */}
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Order"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Return Information - Show only for returned orders */}
            {order.status === "returned" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs">↩</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 mb-1">
                        Order Returned
                      </h4>
                      <p className="text-sm text-red-700">
                        {order.notes ||
                          "This order was returned. Please contact the driver for more details."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Notes - Show for all orders */}
            {order.notes && order.status !== "returned" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {order.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-600">
            No orders match your current search and filter criteria.
          </p>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={refetch}
        />
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSubmit={handleUpdateOrder}
        />
      )}
    </div>
  );
};

export default AdminOrdersView;
