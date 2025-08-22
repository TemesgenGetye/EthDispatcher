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
      // Check if email or phone already exists in users table
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("email, phone")
        .or(`email.eq.${supplierData.email},phone.eq.${supplierData.phone}`);

      if (checkError) {
        console.error("Error checking existing users:", checkError);
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.email === supplierData.email) {
          throw new Error(
            "This email address is already registered. Please use a different email."
          );
        }
        if (existingUser.phone === supplierData.phone) {
          throw new Error(
            "This phone number is already registered. Please use a different phone number."
          );
        }
      }

      // Check if email or phone already exists in suppliers table
      const { data: existingSuppliers, error: supplierCheckError } =
        await supabase
          .from("suppliers")
          .select("email, phone")
          .or(`email.eq.${supplierData.email},phone.eq.${supplierData.phone}`);

      if (supplierCheckError) {
        console.error("Error checking existing suppliers:", supplierCheckError);
      }

      if (existingSuppliers && existingSuppliers.length > 0) {
        const existingSupplier = existingSuppliers[0];
        if (existingSupplier.email === supplierData.email) {
          throw new Error(
            "This email address is already registered as a supplier. Please use a different email."
          );
        }
        if (existingSupplier.phone === supplierData.phone) {
          throw new Error(
            "This phone number is already registered as a supplier. Please use a different phone number."
          );
        }
      }
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
      console.log("Creating user profile for supplier:", authData.user.id);

      const userProfileData = {
        id: authData.user.id,
        role: "supplier" as const,
        full_name: supplierData.contact_name,
        email: supplierData.email,
        phone: supplierData.phone,
        status: "active" as const,
      };

      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .insert(userProfileData)
        .select()
        .single();

      if (userError) {
        console.error("Error creating user profile:", userError);
        console.error("User profile data:", userProfileData);
        throw new Error(`Failed to create user profile: ${userError.message}`);
      }

      console.log("Successfully created user profile:", userProfile);

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

      console.log("Creating supplier record:", supplierRecordData);

      const { data: supplierRecord, error: supplierError } = await supabase
        .from("suppliers")
        .insert(supplierRecordData)
        .select()
        .single();

      if (supplierError) {
        console.error("Error creating supplier record:", supplierError);
        console.error("Supplier record data:", supplierRecordData);
        throw new Error(
          `Failed to create supplier record: ${supplierError.message}`
        );
      }

      console.log("Successfully created supplier record:", supplierRecord);

      // Add to local state
      setSuppliers((prev) => [...prev, supplierRecord]);

      console.log("Supplier creation completed successfully!");
      return supplierRecord;
    } catch (err) {
      console.error("Detailed error:", err);

      if (err instanceof Error) {
        // Handle specific error cases
        if (
          err.message.includes("duplicate key value violates unique constraint")
        ) {
          if (err.message.includes("email")) {
            throw new Error(
              "This email address is already registered. Please use a different email."
            );
          }
          if (err.message.includes("phone")) {
            throw new Error(
              "This phone number is already registered. Please use a different phone number."
            );
          }
          throw new Error(
            "This email or phone number is already in use. Please use different contact information."
          );
        }

        if (err.message.includes("409")) {
          throw new Error(
            "This email or phone number is already in use. Please use different contact information."
          );
        }

        throw err;
      }

      throw new Error("Failed to create supplier");
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
      // First, delete the supplier record
      const { error: supplierError } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);

      if (supplierError) {
        console.error("Supplier deletion error:", supplierError);
        throw supplierError;
      }

      // Then, delete the corresponding user record
      const { error: userError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (userError) {
        console.error("Warning: Failed to delete user record:", userError);
        // Don't throw here as the supplier was deleted successfully
      }

      // Update local state
      setSuppliers((prev) => prev.filter((s) => s.id !== id));

      console.log("Supplier deleted successfully from database");
    } catch (err) {
      console.error("Delete supplier error:", err);
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
