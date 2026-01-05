// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = ({
  navigateToPage,
  currentUser,
  onSignOut,
  isMobileMenuOpen,
  toggleMobileMenu,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutRef = useRef(null);

  // Check viewport for responsive behavior - UPDATED for Nest Hub Max
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Nest Hub Max has 1280x800 resolution (aspect ratio ~1.6)
      // We'll treat it as mobile if:
      // 1. Width is ≤ 1280px AND height is ≤ 900px (tablet/mobile range)
      // OR
      // 2. Aspect ratio suggests a mobile/tablet device (height is relatively large)
      const isNestHubMax = width === 1280 && height === 800;
      const isTabletSize = width <= 1280 && height <= 900;
      const isMobileAspectRatio = aspectRatio < 1.7; // Mobile/tablets typically have smaller aspect ratios
      
      // Show toggle bar for:
      // - All devices < 1280px width
      // - Nest Hub Max specifically (1280x800)
      // - Any device with tablet-like dimensions
      const shouldUseToggle = width < 1280 || isNestHubMax || (isTabletSize && isMobileAspectRatio);
      
      setIsMobileView(shouldUseToggle);
      
      // Close mobile menu when switching to desktop view
      if (!shouldUseToggle && isMobileMenuOpen) {
        toggleMobileMenu(false);
      }
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  // Get current page from URL path
  const getCurrentPageFromPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/services') return 'services';
    if (path === '/about') return 'about';
    if (path === '/industries') return 'industries';
    if (path === '/quote-request') return 'quote-request';
    if (path === '/blog') return 'blog';
    if (path === '/join-us') return 'join-us';
    if (path === '/contact') return 'contact';
    if (path === '/leadership') return 'leadership';
    if (path === '/signin') return 'signin';
    if (path === '/signup') return 'signup';
    if (path === '/orders') return 'orders';
    if (path === '/settings') return 'settings';
    if (path === '/account') return 'account';
    return 'home';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Set active section based on URL path when location changes
  useEffect(() => {
    const currentPage = getCurrentPageFromPath();
    
    // Clear any existing scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set active section immediately based on URL
    setActiveSection(currentPage);
  }, [location.pathname]);

  // Handle scroll detection ONLY on home page
  useEffect(() => {
    // Only set up scroll detection if we're on the home page
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    
    if (!isHomePage) {
      // If not on home page, remove any scroll listeners
      return;
    }

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const headerHeight = 100;
        
        // Define all possible section IDs that might exist on home page
        const possibleSectionIds = [
          'home',
          'services',
          'about',
          'industries',
          'leadership',
          'quote-request',
          'blog',
          'join-us',
          'contact'
        ];
        
        // Find which sections actually exist on the page
        const existingSections = possibleSectionIds
          .map(id => ({ id, element: document.getElementById(id) }))
          .filter(s => s.element !== null)
          .map(s => ({
            id: s.id,
            element: s.element,
            top: s.element.offsetTop - headerHeight,
            bottom: s.element.offsetTop + s.element.offsetHeight - headerHeight
          }));
        
        if (existingSections.length === 0) {
          setActiveSection('home');
          return;
        }
        
        // Sort by top position
        existingSections.sort((a, b) => a.top - b.top);
        
        // Find current section based on scroll position with precise calculation
        let currentSection = 'home';
        
        // Check if we're at the very top
        if (scrollPosition < 50) {
          currentSection = 'home';
        } else {
          // Check which section is most visible in the viewport
          let maxVisibleArea = 0;
          let mostVisibleSection = 'home';
          
          for (const section of existingSections) {
            const visibleTop = Math.max(0, scrollPosition - section.top);
            const visibleBottom = Math.min(
              section.bottom,
              scrollPosition + windowHeight
            ) - Math.max(section.top, scrollPosition);
            
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            
            if (visibleHeight > maxVisibleArea) {
              maxVisibleArea = visibleHeight;
              mostVisibleSection = section.id;
            }
          }
          
          // If no section has significant visible area, find the closest section
          if (maxVisibleArea < windowHeight * 0.1) {
            let closestDistance = Infinity;
            let closestSection = 'home';
            
            for (const section of existingSections) {
              const distanceToTop = Math.abs(section.top - scrollPosition);
              const distanceToCenter = Math.abs((section.top + section.bottom) / 2 - scrollPosition);
              const minDistance = Math.min(distanceToTop, distanceToCenter);
              
              if (minDistance < closestDistance) {
                closestDistance = minDistance;
                closestSection = section.id;
              }
            }
            
            currentSection = closestSection;
          } else {
            currentSection = mostVisibleSection;
          }
        }
        
        // Only update if it's different
        if (currentSection !== activeSection) {
          setActiveSection(currentSection);
        }
      }, 100);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    setTimeout(() => {
      handleScroll();
    }, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [location.pathname, activeSection]);

  // Handlers
  const handleSignOutClick = (e) => {
    e.preventDefault();
    onSignOut();
    setShowProfileDropdown(false);
    toggleMobileMenu(false);
  };

  const handleProfileDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileDropdown(prev => !prev);
  };

  const handleNavClick = (page, e) => {
    if (e) e.preventDefault();
    
    const currentPage = getCurrentPageFromPath();
    
    // Always update active section immediately
    setActiveSection(page);
    
    // If clicking on home link when already on home, scroll to top
    if (page === 'home' && currentPage === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toggleMobileMenu(false);
      return;
    }
    
    // If we're on home page and clicking a section that exists on home page
    if (currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home')) {
      // Check if this section exists on the current home page
      const sectionElement = document.getElementById(page);
      
      if (sectionElement) {
        // Scroll to the section on home page
        const headerHeight = 100;
        window.scrollTo({
          top: sectionElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });
        toggleMobileMenu(false);
        return;
      }
    }
    
    // If we're not on the target page, or the section doesn't exist on current page, navigate
    if (currentPage !== page || !document.getElementById(page)) {
      navigateToPage(page);
      toggleMobileMenu(false);
    }
  };

  const isActivePage = (page) => {
    const currentPage = getCurrentPageFromPath();
    const isHomePage = currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home');
    
    if (isHomePage) {
      // On home page, check if this is the active section based on scroll
      return activeSection === page
        ? "text-secondary text-shadow-neon font-bold"
        : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";
    }
    
    // On other pages, check if this is the current page
    return currentPage === page
      ? "text-secondary text-shadow-neon font-bold"
      : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";
  };

  const isMobileActivePage = (page) => {
    const currentPage = getCurrentPageFromPath();
    const isHomePage = currentPage === 'home' && (location.pathname === '/' || location.pathname === '/home');
    
    if (isHomePage) {
      // On home page, check if this is the active section based on scroll
      return activeSection === page
        ? "bg-secondary/20 text-secondary font-bold border-l-4 border-secondary"
        : "text-light hover:bg-primary/50 hover:text-secondary";
    }
    
    // On other pages, check if this is the current page
    return currentPage === page
      ? "bg-secondary/20 text-secondary font-bold border-l-4 border-secondary"
      : "text-light hover:bg-primary/50 hover:text-secondary";
  };

  const getUserInitials = () => {
    if (!currentUser) return "US";
    if (currentUser.displayName) {
      return currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return currentUser.email?.substring(0, 2).toUpperCase() || "US";
  };

  const getUserDisplayName = () => {
    if (!currentUser) return "";
    return currentUser.displayName || currentUser.email?.split('@')[0] || "User";
  };

  // Get user role
  const getUserRole = () => {
    if (!currentUser) return "Guest";
    const email = currentUser.email?.toLowerCase() || "";
    if (email.includes('admin') || email.includes('system') || email.includes('administrator')) {
      return "System Administrator";
    }
    if (email.includes('manager')) {
      return "Manager";
    }
    if (email.includes('support')) {
      return "Support Staff";
    }
    return "Registered User";
  };

  return (
    <header className="bg-primary/90 text-light py-2 md:py-3 sticky top-0 z-50 shadow-neon backdrop-blur-sm w-full">
      <div className="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Logo + Tagline */}
        <div className="flex items-center flex-shrink min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <img
              src={logo}
              alt="Logo"
              className="h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 w-auto object-contain drop-shadow-neon cursor-pointer flex-shrink-0"
              onClick={(e) => handleNavClick("home", e)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150?text=ET';
              }}
            />
            <div className="flex flex-col leading-tight min-w-0 flex-shrink">
              <div 
                className="cursor-pointer font-serif truncate"
                onClick={(e) => handleNavClick("home", e)}
              >
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
                  Exclusive Trader
                  <span className="text-secondary text-shadow-black"> </span>
                </span>
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-light/80 font-serif tracking-wider truncate">
                Your Partner in Commerce
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Navigation + Profile + Auth */}
        <div className="flex items-center gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8">
          {/* DESKTOP NAVIGATION - Only visible on true desktop screens (≥1281px and not mobile-like) */}
          <nav className="hidden xl:flex items-center gap-2 2xl:gap-4">
            {!isMobileView && (
              <>
                <Link 
                  to="/home" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("home")}`} 
                  onClick={(e) => handleNavClick("home", e)}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("about")}`} 
                  onClick={(e) => handleNavClick("about", e)}
                >
                  About
                </Link>
                <Link 
                  to="/services" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("services")}`} 
                  onClick={(e) => handleNavClick("services", e)}
                >
                  Services
                </Link>
                <Link 
                  to="/industries" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("industries")}`} 
                  onClick={(e) => handleNavClick("industries", e)}
                >
                  Industries
                </Link>
                <Link 
                  to="/leadership" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("leadership")}`} 
                  onClick={(e) => handleNavClick("leadership", e)}
                >
                  Leadership
                </Link>
                <Link 
                  to="/quote-request" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("quote-request")}`} 
                  onClick={(e) => handleNavClick("quote-request", e)}
                >
                  Feedback
                </Link>
                <Link 
                  to="/blog" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("blog")}`} 
                  onClick={(e) => handleNavClick("blog", e)}
                >
                  Blog
                </Link>
                <Link 
                  to="/join-us" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("join-us")}`} 
                  onClick={(e) => handleNavClick("join-us", e)}
                >
                  Join Us
                </Link>
                <Link 
                  to="/contact" 
                  className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm xl:text-base ${isActivePage("contact")}`} 
                  onClick={(e) => handleNavClick("contact", e)}
                >
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Profile avatar (visible when logged in and not in mobile view) */}
          {currentUser && !isMobileView && (
            <div className="profile-dropdown">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-sm sm:text-base lg:text-lg xl:text-xl cursor-pointer flex-shrink-0"
                onClick={handleProfileDropdown}
              >
                {getUserInitials()}
              </div>
            </div>
          )}

          {/* Desktop Auth buttons for non-logged in users (when not in mobile view) */}
          {!currentUser && !isMobileView && (
            <div className="hidden lg:flex items-center gap-3 xl:gap-4">
              <Link 
                to="/signin" 
                className="font-medium hover:text-secondary transition-colors px-4 py-2 rounded-lg hover:bg-primary/50 text-sm lg:text-base xl:text-lg"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="font-medium bg-secondary text-dark px-5 py-2 rounded-lg hover:bg-accent transition-colors text-sm lg:text-base xl:text-lg"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle - Visible when isMobileView is true (including Nest Hub Max) */}
          {isMobileView && (
            <button
              onClick={() => toggleMobileMenu()}
              className="text-light hover:text-secondary transition-colors z-50 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg 
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - For all mobile/tablet views (including Nest Hub Max) */}
      {isMobileView && isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 sm:top-16 md:top-18 lg:top-20 xl:top-22 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => toggleMobileMenu(false)}></div>
          <nav className="absolute top-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-secondary shadow-neon max-h-[85vh] overflow-y-auto">
            <ul className="flex flex-col items-center gap-0 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-5 lg:py-6">
              <li className="w-full">
                <Link 
                  to="/home" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("home")}`} 
                  onClick={(e) => { handleNavClick("home", e); toggleMobileMenu(false); }}
                >
                  Home
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/about" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("about")}`} 
                  onClick={(e) => { handleNavClick("about", e); toggleMobileMenu(false); }}
                >
                  About
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/services" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("services")}`} 
                  onClick={(e) => { handleNavClick("services", e); toggleMobileMenu(false); }}
                >
                  Services
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/industries" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("industries")}`} 
                  onClick={(e) => { handleNavClick("industries", e); toggleMobileMenu(false); }}
                >
                  Industries
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/leadership" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("leadership")}`} 
                  onClick={(e) => { handleNavClick("leadership", e); toggleMobileMenu(false); }}
                >
                  Leadership
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/quote-request" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("quote-request")}`} 
                  onClick={(e) => { handleNavClick("quote-request", e); toggleMobileMenu(false); }}
                >
                  Feedback
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/blog" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("blog")}`} 
                  onClick={(e) => { handleNavClick("blog", e); toggleMobileMenu(false); }}
                >
                  Blog
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/join-us" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("join-us")}`} 
                  onClick={(e) => { handleNavClick("join-us", e); toggleMobileMenu(false); }}
                >
                  Join Us
                </Link>
              </li>
              <li className="w-full">
                <Link 
                  to="/contact" 
                  className={`font-medium block py-3 px-4 rounded-lg transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl ${isMobileActivePage("contact")}`} 
                  onClick={(e) => { handleNavClick("contact", e); toggleMobileMenu(false); }}
                >
                  Contact
                </Link>
              </li>

              {/* Profile section for logged-in users */}
              {currentUser && (
                <li className="w-full pt-5 mt-4 border-t border-gray-700">
                  <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6 xl:px-8 xl:py-8 bg-secondary/10 rounded-lg mb-4">
                    <div className="flex items-center justify-center gap-3 lg:gap-4 xl:gap-6">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-lg lg:text-xl xl:text-2xl">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-secondary text-lg sm:text-xl lg:text-2xl xl:text-3xl truncate">
                          {getUserRole()}
                        </p>
                        <p className="text-sm lg:text-base xl:text-lg text-gray-300 truncate mt-1">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                    <Link 
                      to="/account" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      My Account
                    </Link>
                    <Link 
                      to="/orders" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link 
                      to="/settings" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      Settings
                    </Link>
                    <a 
                      href="#signout" 
                      onClick={handleSignOutClick} 
                      className="font-medium hover:text-red-400 transition-colors block py-3 px-4 rounded-lg text-center border border-red-500 hover:bg-red-500/10 transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                    >
                      Sign Out
                    </a>
                  </div>
                </li>
              )}

              {/* Auth section for non-logged in users */}
              {!currentUser && (
                <li className="w-full pt-5 mt-4 border-t border-gray-700">
                  <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                    <Link 
                      to="/signin" 
                      className="font-medium hover:text-secondary transition-colors block py-3 px-4 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup" 
                      className="font-medium bg-secondary text-dark block py-3 px-4 rounded-lg hover:bg-accent transition-colors text-center transition-all duration-200 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                      onClick={() => toggleMobileMenu(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* Profile dropdown for logged-in users on desktop */}
      {currentUser && showProfileDropdown && !isMobileView && (
        <div className="fixed top-14 sm:top-16 md:top-18 lg:top-20 xl:top-22 right-4 sm:right-6 md:right-8 lg:right-10 xl:right-12 z-50 profile-dropdown">
          <div className="w-56 sm:w-64 md:w-72 lg:w-80 xl:w-96 bg-primary/95 backdrop-blur-sm border border-secondary rounded-lg shadow-neon">
            <div className="py-1">
              {/* User Info Header */}
              <div className="px-5 py-4 lg:px-6 lg:py-5 xl:px-8 xl:py-6 bg-secondary/10 border-b border-secondary">
                <p className="font-bold text-secondary text-sm sm:text-base lg:text-lg xl:text-xl truncate">
                  {getUserRole()}
                </p>
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-300 truncate mt-1">
                  {currentUser.email}
                </p>
              </div>
              
              {/* Account Menu Items */}
              <Link 
                to="/account" 
                className="flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 xl:px-8 xl:py-5 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm sm:text-base lg:text-lg xl:text-xl border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-user-circle w-5 lg:w-6 xl:w-7 text-center"></i>
                <span className="font-medium">My Account</span>
              </Link>
              
              <Link 
                to="/orders" 
                className="flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 xl:px-8 xl:py-5 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm sm:text-base lg:text-lg xl:text-xl border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-shopping-bag w-5 lg:w-6 xl:w-7 text-center"></i>
                <span className="font-medium">My Orders</span>
              </Link>
              
              <Link 
                to="/settings" 
                className="flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 xl:px-8 xl:py-5 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-sm sm:text-base lg:text-lg xl:text-xl border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-cog w-5 lg:w-6 xl:w-7 text-center"></i>
                <span className="font-medium">Settings</span>
              </Link>
              
              <div className="border-t border-gray-700 my-1 lg:my-2 xl:my-3"></div>
              
              <a 
                href="#signout" 
                onClick={handleSignOutClick} 
                className="flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 xl:px-8 xl:py-5 text-light hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm sm:text-base lg:text-lg xl:text-xl"
              >
                <i className="fas fa-sign-out-alt w-5 lg:w-6 xl:w-7 text-center"></i>
                <span className="font-medium">Sign Out</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;