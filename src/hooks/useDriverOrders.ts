import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Order, Return } from "../lib/supabase";

export const useDriverOrders = (driverId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          supplier:suppliers(*)
        `
        )
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"],
    notes?: string
  ) => {
    try {
      console.log("Updating order status:", { orderId, status, notes });

      const updateData: Partial<Order> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add delivery time if status is delivered
      if (status === "delivered") {
        updateData.actual_delivery_time = new Date().toISOString();
      }

      // Add notes if provided
      if (notes) {
        updateData.notes = notes;
      }

      console.log("Update data:", updateData);

      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Handle specific error codes
        if (error.code === "406") {
          throw new Error(
            "Permission denied: You may not have access to update this order"
          );
        } else if (error.code === "42501") {
          throw new Error(
            "Policy violation: Check if you have permission to update orders"
          );
        } else {
          throw new Error(`Update failed: ${error.message}`);
        }
      }

      console.log("Order updated successfully:", data);

      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? data : order))
      );

      return data;
    } catch (err) {
      console.error("Error in updateOrderStatus:", err);
      throw err instanceof Error
        ? err
        : new Error("Failed to update order status");
    }
  };

  const createReturn = async (
    orderId: string,
    returnData: {
      return_to: "supplier" | "warehouse";
      reason: string;
      image_url?: string;
    }
  ) => {
    try {
      console.log("Creating return for order:", { orderId, returnData });

      // First, update the order status to returned
      console.log("Updating order status to returned...");
      await updateOrderStatus(orderId, "returned");

      // Create the return record
      const returnRecord: Omit<Return, "id" | "created_at"> = {
        order_id: orderId,
        driver_id: driverId,
        return_to: returnData.return_to,
        reason: returnData.reason,
        image_url: returnData.image_url,
        return_date: new Date().toISOString(),
      };

      console.log("Creating return record:", returnRecord);

      const { data, error } = await supabase
        .from("returns")
        .insert(returnRecord)
        .select()
        .single();

      if (error) {
        console.error("Supabase return creation error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Handle specific error codes
        if (error.code === "406") {
          throw new Error(
            "Permission denied: You may not have access to create returns"
          );
        } else if (error.code === "42501") {
          throw new Error(
            "Policy violation: Check if you have permission to create returns"
          );
        } else {
          throw new Error(`Return creation failed: ${error.message}`);
        }
      }

      console.log("Return created successfully:", data);
      return data;
    } catch (err) {
      console.error("Error in createReturn:", err);
      throw err instanceof Error ? err : new Error("Failed to create return");
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const assigned = orders.filter((o) => o.status === "assigned").length;
    const outForDelivery = orders.filter(
      (o) => o.status === "out_for_delivery"
    ).length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const returned = orders.filter((o) => o.status === "returned").length;

    return {
      total,
      pending,
      assigned,
      outForDelivery,
      delivered,
      returned,
    };
  };

  useEffect(() => {
    if (driverId) {
      fetchDriverOrders();
    }
  }, [driverId]);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    createReturn,
    getOrderStats,
    refetch: fetchDriverOrders,
  };
};
