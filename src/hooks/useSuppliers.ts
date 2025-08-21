import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Supplier } from "../lib/supabase";

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: {
    name: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    status: "active" | "inactive" | "pending";
    password: string;
  }) => {
    try {
      // First, create a user account for the supplier using regular signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: supplierData.email,
        password: supplierData.password,
        options: {
          data: {
            full_name: supplierData.contact_name,
            phone: supplierData.phone,
            role: "supplier",
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Create the supplier profile in the users table
      const userProfileData = {
        id: authData.user.id,
        role: "supplier" as const,
        full_name: supplierData.contact_name,
        email: supplierData.email,
        phone: supplierData.phone,
        status: "active" as const,
      };

      const { error: userError } = await supabase
        .from("users")
        .insert(userProfileData)
        .select()
        .single();

      if (userError) throw userError;

      // Create the supplier record in the suppliers table
      const supplierRecordData = {
        id: authData.user.id, // Use the same ID as the user
        name: supplierData.name,
        contact_name: supplierData.contact_name,
        phone: supplierData.phone,
        email: supplierData.email,
        address: supplierData.address,
        status: supplierData.status,
      };

      const { data: supplierRecord, error: supplierError } = await supabase
        .from("suppliers")
        .insert(supplierRecordData)
        .select()
        .single();

      if (supplierError) throw supplierError;

      // Add to local state
      setSuppliers((prev) => [...prev, supplierRecord]);

      return supplierRecord;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create supplier");
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setSuppliers((prev) => prev.map((s) => (s.id === id ? data : s)));
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update supplier");
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);

      if (error) throw error;

      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete supplier");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers,
  };
};
