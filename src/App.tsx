import React, { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import DriverDashboard from "./components/driver/DriverDashboard";
import SupplierDashboard from "./components/supplier/SupplierDashboard";

function App() {
  const { user, loading, signOut } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log("App state changed:", {
      user: user?.id,
      loading,
      userRole: user?.role,
    });
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not logged in
  if (!user) {
    console.log("No user found, showing AuthPage");
    return <AuthPage onLogin={() => {}} />;
  }

  console.log("User authenticated:", {
    id: user.id,
    role: user.role,
    name: user.full_name,
  });

  // Render appropriate dashboard based on user role
  if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === "driver") {
    return <DriverDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.role === "supplier") {
    return <SupplierDashboard user={user} onLogout={handleLogout} />;
  }

  // Fallback for unknown roles
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-4">
          Your account role is not recognized. Please contact an administrator.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;
