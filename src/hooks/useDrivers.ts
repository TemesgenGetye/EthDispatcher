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
      // Check if user with this email or phone already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("id, email, phone")
        .or(`email.eq.${driverData.email},phone.eq.${driverData.phone}`);

      if (checkError) {
        console.error("Error checking existing users:", checkError);
        // If the OR query fails, try separate queries
        const { data: emailCheck, error: emailError } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", driverData.email)
          .single();

        if (emailError && emailError.code !== "PGRST116") {
          // PGRST116 = no rows returned
          throw new Error(
            "Failed to check for existing users. Please try again."
          );
        }

        if (emailCheck) {
          throw new Error(
            `A user with email ${driverData.email} already exists`
          );
        }

        const { data: phoneCheck, error: phoneError } = await supabase
          .from("users")
          .select("id, phone")
          .eq("phone", driverData.phone)
          .single();

        if (phoneError && phoneError.code !== "PGRST116") {
          throw new Error(
            "Failed to check for existing users. Please try again."
          );
        }

        if (phoneCheck) {
          throw new Error(
            `A user with phone number ${driverData.phone} already exists`
          );
        }
      } else if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.email === driverData.email) {
          throw new Error(
            `A user with email ${driverData.email} already exists`
          );
        }
        if (existingUser.phone === driverData.phone) {
          throw new Error(
            `A user with phone number ${driverData.phone} already exists`
          );
        }
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

        // Handle specific database constraint errors
        if (
          error.message.includes(
            "duplicate key value violates unique constraint"
          )
        ) {
          if (error.message.includes("users_email_key")) {
            throw new Error(
              `A user with email ${driverData.email} already exists`
            );
          }
          if (error.message.includes("users_phone_key")) {
            throw new Error(
              `A user with phone number ${driverData.phone} already exists`
            );
          }
          throw new Error(
            "A user with this email or phone number already exists"
          );
        }

        if (error.code === "406") {
          throw new Error(
            "Invalid data format. Please check your input and try again."
          );
        }

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

  const updateDriver = async (id: string, updates: Partial<User>) => {
    try {
      // If email is being updated, check if it's already taken by another user
      if (updates.email) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", updates.email)
          .neq("id", id) // Exclude current user
          .single();

        if (existingUser) {
          throw new Error(`A user with email ${updates.email} already exists`);
        }
      }

      // If phone is being updated, check if it's already taken by another user
      if (updates.phone) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, phone")
          .eq("phone", updates.phone)
          .neq("id", id) // Exclude current user
          .single();

        if (existingUser) {
          throw new Error(
            `A user with phone number ${updates.phone} already exists`
          );
        }
      }

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setDrivers((prev) => prev.map((d) => (d.id === id ? data : d)));
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update driver");
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
    updateDriver,
    refetch: fetchDrivers,
  };
};
