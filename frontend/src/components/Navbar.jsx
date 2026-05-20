import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Menu, X, User, LogOut, Package, ChevronDown, ChevronRight, Bell, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      setNotifications(prev => prev.filter(n => !selectedIds.has(n._id)));
      setUnreadCount(prev => Math.max(0, prev - [...selectedIds].filter(id => {
        const n = notifications.find(n => n._id === id);
        return n && !n.read;
      }).length));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ deleteAll: true }),
      });
      setNotifications([]);
      setUnreadCount(0);
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n._id)));
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (e) => {
      if (isProfileOpen && !e.target.closest('.profile-dropdown-container')) {
        setIsProfileOpen(false);
      }
      if (isNotificationsOpen && !e.target.closest('.notifications-dropdown-container')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isNotificationsOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsMobileShopOpen(false);
  }, [location]);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/services', label: 'Services' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/', { replace: true });
    setIsOpen(false);
  };

  const profileMenuItems = [
    { label: 'Edit Profile', path: '/profile?tab=profile', icon: User },
    { label: 'My Orders', path: '/profile?tab=orders', icon: Package },
    { label: 'Selection', path: '/profile?tab=cart', icon: ShoppingCart, count: getCartCount() },
    { label: 'Favorites', path: '/profile?tab=wishlist', icon: Heart, count: getWishlistCount() },
  ];

  const shopCategories = [
    { id: 'all', name: 'All Products' },
    { id: 'cakes', name: 'Cakes' },
    { id: 'chocolate-bouquets', name: 'Chocolate Bouquets' },
    { id: 'couple-gifts', name: 'Couple Gifts' },
    { id: 'event-needs', name: 'Event Needs' },
    { id: 'flower-bouquets', name: 'Flower Bouquets' },
    { id: 'interior-gifts-decor', name: 'Interior Gifts & Decor' },
    { id: 'mugs', name: 'Mugs' },
    { id: 'personalised-gifts', name: 'Personalised Gifts' },
    { id: 'photo-frames', name: 'Photo Frames' },
    { id: 'plants', name: 'Plants' },
    { id: 'printing-works', name: 'Printing Works' },
    { id: 't-shirts', name: 'T-Shirts' },
  ];

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg pt-2 pb-2' : 'bg-white pt-4 pb-4'}`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <img 
              src="/logo.png" 
              alt="Dwarakamai digital photo studio" 
              width="58"
              height="58"
              className="h-14 w-14 object-contain transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=100&h=100&fit=crop";
              }}
            />
            <div className="flex flex-col">
              <span className="text-[26px] font-display font-bold tracking-tight text-[var(--color-primary)] uppercase leading-none">
                Dwarakamai
              </span>
              <span className="text-[10px] font-body font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] leading-none mt-1">
                Digital Photo Studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8 ml-auto mr-10">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group/nav">
                <Link
                  to={link.path}
                  className={`font-body font-semibold text-sm transition-all duration-300 relative py-4 flex items-center gap-1 ${isActive(link.path) ? 'text-[var(--color-primary)]' : 'text-gray-600 hover:text-[var(--color-primary)]'}`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-3 h-3 group-hover/nav:rotate-180 transition-transform" />}
                  <span className={`absolute bottom-3 left-0 w-full h-0.5 bg-[var(--color-primary)] transform origin-left transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'}`} />
                </Link>

                {link.hasDropdown && (
                  <div className="absolute top-full left-0 w-64 bg-white/95 backdrop-blur-xl rounded-[30px] shadow-2xl border border-gray-50 p-4 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0 z-50">
                    <div className="grid grid-cols-1 gap-1">
                      {shopCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={cat.id === 'all' ? '/shop' : `/shop/${cat.id}`}
                          className="px-4 py-2 rounded-xl text-xs font-body font-bold text-gray-500 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all flex items-center justify-between group/item"
                        >
                          <span>{cat.name}</span>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover/item:translate-x-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications, Cart & Wishlist (Desktop) */}
            <div className="hidden sm:flex items-center space-x-2">
              {/* Notifications Dropdown */}
              <div className="relative notifications-dropdown-container">
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    if (!isNotificationsOpen) {
                      setSelectMode(false);
                      setSelectedIds(new Set());
                    }
                    if (unreadCount > 0 && !isNotificationsOpen) handleMarkAllRead();
                  }}
                  className={`p-2 text-gray-600 hover:text-[var(--color-primary)] relative transition-all rounded-full ${isNotificationsOpen ? 'bg-purple-50 text-[var(--color-primary)]' : ''}`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-valentine-red text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 animate-slide-up z-[60]">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-body font-bold text-gray-900">
                          Notifications
                          {notifications.length > 0 && (
                            <span className="ml-1.5 text-gray-400 font-normal">({notifications.length})</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && !selectMode && (
                            <button onClick={handleMarkAllRead} className="text-[10px] text-[var(--color-primary)] font-bold hover:underline">
                              Mark all read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={() => { setSelectMode(s => !s); setSelectedIds(new Set()); }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${selectMode ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700'}`}
                            >
                              {selectMode ? 'Cancel' : 'Select'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Select-mode toolbar */}
                      {selectMode && notifications.length > 0 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          <label className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIds.size === notifications.length}
                              onChange={toggleSelectAll}
                              className="w-3 h-3 accent-[var(--color-primary)]"
                            />
                            {selectedIds.size === notifications.length ? 'Deselect all' : 'Select all'}
                          </label>
                          <div className="flex items-center gap-2">
                            {selectedIds.size > 0 && (
                              <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete ({selectedIds.size})
                              </button>
                            )}
                            <button
                              onClick={handleDeleteAll}
                              className="text-[10px] font-bold text-red-400 hover:text-red-600 hover:underline"
                            >
                              Delete all
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (selectMode) { toggleSelect(notif._id); return; }
                              setIsNotificationsOpen(false);
                              if (notif.link) navigate(notif.link);
                            }}
                            className={`flex items-start gap-2 p-3 border-b border-gray-50 transition-colors cursor-pointer
                              ${selectMode ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}
                              ${!notif.read && !selectMode ? 'bg-purple-50/30' : ''}
                              ${selectedIds.has(notif._id) ? 'bg-red-50/40' : ''}
                            `}
                          >
                            {/* Checkbox in select mode */}
                            {selectMode && (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(notif._id)}
                                onChange={() => toggleSelect(notif._id)}
                                onClick={e => e.stopPropagation()}
                                className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 accent-[var(--color-primary)]"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${!notif.read ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[8px] text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
                                })}
                              </p>
                            </div>
                            {/* Quick delete button (non-select mode) */}
                            {!selectMode && (
                              <button
                                onClick={e => { e.stopPropagation(); setSelectedIds(new Set([notif._id])); handleDeleteSelected(); }}
                                className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/profile?tab=wishlist" className="p-2 text-gray-600 hover:text-[var(--color-primary)] relative">
                <Heart className="w-5 h-5" />
                {getWishlistCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>
              <Link to="/profile?tab=cart" className="p-2 text-gray-600 hover:text-[var(--color-primary)] relative">
                <ShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--color-primary)] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`text-gray-600 hover:text-[var(--color-primary)] transition-all p-2 rounded-full ${isProfileOpen ? 'bg-purple-50 text-[var(--color-primary)]' : ''}`}
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 animate-slide-up z-[60]">
                  {isAuthenticated() ? (
                    <>
                      <div className="px-4 py-3 mb-2 border-b border-gray-50">
                        <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-body font-bold text-gray-900 truncate">{user?.name || user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-body font-bold text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.count > 0 && (
                              <span className="bg-purple-50 text-[var(--color-primary)] px-2 py-0.5 rounded-full text-[8px]">
                                {item.count}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-body font-bold text-red-500 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs font-body text-gray-400 mb-4">Sign in to access your curated dashboard.</p>
                      <Link
                        to="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full py-3 bg-gray-900 text-white rounded-2xl font-body font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                      <p className="mt-4 text-[10px] font-body text-gray-400">
                        New here? <Link to="/signup" className="text-gray-900 font-bold hover:underline">Join Us</Link>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-900 p-1"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 py-6 px-4 animate-slide-up shadow-2xl overflow-y-auto max-h-[85vh] z-50">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <div key={link.path}>
                  {link.hasDropdown ? (
                    <div className="flex flex-col">
                      <button 
                        onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                        className="flex items-center justify-between py-3 text-lg font-body font-bold text-gray-700"
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isMobileShopOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isMobileShopOpen && (
                        <div className="grid grid-cols-2 gap-2 py-2 mb-4">
                          {shopCategories.map((cat) => (
                            <Link
                              key={cat.id}
                              to={cat.id === 'all' ? '/shop' : `/shop/${cat.id}`}
                              className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-body font-bold text-gray-500 hover:text-[var(--color-primary)]"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      className={`block py-3 text-lg font-body font-bold ${isActive(link.path) ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="pt-6 mt-4 border-t border-gray-50 flex flex-col space-y-4">
                {isAuthenticated() ? (
                  <>
                    <Link to="/profile" className="text-lg font-body font-bold text-gray-700">Studio Dashboard</Link>
                    <button onClick={handleLogout} className="text-lg font-body font-bold text-red-500 text-left">Sign Out</button>
                  </>
                ) : (
                  <Link to="/login" className="py-4 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest text-center">Login to Studio</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
