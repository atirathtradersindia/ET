import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

// Mobile header component with toggle on RIGHT side
export const AdminMobileHeader = ({ onToggle }) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800 shadow-md">
      <div className="flex items-center">
        <div className="ml-4">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-xs">Exclusive Trader</p>
        </div>
      </div>
      <button 
        onClick={onToggle} 
        className="text-[#00F5C8] focus:outline-none"
        aria-label="Open menu"
      >
        <FaBars className="text-2xl" />
      </button>
    </header>
  );
};

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin/products', icon: <FaBox />, label: 'Products' },
    { to: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { to: '/admin/history', icon: <FaCog />, label: 'History' },
  ];

  const handleLogout = () => {
    // Close the sidebar on mobile
    if (onClose) onClose();
    
    // Redirect to main website (home page)
    navigate('/home');
    
    // Optional: You can add logout logic here (clear tokens, etc.)
    // Example: localStorage.removeItem('adminToken');
  };

  return (
    <>
      {/* Mobile Overlay - Only shows when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar - Updated to open from RIGHT side on mobile */}
      <aside className={`
        fixed inset-y-0 lg:left-0 right-0 z-50 w-64 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        lg:inset-auto lg:relative
      `}>
        {/* Logo - Only show on desktop */}
        <div className="hidden lg:block p-6 border-b border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Exclusive Trader</p>
          </div>
        </div>

        {/* Mobile sidebar header with close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-white">Menu</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 h-full overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-[#00F5C8] text-gray-900' 
                      : 'text-gray-300 hover:bg-gray-800'
                    }`
                  }
                  onClick={onClose}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Logout Button - Positioned directly below History button */}
            <li className="mt-6 pt-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 w-full text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors group"
              >
                <FaSignOutAlt className="mr-3 group-hover:rotate-180 transition-transform" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;