import React, { useState } from "react";
import { X, Edit3, CheckCircle, Truck, Package } from "lucide-react";
import { Order } from "../../lib/supabase";

interface UpdateOrderStatusModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: (
    orderId: string,
    status: Order["status"],
    notes?: string
  ) => Promise<void>;
}

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  order,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order["status"]>(
    order.status
  );
  const [notes, setNotes] = useState("");

  const getNextStatusOptions = (
    currentStatus: Order["status"]
  ): Order["status"][] => {
    switch (currentStatus) {
      case "assigned":
        return ["out_for_delivery"];
      case "out_for_delivery":
        return ["delivered"];
      default:
        return ["out_for_delivery", "delivered"];
    }
  };

  const getStatusLabel = (status: Order["status"]): string => {
    switch (status) {
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status.replace(/_/g, " ");
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "out_for_delivery":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === order.status) return;

    setIsLoading(true);
    try {
      await onSubmit(order.id, selectedStatus, notes.trim() || undefined);
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStatusOptions = getNextStatusOptions(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Update Order Status
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="font-medium">#{order.serial_number}</div>
                <div>{order.customer_name}</div>
                <div className="text-xs text-gray-500">
                  Current Status: {order.status.replace(/_/g, " ")}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Update Status To
              </label>
              <div className="space-y-2">
                {nextStatusOptions.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as Order["status"])
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="font-medium text-gray-900">
                        {getStatusLabel(status)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about the delivery..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || selectedStatus === order.status}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;
