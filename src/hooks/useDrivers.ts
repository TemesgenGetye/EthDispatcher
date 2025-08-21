import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../lib/supabase";

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "driver")
        .order("full_name");

      if (error) throw error;
      setDrivers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async (
    driverData: Omit<User, "id" | "created_at" | "updated_at"> & {
      password: string;
    }
  ) => {
    try {
      // Check if user with this email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", driverData.email)
        .single();

      if (existingUser) {
        throw new Error(`A user with email ${driverData.email} already exists`);
      }

      // First, create a user account for the driver using regular signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: driverData.email,
        password: driverData.password,
        options: {
          data: {
            full_name: driverData.full_name,
            phone: driverData.phone,
            role: "driver",
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log("Auth user created:", authData.user.id);

      // Create the driver profile in the users table
      const userProfileData = {
        id: authData.user.id,
        role: "driver" as const,
        full_name: driverData.full_name,
        email: driverData.email,
        phone: driverData.phone,
        vehicle_info: driverData.vehicle_info,
        status: driverData.status || "active",
      };

      console.log("Creating user profile:", userProfileData);

      const { data, error } = await supabase
        .from("users")
        .insert(userProfileData)
        .select()
        .single();

      if (error) {
        console.error("Profile creation error:", error);
        throw new Error(`Failed to create user profile: ${error.message}`);
      }

      console.log("User profile created successfully:", data);

      setDrivers((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Driver creation error:", err);
      throw err instanceof Error ? err : new Error("Failed to create driver");
    }
  };

  const updateDriverStatus = async (id: string, status: User["status"]) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setDrivers((prev) => prev.map((d) => (d.id === id ? data : d)));
      return data;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to update driver status");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return {
    drivers,
    loading,
    error,
    createDriver,
    updateDriverStatus,
    refetch: fetchDrivers,
  };
};
