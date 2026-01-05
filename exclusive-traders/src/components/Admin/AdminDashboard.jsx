import React, { useState, useEffect } from 'react';
import { FaUser, FaBox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ navigateToPage }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIpadPro, setIsIpadPro] = useState(false);
  const [isNestHub, setIsNestHub] = useState(false);

  // Enhanced device detection with specific detection for iPad Pro and Nest Hub
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isIpad = /Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
      const isChrome = /Chrome/.test(navigator.userAgent);
      
      // Detect specific devices
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // iPad Pro: 1024px - 1366px with specific aspect ratio (4:3)
      const isIpadProWidth = width >= 1024 && width <= 1366;
      const aspectRatio = width / height;
      const isIpadProRatio = aspectRatio >= 1.29 && aspectRatio <= 1.37; // 4:3 aspect ratio
      
      setIsIpadPro((isIpadProWidth && isIpadProRatio) || (isIpad && width >= 1024));
      
      // Nest Hub (Google Home Hub): 1024px specifically with Chrome
      // Nest Hub has fixed 1024x600 resolution (1.7 aspect ratio)
      const isNestHubWidth = width === 1024;
      const isNestHubAspect = aspectRatio >= 1.6 && aspectRatio <= 1.8;
      
      setIsNestHub((isNestHubWidth && isNestHubAspect) || (isNestHubWidth && isChrome && width === 1024));
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const [recentActivities] = useState([
    {
      id: 1,
      user: 'priya',
      action: 'Requested quote for 1121 Basmati Rice',
      time: '23 hours ago'
    },
    {
      id: 2,
      user: 'System Administrator',
      action: 'Requested quote for Cashew Nuts',
      time: '23 hours ago'
    },
    {
      id: 3,
      user: 'System Administrator',
      action: 'Requested quote for 1121 Basmati Rice',
      time: '12/18/2025'
    },
    {
      id: 4,
      user: 'Shiva',
      action: 'Requested quote for Dark Chocolate Be',
      time: '12/18/2025'
    },
  ]);

  const stats = [
    { 
      id: 1, 
      label: 'Total Users', 
      value: '24', 
      icon: <FaUser />, 
      color: 'bg-blue-500',
      path: '/admin/users'
    },
    { 
      id: 2, 
      label: 'Total Products', 
      value: '156', 
      icon: <FaBox />, 
      color: 'bg-green-500',
      path: '/admin/products'
    },
  ];

  // Handle stat card click
  const handleCardClick = (path) => {
    console.log(`Attempting to navigate to: ${path}`);
    
    if (navigateToPage && typeof navigateToPage === 'function') {
      console.log('Using navigateToPage prop');
      navigateToPage(path.replace('/admin/', ''));
    } 
    else if (navigate && typeof navigate === 'function') {
      console.log('Using react-router navigate');
      navigate(path);
    }
    else {
      console.error('No navigation method available');
      alert(`Would navigate to: ${path}\n\nPlease ensure:\n1. AdminDashboard is wrapped in a Router\n2. navigateToPage prop is provided\n3. Routes are configured for ${path}`);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${
      isNestHub ? 'p-2' : 
      isMobile ? 'p-3' : 
      'p-4 sm:p-5 md:p-6'
    }`}>
      {/* Header */}
      <div className={`${isNestHub ? 'mb-2' : 'mb-3 sm:mb-4 md:mb-5 lg:mb-6'}`}>
        <h1 className={`font-bold text-[#00F5C8] mb-1 ${
          isNestHub ? 'text-lg' : 
          isIpadPro ? 'text-xl' : 
          'text-xl sm:text-2xl lg:text-3xl'
        }`}>Admin Panel</h1>
        <p className={`text-gray-400 ${
          isNestHub ? 'text-xs' : 
          isIpadPro ? 'text-sm' : 
          'text-xs sm:text-sm lg:text-base'
        }`}>Exclusive Trader</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mb-4 sm:mb-5 lg:mb-6"></div>

      {/* Stats Grid - Clickable cards */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'sm:grid-cols-2 gap-4 sm:gap-5'} mb-6 md:mb-8`}>
        {stats.map((stat) => (
          <div
            key={stat.id}
            onClick={() => handleCardClick(stat.path)}
            className={`bg-gray-800 rounded-lg ${
              isNestHub ? 'p-2 hover:p-2.5' : 
              isMobile ? 'p-3 hover:p-3.5' : 
              'p-4 md:p-6 hover:p-5 md:hover:p-7'
            } hover:bg-gray-750 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-[#00F5C8] group`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(stat.path);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-gray-400 ${
                  isNestHub ? 'text-xs' : 
                  isMobile ? 'text-xs' : 
                  'text-sm md:text-base'
                } group-hover:text-white transition-colors`}>
                  {stat.label}
                </p>
                <p className={`${
                  isNestHub ? 'text-lg' : 
                  isMobile ? 'text-xl' : 
                  'text-2xl md:text-3xl'
                } font-bold mt-2 group-hover:text-[#00F5C8] transition-colors`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} ${
                isNestHub ? 'p-2' : 
                isMobile ? 'p-2.5' : 
                'p-3 md:p-4'
              } rounded-full group-hover:scale-110 transition-transform duration-200`}>
                <span className={`text-white ${
                  isNestHub ? 'text-base' : 
                  isMobile ? 'text-lg' : 
                  'text-xl md:text-2xl'
                }`}>{stat.icon}</span>
              </div>
            </div>
            
            {/* Click indicator */}
            <div className={`${
              isNestHub ? 'mt-2 text-[10px]' : 
              isMobile ? 'mt-3 text-xs' : 
              'mt-4 text-xs md:text-sm'
            } text-gray-400 group-hover:text-[#00F5C8] transition-colors flex items-center gap-1`}>
              <span>Click to view {stat.label.toLowerCase()}</span>
              <i className="fas fa-arrow-right ml-1 text-xs group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className={`bg-gray-800 rounded-lg ${
        isNestHub ? 'p-2' : 
        isMobile ? 'p-3' : 
        'p-4 md:p-6'
      }`}>
        <div className={`${isNestHub ? 'mb-3' : 'mb-4 md:mb-6'}`}>
          <h2 className={`font-bold text-[#00F5C8] mb-2 ${
            isNestHub ? 'text-base' : 
            isIpadPro ? 'text-lg' : 
            'text-lg sm:text-xl lg:text-2xl'
          }`}>Recent Activity</h2>
          <p className={`text-gray-400 ${
            isNestHub ? 'text-xs' : 
            isIpadPro ? 'text-sm' : 
            'text-sm md:text-base'
          } mt-1`}>Latest quotes and user actions</p>
        </div>

        {/* Activity List */}
        <div className={`space-y-${isNestHub ? '4' : '6'}`}>
          {recentActivities.map((activity) => (
            <div key={activity.id} className={`border-b border-gray-700 ${
              isNestHub ? 'pb-4' : 'pb-6'
            } last:border-0 last:pb-0`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* User and Action */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className={`font-semibold text-white ${
                      isNestHub ? 'text-sm' : 
                      isMobile ? 'text-sm' : 
                      'text-base md:text-lg'
                    }`}>{activity.user}</h3>
                  </div>
                  <p className={`text-gray-300 ${
                    isNestHub ? 'text-xs' : 
                    isMobile ? 'text-xs' : 
                    'text-sm md:text-base'
                  }`}>{activity.action}</p>
                </div>
                
                {/* Time/Date - Aligned to right */}
                <div className="md:text-right">
                  <div className={`text-gray-400 ${
                    isNestHub ? 'text-xs' : 
                    isMobile ? 'text-xs' : 
                    'text-sm md:text-base'
                  } font-medium`}>
                    {activity.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Administrator Footer */}
        <div className={`mt-8 pt-6 border-t border-gray-700 ${
          isNestHub ? 'mt-4 pt-3' : ''
        }`}>
          <div className="text-center text-gray-400">
            <p className={`${
              isNestHub ? 'text-xs' : 
              isMobile ? 'text-xs' : 
              'text-sm md:text-base'
            }`}>System Administrator</p>
          </div>
        </div>
      </div>

      {/* Bottom Space */}
      <div className={`${
        isNestHub ? 'h-3' : 
        'h-4 sm:h-6 md:h-8'
      }`}></div>
    </div>
  );
};

export default AdminDashboard;