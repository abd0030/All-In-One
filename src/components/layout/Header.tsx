import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Heart,
  MessageCircle,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  Shield,
  HelpCircle,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar, Modal } from '../ui';
import { CATEGORIES } from '../../utils/constants';
import Icon from '../ui/Icon';
import { notificationsService } from '../../services';
import { Notification } from '../../types';
import { formatDate, getUserRoles, userHasAnyRole, cn, playNotificationSound } from '../../utils/helpers';
import { useUnreadMessages } from '../../contexts/UnreadMessagesContext';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnread } = useUnreadMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchNotifs = () => {
        notificationsService.getNotifications(user.id).then(data => {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        });
      };
      fetchNotifs();

      const sub = notificationsService.subscribeToNotifications(user.id, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Notification;
          setNotifications(prev => prev.map(n => (n.id === updated.id ? updated : n)));
          setNotifications(currentList => {
            setUnreadCount(currentList.filter(n => !n.is_read).length);
            return currentList;
          });
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          setNotifications(currentList => {
            setUnreadCount(currentList.filter(n => !n.is_read).length);
            return currentList;
          });
        }
      });
      return () => {
        sub.unsubscribe();
      };
    }
  }, [user]);

  // Close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setCategoryMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (userHasAnyRole(user, ['super_admin'])) return '/superadmin';
    if (userHasAnyRole(user, ['admin'])) return '/admin';
    if (userHasAnyRole(user, ['moderator'])) return '/moderator';
    return '/dashboard';
  };

  const markAllRead = async () => {
    if (user) {
      await notificationsService.markAllRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const isManagementRole = userHasAnyRole(user, ['moderator', 'admin', 'super_admin']);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/75 dark:border-slate-800/75 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-4">
            
            {/* ── 1. LOGO & BRAND ── */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={isManagementRole ? getDashboardPath() : '/'}
                className="flex items-center gap-2.5 group shrink-0"
              >
                {/* Official Brand Logo Image */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-md group-hover:shadow-primary-500/20 group-hover:scale-105 transition-all duration-300 bg-slate-900 flex items-center justify-center p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                  <img
                    src="/logo.png"
                    alt="All in one"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      // Fallback if image path fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-primary-600 to-indigo-600 dark:from-white dark:via-primary-400 dark:to-indigo-300 bg-clip-text text-transparent">
                      All in one
                    </span>
                    <span className="hidden md:inline-flex text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      PK
                    </span>
                  </div>
                  <span className="hidden sm:block text-[9px] font-medium text-slate-400 dark:text-slate-500 -mt-1 tracking-wider uppercase">
                    Classifieds Marketplace
                  </span>
                </div>
              </Link>

              {/* Categories Dropdown Trigger (Desktop) */}
              {!isManagementRole && (
                <div className="relative hidden lg:block ml-2">
                  <button
                    onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all border",
                      categoryMenuOpen
                        ? "bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950/60 dark:text-primary-400 dark:border-primary-800 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <SlidersHorizontal size={14} className="text-primary-500" />
                    <span>Categories</span>
                    <ChevronDown
                      size={13}
                      className={cn("transition-transform duration-200 text-slate-400", categoryMenuOpen && "rotate-180 text-primary-500")}
                    />
                  </button>

                  <AnimatePresence>
                    {categoryMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                        onMouseLeave={() => setCategoryMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Categories</span>
                          <Link
                            to="/listings"
                            onClick={() => setCategoryMenuOpen(false)}
                            className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            View All <ArrowRight size={11} />
                          </Link>
                        </div>
                        <div className="p-1.5 grid grid-cols-1 gap-1 max-h-96 overflow-y-auto scrollbar-none">
                          {CATEGORIES.map(cat => (
                            <Link
                              key={cat.id}
                              to={`/category/${cat.slug}`}
                              onClick={() => setCategoryMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                            >
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: cat.color + '20' }}
                              >
                                <Icon name={cat.icon} size={16} style={{ color: cat.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                                  {cat.name}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── 2. DESKTOP SEARCH BAR ── */}
            {!isManagementRole && (
              <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block mx-2">
                <div className="relative group">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Find Mobiles, Cars, Bikes, Houses, Jobs..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ── 3. RIGHT ACTION CONTROLS ── */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="w-9 h-9 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
              </button>

              {user ? (
                <>
                  {/* Messages Icon */}
                  {!isManagementRole && (
                    <Link
                      to="/chat"
                      className="relative w-9 h-9 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                      title="Messages"
                    >
                      <MessageCircle size={17} />
                      {totalUnread > 0 && (
                        <motion.span
                          key={totalUnread}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none px-1 shadow-md shadow-primary-500/30"
                        >
                          {totalUnread > 9 ? '9+' : totalUnread}
                        </motion.span>
                      )}
                    </Link>
                  )}

                  {/* Notifications Icon */}
                  <button
                    onClick={() => setNotifModalOpen(true)}
                    className="relative w-9 h-9 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                    title="Notifications"
                  >
                    <Bell size={17} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none px-1 shadow-md shadow-red-500/30 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* High-Converting Luxurious + Sell Button */}
                  {!isManagementRole && (
                    <Link
                      to="/dashboard/listings/new"
                      className="relative group overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:via-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-orange-500/40 hover:scale-[1.04] active:scale-95 transition-all duration-300 flex items-center gap-2 border border-amber-300/40 cursor-pointer shrink-0"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                      <Sparkles className="w-4 h-4 text-amber-100 animate-pulse shrink-0" />
                      <span>Sell</span>
                      <Plus size={15} className="stroke-[3] opacity-80 group-hover:rotate-90 transition-transform duration-300" />
                    </Link>
                  )}

                  {/* Profile Menu Trigger */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200 dark:border-slate-700/80 shrink-0"
                    >
                      <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                      <ChevronDown
                        size={13}
                        className={cn("text-slate-400 transition-transform duration-200 hidden sm:block", profileMenuOpen && "rotate-180")}
                      />
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                          {/* User Header */}
                          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{user.full_name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                            {getUserRoles(user).length > 0 && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mt-1.5 capitalize">
                                {getUserRoles(user).map(role => role.replace('_', ' ')).join(', ')}
                              </span>
                            )}
                          </div>

                          {/* Menu Links */}
                          <div className="p-2 space-y-0.5">
                            <Link
                              to={
                                userHasAnyRole(user, ['super_admin'])
                                  ? '/superadmin'
                                  : userHasAnyRole(user, ['admin'])
                                  ? '/admin'
                                  : userHasAnyRole(user, ['moderator'])
                                  ? '/moderator'
                                  : '/dashboard'
                              }
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                              <LayoutDashboard size={15} className="text-primary-500" />
                              <span>My Dashboard</span>
                            </Link>

                            {!isManagementRole && (
                              <Link
                                to="/dashboard/bookmarks"
                                onClick={() => setProfileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                              >
                                <Heart size={15} className="text-rose-500" />
                                <span>Saved Listings</span>
                              </Link>
                            )}

                            <Link
                              to="/profile"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                              <Settings size={15} className="text-slate-400" />
                              <span>Settings & Profile</span>
                            </Link>

                            <Link
                              to="/help"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                              <HelpCircle size={15} className="text-blue-500" />
                              <span>Help Center</span>
                            </Link>

                            <Link
                              to="/safety"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                              <Shield size={15} className="text-emerald-500" />
                              <span>Safety Tips</span>
                            </Link>

                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                              <button
                                onClick={() => {
                                  signOut();
                                  setProfileMenuOpen(false);
                                  navigate('/');
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                              >
                                <LogOut size={15} />
                                <span>Sign Out</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all shrink-0"
                  >
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Ultra-Luxurious Sell Button (Direct Link to Login with return to new ad) */}
                  <Link
                    to="/login?redirect=/dashboard/listings/new"
                    className="relative group overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:via-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-orange-500/40 hover:scale-[1.04] active:scale-95 transition-all duration-300 flex items-center gap-2 border border-amber-300/40 cursor-pointer shrink-0"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    <Sparkles className="w-4 h-4 text-amber-100 animate-pulse shrink-0" />
                    <span>Sell</span>
                    <Plus size={15} className="stroke-[3] opacity-80 group-hover:rotate-90 transition-transform duration-300" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── 4. MOBILE SEARCH BAR (ROW 2 ON SMALL SCREENS) ── */}
          {!isManagementRole && (
            <div className="pb-3 md:hidden">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search Mobiles, Cars, Properties, Jobs..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── 5. MOBILE EXPANDABLE MENU ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Categories</span>
                  <Link
                    to="/listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-bold"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                        <Icon name={cat.icon} size={14} style={{ color: cat.color }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <Link
                    to="/help"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <HelpCircle size={15} className="text-blue-500" />
                    <span>Help Center & Support</span>
                  </Link>
                  <Link
                    to="/safety"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <Shield size={15} className="text-emerald-500" />
                    <span>Safety Tips</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notifications Modal */}
      <Modal isOpen={notifModalOpen} onClose={() => setNotifModalOpen(false)} title="Notifications" size="md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification(s)` : 'No new notifications'}
          </p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-primary-600 hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {notifications.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={cn(
                  'p-3.5 rounded-2xl border transition-all cursor-pointer',
                  !n.is_read
                    ? 'bg-primary-50/50 dark:bg-primary-950/10 border-primary-100 dark:border-primary-900/30'
                    : 'bg-slate-50/30 dark:bg-slate-800/10 border-slate-100 dark:border-slate-850'
                )}
                onClick={async () => {
                  if (!n.is_read) {
                    await notificationsService.markRead(n.id);
                    setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, is_read: true } : x)));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                  }
                }}
              >
                <div className="flex items-start gap-2.5">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold text-slate-900 dark:text-slate-100', !n.is_read && 'text-primary-850 dark:text-primary-400')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">{formatDate(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
};

export default Header;
