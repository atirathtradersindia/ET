import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar, { AdminMobileHeader } from './AdminSidebar';

const AdminLayout = ({ currentUser, onSignOut, toggleMobileMenu }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#071B2E]">
      {/* Mobile Header - ADD THIS LINE */}
      <AdminMobileHeader onToggle={toggleSidebar} />
      
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Main Content Area - Add margin-top for mobile header */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0B2A3C] mt-16 lg:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;