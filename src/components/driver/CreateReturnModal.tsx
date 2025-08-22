import React, { useState } from "react";
import { X, RotateCcw, Warehouse, Truck, AlertCircle } from "lucide-react";
import { Order } from "../../lib/supabase";

interface CreateReturnModalProps {
  order: Order;
  onClose: () => void;
  onSubmit: (
    orderId: string,
    returnData: {
      return_to: "supplier" | "warehouse";
      reason: string;
      image_url?: string;
    }
  ) => Promise<void>;
}

const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  order,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [returnTo, setReturnTo] = useState<"supplier" | "warehouse">(
    "warehouse"
  );
  const [reason, setReason] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(order.id, {
        return_to: returnTo,
        reason: reason.trim(),
        image_url: imageUrl.trim() || undefined,
      });
    } catch (err) {
      console.error("Failed to create return:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Return Order
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
            {/* Return Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Return To
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="returnTo"
                    value="warehouse"
                    checked={returnTo === "warehouse"}
                    onChange={(e) =>
                      setReturnTo(e.target.value as "supplier" | "warehouse")
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Warehouse</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="returnTo"
                    value="supplier"
                    checked={returnTo === "supplier"}
                    onChange={(e) =>
                      setReturnTo(e.target.value as "supplier" | "warehouse")
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Supplier</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Return Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Explain why this order is being returned..."
              />
            </div>

            {/* Warning */}
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Important</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                This action will mark the order as returned and create a return
                record. The order status cannot be easily reversed.
              </p>
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
                disabled={isLoading || !reason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Return..." : "Create Return"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReturnModal;
