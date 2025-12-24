// src/components/Header.jsx
import { useState, useEffect } from "react";
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
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check screen size for iPhone Mini
  useEffect(() => {
    const checkScreenSize = () => {
      setIsVerySmallScreen(window.innerWidth < 375); // iPhone Mini width
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/' || location.pathname === '/home') {
        const scrollPosition = window.scrollY;
        if (scrollPosition < 100) {
          setActiveSection('home');
          return;
        }
      }

      const sections = [
        { id: 'home', element: document.getElementById('home') },
        { id: 'services', element: document.getElementById('services') },
        { id: 'about', element: document.getElementById('about') },
        { id: 'industries', element: document.getElementById('industries') },
        { id: 'leadership', element: document.getElementById('leadership') },
        { id: 'quote-request', element: document.getElementById('quote-request') },
        { id: 'blog', element: document.getElementById('blog') },
        { id: 'join-us', element: document.getElementById('join-us') },
        { id: 'contact', element: document.getElementById('contact') }
      ].filter(s => s.element !== null);

      if (sections.length === 0) {
        setActiveSection(getCurrentPageFromPath());
        return;
      }

      const scrollPosition = window.scrollY + 100;
      let currentActive = activeSection;
      let minDistance = Infinity;

      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const distanceFromTop = Math.abs(elementTop - scrollPosition);
          if (distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            currentActive = section.id;
          }
        }
      }

      if (currentActive !== activeSection) {
        setActiveSection(currentActive);
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [activeSection, location.pathname]);

  // Set active section on location change
  useEffect(() => {
    const currentPage = getCurrentPageFromPath();
    if (currentPage === 'home') {
      setActiveSection('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentPage !== activeSection) {
      setActiveSection(currentPage);
    }
  }, [location.pathname]);

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
    setActiveSection(page);

    if (page === 'home' && (location.pathname === '/' || location.pathname === '/home')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToPage(page);
      setTimeout(() => {
        const el = document.getElementById(page);
        if (el) {
          const headerHeight = 80;
          window.scrollTo({
            top: el.offsetTop - headerHeight,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const isActivePage = (page) =>
    activeSection === page
      ? "text-secondary text-shadow-neon font-bold scale-105 transition-all duration-200"
      : "text-light hover:text-secondary hover:text-shadow-neon transition-all duration-200";

  const isMobileActivePage = (page) =>
    activeSection === page
      ? "bg-secondary/20 text-secondary font-bold border-l-4 border-secondary"
      : "text-light hover:bg-primary/50 hover:text-secondary";

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

  // Get user role (mock function - you can replace with actual logic)
  const getUserRole = () => {
    if (!currentUser) return "Guest";
    // Check if email contains admin or system administrator keywords
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

  // Get user account details for display
  const getUserDetails = () => {
    if (!currentUser) return null;
    
    return {
      displayName: currentUser.displayName || "Not set",
      email: currentUser.email || "Not available",
      role: getUserRole(),
      accountId: currentUser.uid?.substring(0, 12) || "N/A",
      emailVerified: currentUser.emailVerified || false,
      createdAt: currentUser.metadata?.creationTime || "Unknown",
      lastLogin: currentUser.metadata?.lastSignInTime || "Unknown",
    };
  };

  return (
    <header className="bg-primary/90 text-light py-1 md:py-3 sticky top-0 z-50 shadow-neon backdrop-blur-sm w-full">
      <div className="w-full flex justify-between items-center px-1.5 sm:px-3 md:px-4 lg:px-6">
        {/* Logo + Tagline - OPTIMIZED FOR IPHONE MINI */}
        <div className="flex items-center flex-shrink min-w-0 max-w-[60%] sm:max-w-[70%]">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
            <img
              src={logo}
              alt="Logo"
              className="h-5 sm:h-8 md:h-10 w-auto object-contain drop-shadow-neon cursor-pointer flex-shrink-0"
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
                <span className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-bold">
                  {isVerySmallScreen ? "E." : "Exclusive Trader"}
                  <span className="text-secondary text-shadow-black"> </span>
                </span>
              </div>
              <span className="text-[7px] sm:text-xs md:text-sm text-light/80 font-serif tracking-wider truncate">
                {isVerySmallScreen ? "Trade Partner" : "Your Partner in Commerce"}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Mobile toggle + Profile (mobile) */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Profile avatar on mobile (always visible, next to hamburger) */}
          {currentUser && (
            <div className="md:hidden profile-dropdown">
              <div
                className="w-5 h-5 sm:w-7 sm:h-7 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-[10px] sm:text-xs cursor-pointer flex-shrink-0"
                onClick={handleProfileDropdown}
              >
                {getUserInitials()}
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle - COMPACT */}
          <button
            onClick={() => toggleMobileMenu()}
            className="md:hidden text-light hover:text-secondary transition-colors z-50 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Nav - HIDDEN ON MOBILE */}
          <nav className="hidden md:flex items-center">
            <ul className="flex gap-2 lg:gap-4 xl:gap-6 items-center text-xs lg:text-sm xl:text-base">
              <li><Link to="/home" className={`font-medium ${isActivePage("home")}`} onClick={(e) => handleNavClick("home", e)}>Home</Link></li>
              <li><Link to="/about" className={`font-medium ${isActivePage("about")}`} onClick={(e) => handleNavClick("about", e)}>About</Link></li>
              <li><Link to="/services" className={`font-medium ${isActivePage("services")}`} onClick={(e) => handleNavClick("services", e)}>Services</Link></li>
              <li><Link to="/industries" className={`font-medium ${isActivePage("industries")}`} onClick={(e) => handleNavClick("industries", e)}>Industries</Link></li>
              <li><Link to="/leadership" className={`font-medium ${isActivePage("leadership")}`} onClick={(e) => handleNavClick("leadership", e)}>Leadership</Link></li>
              <li><Link to="/blog" className={`font-medium ${isActivePage("blog")}`} onClick={(e) => handleNavClick("blog", e)}>Blog</Link></li>
              <li><Link to="/join-us" className={`font-medium ${isActivePage("join-us")}`} onClick={(e) => handleNavClick("join-us", e)}>Join Us</Link></li>
              <li><Link to="/quote-request" className={`font-medium ${isActivePage("quote-request")}`} onClick={(e) => handleNavClick("quote-request", e)}>Feedback</Link></li>
              <li><Link to="/contact" className={`font-medium ${isActivePage("contact")}`} onClick={(e) => handleNavClick("contact", e)}>Contact</Link></li>

              {/* Authentication */}
              {!currentUser ? (
                <>
                  <li><Link to="/signin" className="font-medium hover:text-secondary transition-colors px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg hover:bg-primary/50 text-xs lg:text-sm">Sign In</Link></li>
                  <li><Link to="/signup" className="font-medium bg-secondary text-dark px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg hover:bg-accent transition-colors text-xs lg:text-sm">Sign Up</Link></li>
                </>
              ) : (
                <li className="relative profile-dropdown">
                  <div
                    className="flex items-center gap-1 lg:gap-2 cursor-pointer px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-lg hover:bg-primary/50 transition-colors"
                    onClick={handleProfileDropdown}
                  >
                    <div className="w-5 h-5 lg:w-6 lg:h-6 bg-secondary rounded-full flex items-center justify-center text-dark font-bold text-[10px] lg:text-xs">
                      {getUserInitials()}
                    </div>
                    <span className="font-medium max-w-16 lg:max-w-24 truncate text-[10px] lg:text-xs">{getUserDisplayName()}</span>
                    <i className={`fas fa-chevron-down text-[8px] lg:text-xs transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}></i>
                  </div>

                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 lg:w-56 bg-primary/95 backdrop-blur-sm border border-secondary rounded-lg shadow-neon z-50">
                      <div className="py-1">
                        {/* User Info Header */}
                        <div className="px-3 py-2 bg-secondary/10 border-b border-secondary">
                          <p className="font-bold text-secondary text-sm truncate">{getUserRole()}</p>
                          <p className="text-[10px] text-gray-300 truncate mt-0.5">{currentUser.email}</p>
                        </div>
                        
                        {/* Account Menu Items */}
                        <Link 
                          to="/account" 
                          className="flex items-center gap-2 px-3 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-xs border-b border-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <i className="fas fa-user-circle w-4 text-center text-[10px]"></i>
                          <span className="font-medium">My Account</span>
                        </Link>
                        
                        <Link 
                          to="/orders" 
                          className="flex items-center gap-2 px-3 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-xs border-b border-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <i className="fas fa-shopping-bag w-4 text-center text-[10px]"></i>
                          <span className="font-medium">My Orders</span>
                        </Link>
                        
                        <Link 
                          to="/settings" 
                          className="flex items-center gap-2 px-3 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-xs border-b border-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <i className="fas fa-cog w-4 text-center text-[10px]"></i>
                          <span className="font-medium">Settings</span>
                        </Link>
                        
                        <div className="border-t border-gray-700 my-1"></div>
                        
                        <a 
                          href="#signout" 
                          onClick={handleSignOutClick} 
                          className="flex items-center gap-2 px-3 py-2 text-light hover:bg-red-500/20 hover:text-red-400 transition-colors text-xs"
                        >
                          <i className="fas fa-sign-out-alt w-4 text-center text-[10px]"></i>
                          <span className="font-medium">Sign Out</span>
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-10 sm:top-12 md:top-14 z-40 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => toggleMobileMenu(false)}></div>
          <nav className="absolute top-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-secondary shadow-neon max-h-[80vh] overflow-y-auto">
            <ul className="flex flex-col items-center gap-0 px-1.5 sm:px-3 py-1">
              <li className="w-full"><Link to="/home" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("home")}`} onClick={(e) => { handleNavClick("home", e); toggleMobileMenu(false); }}>Home</Link></li>
              <li className="w-full"><Link to="/about" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("about")}`} onClick={(e) => { handleNavClick("about", e); toggleMobileMenu(false); }}>About</Link></li>
              <li className="w-full"><Link to="/services" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("services")}`} onClick={(e) => { handleNavClick("services", e); toggleMobileMenu(false); }}>Services</Link></li>
              <li className="w-full"><Link to="/industries" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("industries")}`} onClick={(e) => { handleNavClick("industries", e); toggleMobileMenu(false); }}>Industries</Link></li>
              <li className="w-full"><Link to="/leadership" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("leadership")}`} onClick={(e) => { handleNavClick("leadership", e); toggleMobileMenu(false); }}>Leadership</Link></li>
              <li className="w-full"><Link to="/quote-request" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("quote-request")}`} onClick={(e) => { handleNavClick("quote-request", e); toggleMobileMenu(false); }}>Feedback</Link></li>
              <li className="w-full"><Link to="/blog" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("blog")}`} onClick={(e) => { handleNavClick("blog", e); toggleMobileMenu(false); }}>Blog</Link></li>
              <li className="w-full"><Link to="/join-us" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("join-us")}`} onClick={(e) => { handleNavClick("join-us", e); toggleMobileMenu(false); }}>Join Us</Link></li>
              <li className="w-full"><Link to="/contact" className={`font-medium block py-2 sm:py-2.5 px-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${isMobileActivePage("contact")}`} onClick={(e) => { handleNavClick("contact", e); toggleMobileMenu(false); }}>Contact</Link></li>

              {/* Mobile Auth */}
              {!currentUser && (
                <li className="w-full pt-2">
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <Link to="/signin" className="font-medium hover:text-secondary transition-colors block py-1.5 px-2 rounded-lg text-center border border-secondary hover:bg-secondary/10 transition-all duration-200 text-xs">Sign In</Link>
                    <Link to="/signup" className="font-medium bg-secondary text-dark block py-1.5 px-2 rounded-lg hover:bg-accent transition-colors text-center transition-all duration-200 text-xs">Sign Up</Link>
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* Profile dropdown for mobile avatar */}
      {currentUser && showProfileDropdown && (
        <div className="fixed top-10 sm:top-12 right-1.5 sm:right-2 md:hidden z-50 profile-dropdown">
          <div className="w-40 sm:w-48 bg-primary/95 backdrop-blur-sm border border-secondary rounded-lg shadow-neon">
            <div className="py-1">
              {/* User Info Header for Mobile */}
              <div className="px-3 py-2 bg-secondary/10 border-b border-secondary">
                <p className="font-bold text-secondary text-sm truncate">{getUserRole()}</p>
                <p className="text-[10px] text-gray-300 truncate mt-0.5">{currentUser.email}</p>
              </div>
              
              {/* Account Menu Items for Mobile */}
              <Link 
                to="/account" 
                className="flex items-center gap-2 px-3 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-xs border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-user-circle w-4 text-center text-[10px]"></i>
                <span className="font-medium">My Account</span>
              </Link>
              
              <Link 
                to="/orders" 
                className="flex items-center gap-2 px-3 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-xs border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-shopping-bag w-4 text-center text-[10px]"></i>
                <span className="font-medium">My Orders</span>
              </Link>
              
              <Link 
                to="/settings" 
                className="flex items-center gap-2 px-3 py-2 text-light hover:bg-secondary/20 hover:text-secondary transition-colors text-xs border-b border-gray-700"
                onClick={() => setShowProfileDropdown(false)}
              >
                <i className="fas fa-cog w-4 text-center text-[10px]"></i>
                <span className="font-medium">Settings</span>
              </Link>
              
              <div className="border-t border-gray-700 my-1"></div>
              
              <a 
                href="#signout" 
                onClick={handleSignOutClick} 
                className="flex items-center gap-2 px-3 py-2 text-light hover:bg-red-500/20 hover:text-red-400 transition-colors text-xs"
              >
                <i className="fas fa-sign-out-alt w-4 text-center text-[10px]"></i>
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