import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../lib/supabase";

export interface AuthUser extends User {
  supabase_user_id: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn(
          "Authentication loading timeout - forcing loading to false"
        );
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [loading]);

  const fetchUserProfile = async (supabaseUserId: string) => {
    try {
      console.log("=== FETCH USER PROFILE START ===");
      console.log("Fetching user profile for ID:", supabaseUserId);

      // Test database connectivity first
      console.log("Step 1: Testing database connectivity...");
      const { error: testError } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      if (testError) {
        console.error("Database connectivity test failed:", testError);
      } else {
        console.log("Database connectivity test passed");
      }

      // First, let's check if the user profile exists
      console.log("Step 2: Checking if user profile exists...");
      const { data: existingProfile, error: checkError } = await supabase
        .from("users")
        .select("id, role, full_name, email")
        .eq("id", supabaseUserId);

      if (checkError) {
        console.error("Error checking if user profile exists:", checkError);
      } else {
        console.log("Existing profile check result:", existingProfile);
        console.log("Profile count:", existingProfile?.length || 0);
      }

      // Try to fetch the full profile
      console.log("Step 3: Attempting to fetch full profile...");
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUserId)
        .single();

      console.log("Full profile query result:", { data, error });

      if (error) {
        console.error("Error fetching user profile:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // If the user profile doesn't exist, try to create it
        if (error.code === "PGRST116") {
          console.log("User profile not found, attempting to create one...");
          await createUserProfile(supabaseUserId);
        } else {
          console.error(
            "Non-PGRST116 error, cannot create profile automatically"
          );
          console.log("Setting user to null and loading to false");
          setUser(null);
          setLoading(false);
        }
      } else if (data) {
        console.log("User profile found:", data);
        console.log("Setting user and stopping loading...");
        const userWithSupabaseId = {
          ...data,
          supabase_user_id: supabaseUserId,
        };
        console.log("Final user object:", userWithSupabaseId);
        setUser(userWithSupabaseId);
        setLoading(false);
        console.log("User and loading state updated");
      }

      console.log("=== FETCH USER PROFILE END ===");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      console.log("Setting user to null and loading to false due to error");
      setUser(null);
      setLoading(false);
    }
  };

  const createUserProfile = async (supabaseUserId: string) => {
    try {
      // Get the current auth user to extract metadata
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        console.error("No authenticated user found");
        setLoading(false);
        return;
      }

      // Extract user metadata from auth user
      const userMetadata = authUser.user_metadata || {};
      const { full_name, phone, role, vehicle_info } = userMetadata;

      console.log("Creating user profile with metadata:", userMetadata);
      console.log("Auth user ID:", authUser.id);
      console.log("Supabase user ID:", supabaseUserId);

      // Create user profile with the same ID as the auth user
      const profileData = {
        id: supabaseUserId,
        role: role || "driver",
        full_name: full_name || "Unknown User",
        email: authUser.email || "",
        phone: phone || "",
        vehicle_info: vehicle_info || {},
        status: "active",
      };

      console.log("Attempting to insert profile data:", profileData);

      const { data, error } = await supabase
        .from("users")
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // If it's a policy violation, try to understand what's happening
        if (error.code === "42501") {
          console.error(
            "Policy violation - user may not have permission to insert"
          );
        }

        // Create a minimal user object from auth data as fallback
        console.log("Creating fallback user object from auth data");
        const fallbackUser: AuthUser = {
          id: supabaseUserId,
          role: (role as "driver" | "admin") || "driver",
          full_name: full_name || "Unknown User",
          email: authUser.email || "",
          phone: phone || "",
          vehicle_info: vehicle_info || {},
          status: "active" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          supabase_user_id: supabaseUserId,
        };

        setUser(fallbackUser);
        setLoading(false);
        return;
      } else if (data) {
        console.log("User profile created successfully:", data);
        setUser({ ...data, supabase_user_id: supabaseUserId });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating user profile:", error);

      // Create a minimal user object from auth data as fallback
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          const userMetadata = authUser.user_metadata || {};
          const fallbackUser: AuthUser = {
            id: supabaseUserId,
            role: (userMetadata.role as "driver" | "admin") || "driver",
            full_name: userMetadata.full_name || "Unknown User",
            email: authUser.email || "",
            phone: userMetadata.phone || "",
            vehicle_info: userMetadata.vehicle_info || {},
            status: "active" as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            supabase_user_id: supabaseUserId,
          };

          setUser(fallbackUser);
          setLoading(false);
          return;
        }
      } catch (fallbackError) {
        console.error("Error creating fallback user:", fallbackError);
      }

      setUser(null);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
};
