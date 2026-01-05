import React, { useState, useEffect } from 'react';

const AdminHistory = () => {
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

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${
      isNestHub ? 'p-2' : 
      isMobile ? 'p-3' : 
      'p-4 sm:p-5 md:p-6'
    }`}>
      {/* Header */}
      <div className={`${isNestHub ? 'mb-4' : 'mb-6 sm:mb-8 md:mb-10'}`}>
        <h1 className={`font-bold text-[#00F5C8] mb-1 ${
          isNestHub ? 'text-lg' : 
          isIpadPro ? 'text-xl' : 
          'text-xl sm:text-2xl lg:text-3xl'
        }`}>Admin Panel</h1>
        <p className={`text-gray-300 font-medium ${
          isNestHub ? 'text-xs' : 
          isIpadPro ? 'text-base' : 
          'text-base sm:text-lg lg:text-xl'
        }`}>
          Manage users, products and orders
        </p>
      </div>

      {/* Divider - Consistent with other admin pages */}
      <div className="border-t border-gray-700 mb-4 sm:mb-5 lg:mb-6"></div>

      {/* Page Header */}
      <div className={`${isNestHub ? 'mb-4' : 'mb-6 sm:mb-8'}`}>
        <h2 className={`font-bold text-[#00F5C8] mb-2 ${
          isNestHub ? 'text-base' : 
          isIpadPro ? 'text-lg' : 
          'text-lg sm:text-xl lg:text-2xl'
        }`}>System History</h2>
        <p className={`text-gray-400 ${
          isNestHub ? 'text-xs' : 
          isIpadPro ? 'text-sm' : 
          'text-sm md:text-base'
        }`}>
          View system logs, activity history, and audit trails
        </p>
      </div>

      {/* Empty page content - Centered message */}
      <div className={`flex items-center justify-center ${
        isNestHub ? 'min-h-[40vh]' : 
        isMobile ? 'min-h-[50vh]' : 
        'min-h-[60vh]'
      }`}>
        <div className="text-center">
          <div className={`${
            isNestHub ? 'w-16 h-16 mb-3' : 
            isMobile ? 'w-20 h-20 mb-4' : 
            'w-24 h-24 mb-6'
          } mx-auto bg-gray-800 rounded-full flex items-center justify-center`}>
            <svg 
              className={`${
                isNestHub ? 'w-8 h-8' : 
                isMobile ? 'w-10 h-10' : 
                'w-12 h-12'
              } text-gray-500`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className={`font-medium text-gray-300 ${
            isNestHub ? 'text-base mb-1' : 
            isMobile ? 'text-lg mb-2' : 
            'text-xl mb-3'
          }`}>History Section Coming Soon</h3>
          <p className={`text-gray-400 ${
            isNestHub ? 'text-xs max-w-[200px]' : 
            isMobile ? 'text-sm max-w-[250px]' : 
            'text-base max-w-[300px]'
          } mx-auto`}>
            The system history and audit logs will be available in the next update.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`mt-12 pt-8 border-t border-gray-700 text-center ${
        isNestHub ? 'mt-6 pt-4' : 
        isMobile ? 'mt-8 pt-6' : 
        ''
      }`}>
        <p className={`text-gray-400 ${
          isNestHub ? 'text-xs' : 
          isIpadPro ? 'text-sm' : 
          'text-sm md:text-base lg:text-lg'
        }`}>
          Admin Panel • System History Section
        </p>
        <p className={`text-gray-500 ${
          isNestHub ? 'text-[10px] mt-1' : 
          isMobile ? 'text-xs mt-2' : 
          'text-sm mt-3'
        }`}>
          Last updated: December 2025
        </p>
      </div>

      {/* Bottom spacing */}
      <div className={`${
        isNestHub ? 'h-3' : 
        'h-4 sm:h-6 md:h-8'
      }`}></div>
    </div>
  );
};

export default AdminHistory;