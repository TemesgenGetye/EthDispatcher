import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Calendar,
  Edit3,
  RotateCcw,
} from "lucide-react";
import { useDriverOrders } from "../../hooks/useDriverOrders";
import { Order } from "../../lib/supabase";
import UpdateOrderStatusModal from "./UpdateOrderStatusModal";
import CreateReturnModal from "./CreateReturnModal";

interface DriverOrdersViewProps {
  driverId: string;
}

const DriverOrdersView: React.FC<DriverOrdersViewProps> = ({ driverId }) => {
  const {
    orders,
    loading,
    error,
    updateOrderStatus,
    createReturn,
    getOrderStats,
  } = useDriverOrders(driverId);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const stats = getOrderStats();

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "returned":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "assigned":
        return <Package className="w-4 h-4" />;
      case "out_for_delivery":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "returned":
        return <RotateCcw className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Order["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (
    orderId: string,
    status: Order["status"],
    notes?: string
  ) => {
    try {
      await updateOrderStatus(orderId, status, notes);
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleReturn = async (
    orderId: string,
    returnData: {
      return_to: "supplier" | "warehouse";
      reason: string;
      image_url?: string;
    }
  ) => {
    try {
      await createReturn(orderId, returnData);
      setShowReturnModal(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to create return:", err);
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

  return (
    <div className="flex-1 bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Orders</h2>
        <p className="text-sm text-gray-600">
          Manage your assigned delivery orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {stats.assigned}
          </div>
          <div className="text-sm text-gray-600">Assigned</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {stats.outForDelivery}
          </div>
          <div className="text-sm text-gray-600">Out for Delivery</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {stats.delivered}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {stats.returned}
          </div>
          <div className="text-sm text-gray-600">Returned</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{order.serial_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          order.priority
                        )}`}
                      >
                        {order.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Customer Details
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {order.customer_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Order Details
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Items: {order.items_count}</div>
                          <div>Weight: {order.weight_kg || "N/A"} kg</div>
                          <div>Price: ${order.price}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Pickup
                        </h3>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{order.pickup_address}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Delivery
                        </h3>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{order.delivery_address}</span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Notes
                        </h3>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Order Date:{" "}
                      {new Date(order.order_date).toLocaleDateString()}
                      {order.delivery_date && (
                        <>
                          <span>•</span>
                          Delivery Date:{" "}
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {order.status === "assigned" && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Update Status
                      </button>
                    )}

                    {order.status === "out_for_delivery" && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Delivered
                      </button>
                    )}

                    {order.status !== "delivered" &&
                      order.status !== "returned" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReturnModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Return Order
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showStatusModal && selectedOrder && (
        <UpdateOrderStatusModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleStatusUpdate}
        />
      )}

      {showReturnModal && selectedOrder && (
        <CreateReturnModal
          order={selectedOrder}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleReturn}
        />
      )}
    </div>
  );
};

export default DriverOrdersView;
