import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaWarehouse,
  FaTags,
  FaDollarSign,
  FaUserShield
} from 'react-icons/fa';

const AdminSidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin/products', icon: <FaBox />, label: 'Products' },
    { to: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { to: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-secondary">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Exclusive Trader</p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
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
          </ul>

          {/* Quick Stats */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Online Users</span>
                <span className="text-green-400 font-bold">24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">New Orders</span>
                <span className="text-yellow-400 font-bold">12</span>
              </div>
            </div>
          </div>

          {/* Back to Main Site */}
          <div className="mt-6">
            <a
              href="/home"
              className="flex items-center px-4 py-3 w-full text-gray-300 hover:bg-gray-800 rounded-lg transition-colors border-t border-gray-800 pt-4"
            >
              <FaSignOutAlt className="mr-3 transform rotate-180" />
              <span>Back to Main Site</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;