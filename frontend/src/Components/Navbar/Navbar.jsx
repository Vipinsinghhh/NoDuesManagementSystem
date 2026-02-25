import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, Settings, Bell, LayoutDashboard } from 'lucide-react';
import logo from "../Assets/cdgi-logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const loginRef = useRef(null);
  const profileRef = useRef(null);

  const checkUserAuthentication = () => {
    // Check user tokens
    const studentToken = localStorage.getItem('studentToken');
    const facultyToken = localStorage.getItem('facultyToken');
    const hodToken = localStorage.getItem('hodToken');
    
    // Check user data
    const studentData = localStorage.getItem('studentData');
    const facultyData = localStorage.getItem('facultyData');
    const hodData = localStorage.getItem('hodData');
    
    // Check faculty authentication first
    if (facultyToken && facultyData && facultyData !== "undefined") {
      try {
        const parsedUserData = JSON.parse(facultyData);
        setUserData(parsedUserData);
        setUserType('faculty');
        return;
      } catch (error) {
        console.error('Error parsing faculty data', error);
      }
    }
    
    // Check HOD authentication second
    if (hodToken && hodData && hodData !== "undefined") {
      try {
        const parsedUserData = JSON.parse(hodData);
        setUserData(parsedUserData);
        setUserType('hod');
        return;
      } catch (error) {
        console.error('Error parsing HOD data', error);
      }
    }
    
    // Check student authentication last
    if (studentToken && studentData && studentData !== "undefined") {
      try {
        const parsedUserData = JSON.parse(studentData);
        setUserData(parsedUserData);
        setUserType('student');
        return;
      } catch (error) {
        console.error('Error parsing student data', error);
      }
    }
    
    // If no valid authentication is found
    setUserData(null);
    setUserType(null);
  };
  
  // Handle logout based on user type
  const handleLogout = () => {
    switch (userType) {
      case 'faculty':
        localStorage.removeItem('facultyToken');
        localStorage.removeItem('facultyData');
        break;
      case 'hod':
        localStorage.removeItem('hodToken');
        localStorage.removeItem('hodData');
        break;
      case 'student':
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentData');
        break;
      default:
        // Clear all possible tokens and data
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentData');
        localStorage.removeItem('facultyToken');
        localStorage.removeItem('facultyData');
        localStorage.removeItem('hodToken');
        localStorage.removeItem('hodData');
        break;
    }
    
    // Update state
    setUserData(null);
    setUserType(null);
    setIsProfileOpen(false);
    
    // Dispatch event to notify other components about auth change
    window.dispatchEvent(new Event('authChange'));
    
    // Redirect to home page
    navigate('/');
  };

  // Check for user authentication on component mount, route change, and auth events
  useEffect(() => {
    checkUserAuthentication();
    
    // Add event listeners
    window.addEventListener('authChange', checkUserAuthentication);
    window.addEventListener('storage', checkUserAuthentication);

    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener('authChange', checkUserAuthentication);
      window.removeEventListener('storage', checkUserAuthentication);
    };
  }, []);

  useEffect(() => {
    checkUserAuthentication();
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setIsLoginOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loginRef, profileRef]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleLoginDropdown = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Get user display name based on user type and data
  const getUserDisplayName = () => {
    if (!userData) return 'User';
    
    switch (userType) {
      case 'faculty':
        return userData.firstName || userData.facultyName || 'Faculty';
      case 'hod':
        return userData.fullName || userData.hodName || 'HOD';
      case 'student':
        return userData.firstname || userData.name || 'Student';
      default:
        return 'User';
    }
  };

  // Get user ID or email
  const getUserIdentifier = () => {
    if (!userData) return '';
    
    switch (userType) {
      case 'faculty':
        return userData.email || userData.facultyId || 'Faculty ID';
      case 'hod':
        return userData.email || userData.hodId || 'HOD ID';
      case 'student':
        return userData.email || userData.rollNo || 'Student ID';
      default:
        return '';
    }
  };

  // Get profile path based on user type
  const getProfilePath = () => {
    switch (userType) {
      case 'faculty':
        return '/completefacultyprofile';
      case 'hod':
        return '/hod/profile';
      case 'student':
        return '/profile';
      default:
        return '/profile';
    }
  };

  // Get dashboard path based on user type
  const getDashboardPath = () => {
    switch (userType) {
      case 'faculty':
        return '/facultyapproval';
      case 'hod':
        return '/hodapproval';
      case 'student':
        return '/dues';
      default:
        return '/dashboard';
    }
  };

  // Basic nav items that always show
  const navItems = [{ path: '/', name: 'Home' }];

  // Get full nav items based on authentication status
  const getNavItems = () => {
    const items = [...navItems];
    
    // Add Dashboard link only if user is logged in
    
    
    return items;
  };

  const loginOptions = [
    { path: '/loginasfaculty', name: 'Faculty Login' },
    { path: '/loginasstudent', name: 'Student Login' },
    { path: '/loginashod', name: 'HOD Login' }
  ];

  const isActive = (path) => location.pathname === path;
  const isAnyLoginActive = () => loginOptions.some(option => isActive(option.path));

  // Get initial letter for avatar
  const getInitial = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  // Get full navigation items based on auth status
  const fullNavItems = getNavItems();

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
              <span className="ml-2 text-gray-800 text-lg font-medium">No-Dues Portal</span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {fullNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group ${
                  isActive(item.path) ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full ${
                  isActive(item.path) ? 'w-full' : ''
                }`}></span>
              </Link>
            ))}

            {/* Conditional Rendering: Login or Profile */}
            {userData ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">
                    {getInitial()}
                  </div>
                  <span className="max-w-24 truncate">{getUserDisplayName()}</span>
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile dropdown menu */}
                <div className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                  isProfileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {getUserDisplayName()}
                      {userType && <span className="ml-1 text-xs text-indigo-600 uppercase">({userType})</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {getUserIdentifier()}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to={getProfilePath()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                    <Link
                      to={userType ? `/${userType}/settings` : "/settings"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <Link
                      to={userType ? `/${userType}/notifications` : "/notifications"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative" ref={loginRef}>
                <button
                  onClick={toggleLoginDropdown}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group ${
                    isAnyLoginActive() ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <span>Login</span>
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 ${isLoginOpen ? 'rotate-180' : ''}`} />
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full ${
                    isAnyLoginActive() ? 'w-full' : ''
                  }`}></span>
                </button>

                {/* Login dropdown menu */}
                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden transition-all duration-200 ${
                  isLoginOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="py-1">
                    {loginOptions.map((option) => (
                      <Link
                        key={option.path}
                        to={option.path}
                        className={`block px-4 py-2 text-sm ${
                          isActive(option.path) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                        } transition-colors duration-200`}
                        onClick={() => setIsLoginOpen(false)}
                      >
                        {option.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none transition-colors duration-300"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
          {fullNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.path) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              } transition-colors duration-200`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                {item.icon && item.icon}
                {item.name}
              </div>
            </Link>
          ))}
          
          {userData ? (
            <>
              <div className="px-3 py-3 border-t border-gray-200 mt-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    {getInitial()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      {getUserDisplayName()}
                      {userType && <span className="ml-1 text-xs text-indigo-600 uppercase">({userType})</span>}
                    </p>
                    <p className="text-xs text-gray-500">{getUserIdentifier()}</p>
                  </div>
                </div>
              </div>
              <Link
                to={getProfilePath()}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  My Profile
                </div>
              </Link>
              <Link
                to={userType ? `/${userType}/settings` : "/settings"}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </div>
              </Link>
              <Link
                to={userType ? `/${userType}/notifications` : "/notifications"}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </div>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-1 border-t border-gray-200 mt-2 mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Login Options</p>
              </div>
              {loginOptions.map((option) => (
                <Link
                  key={option.path}
                  to={option.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(option.path) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  } transition-colors duration-200`}
                  onClick={() => setIsOpen(false)}
                >
                  {option.name}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
