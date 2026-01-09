// components/admin/ProtectedAdminRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children, currentUser, authLoading }) => {
  console.log("🔐 ProtectedAdminRoute - Checking access...");
  console.log("🔐 currentUser:", currentUser);
  console.log("🔐 authLoading:", authLoading);
  
  // Show loading while checking auth
  if (authLoading) {
    console.log("⏳ Auth still loading, showing loading screen...");
    return (
      <div className="min-h-screen bg-[#071B2E] flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }
  
  // Check if user is logged in
  if (!currentUser) {
    console.log("❌ No user logged in - redirecting to signin");
    return <Navigate to="/signin" replace state={{ from: 'admin' }} />;
  }
  
  // Check if user is admin
  const email = currentUser.email?.toLowerCase() || '';
  const isAdmin = email === "admin@exclusivetrader.com";
  console.log("🔐 Is admin?", isAdmin, "Email:", email);
  
  if (!isAdmin) {
    console.log("❌ User is not admin - redirecting to home");
    return <Navigate to="/home" replace />;
  }
  
  console.log("✅ Admin access granted");
  return children;
};

export default ProtectedAdminRoute;