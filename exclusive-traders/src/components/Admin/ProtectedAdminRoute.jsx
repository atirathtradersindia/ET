// components/admin/ProtectedAdminRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children, currentUser }) => {
  console.log("🔐 ProtectedAdminRoute - Checking access...");
  console.log("🔐 currentUser:", currentUser);
  
  // Check if user is logged in
  if (!currentUser) {
    console.log("❌ No user logged in - redirecting to signin");
    return <Navigate to="/signin" replace />;
  }
  
  // Check if user is admin
  const isAdmin = currentUser.email === "admin@exclusivetrader.com";
  console.log("🔐 Is admin?", isAdmin);
  
  if (!isAdmin) {
    console.log("❌ User is not admin - redirecting to home");
    return <Navigate to="/home" replace />;
  }
  
  console.log("✅ Admin access granted");
  return children;
};

export default ProtectedAdminRoute;