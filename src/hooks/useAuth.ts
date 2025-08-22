import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { User } from "../lib/supabase";

export interface AuthUser extends User {
  supabase_user_id: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Query to get current session
  const { data: session } = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Query to get user profile from database
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth", "user", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Try to get user data with explicit error handling
      console.log("Fetching user data for ID:", session.user.id);

      // Simple query approach
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user data:", error);
        if (typeof error === "object" && error !== null) {
          const errorObj = error as {
            message?: string;
            details?: string;
            hint?: string;
          };
          console.error(
            "Error details:",
            errorObj.message,
            errorObj.details,
            errorObj.hint
          );
        }
        throw error;
      }

      if (!data) {
        console.error("No user data found for ID:", session.user.id);
        console.log("Attempting to create missing user profile...");

        // Try to create a basic user profile if it doesn't exist
        try {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              email: session.user.email || "",
              role: "supplier", // Default role for missing users
              full_name: session.user.user_metadata?.full_name || "New User",
              phone: session.user.user_metadata?.phone || "",
              status: "active",
            })
            .select("*")
            .single();

          if (createError) {
            console.error("Error creating user profile:", createError);
            throw new Error(
              "Failed to create user profile. Please contact support."
            );
          }

          console.log("Successfully created missing user profile:", newUser);
          return {
            ...newUser,
            supabase_user_id: session.user.id,
          } as AuthUser;
        } catch (createError) {
          console.error("Failed to create user profile:", createError);
          throw new Error(
            "User profile not found and could not be created. Please contact support."
          );
        }
      }

      return {
        ...data,
        supabase_user_id: session.user.id,
      } as AuthUser;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for sign in
  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });

  // Mutation for sign out
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      // setUser(null); // This line was removed as per the new_code, as the user state is now managed by useQuery
    },
  });

  // Set loading state based on queries
  useEffect(() => {
    if (session === undefined) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [session]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      } else if (event === "SIGNED_OUT") {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    return signInMutation.mutateAsync({ email, password });
  };

  const signOut = async () => {
    return signOutMutation.mutateAsync();
  };

  return {
    user: user || null,
    loading: loading || userLoading,
    signIn,
    signOut,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
};
