import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ArrowRight,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Flame,
  Smartphone,
  Car,
  Bike,
  Home as HomeIcon,
  Tv,
  Briefcase,
  Layers,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CITIES } from '../utils/constants';
import { listingsService } from '../services/listingsService';
import { categoriesService } from '../services';
import { Listing, Category } from '../types';
import ListingCard from '../components/listings/ListingCard';
import Icon from '../components/ui/Icon';
import { Skeleton } from '../components/ui';
import { userHasAnyRole } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const getCategoryMeta = (name: string, index: number) => {
  const n = name.toLowerCase();
  if (n.includes('vehicle') || n.includes('car')) {
    return {
      gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
      border: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
      iconBg: 'from-blue-500 to-indigo-600',
      accentColor: '#3b82f6',
    };
  }
  if (n.includes('mobile') || n.includes('phone') || n.includes('tech')) {
    return {
      gradient: 'from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20',
      border: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
      iconBg: 'from-purple-500 to-pink-600',
      accentColor: '#a855f7',
    };
  }
  if (n.includes('bike') || n.includes('motorcycle')) {
    return {
      gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
      border: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      iconBg: 'from-amber-500 to-orange-600',
      accentColor: '#f59e0b',
    };
  }
  if (n.includes('property') || n.includes('house') || n.includes('rent') || n.includes('real estate')) {
    return {
      gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
      border: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      iconBg: 'from-emerald-500 to-teal-600',
      accentColor: '#10b981',
    };
  }
  if (n.includes('electronic') || n.includes('appliance')) {
    return {
      gradient: 'from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20',
      border: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
      iconBg: 'from-cyan-500 to-blue-600',
      accentColor: '#06b6d4',
    };
  }
  if (n.includes('fashion') || n.includes('beauty') || n.includes('cloth')) {
    return {
      gradient: 'from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20',
      border: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
      iconBg: 'from-rose-500 to-pink-600',
      accentColor: '#f43f5e',
    };
  }
  if (n.includes('job') || n.includes('career')) {
    return {
      gradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20',
      border: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      iconBg: 'from-indigo-500 to-violet-600',
      accentColor: '#6366f1',
    };
  }
  if (n.includes('animal') || n.includes('pet')) {
    return {
      gradient: 'from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20',
      border: 'hover:border-orange-500/50 hover:shadow-orange-500/10',
      iconBg: 'from-orange-500 to-amber-600',
      accentColor: '#f97316',
    };
  }
  if (n.includes('service')) {
    return {
      gradient: 'from-teal-500/10 to-emerald-500/10 dark:from-teal-500/20 dark:to-emerald-500/20',
      border: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
      iconBg: 'from-teal-500 to-emerald-600',
      accentColor: '#14b8a6',
    };
  }

  const palettes = [
    { gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20', border: 'hover:border-blue-500/50', iconBg: 'from-blue-500 to-indigo-600', accentColor: '#3b82f6' },
    { gradient: 'from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20', border: 'hover:border-purple-500/50', iconBg: 'from-purple-500 to-pink-600', accentColor: '#a855f7' },
    { gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20', border: 'hover:border-emerald-500/50', iconBg: 'from-emerald-500 to-teal-600', accentColor: '#10b981' },
    { gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20', border: 'hover:border-amber-500/50', iconBg: 'from-amber-500 to-orange-600', accentColor: '#f59e0b' },
  ];
  return palettes[index % palettes.length];
};

const CategorySection: React.FC<{
  category: Category;
  listings: Listing[];
  isLoading: boolean;
}> = ({ category, listings, isLoading }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isLoading && listings.length === 0) return null;

  return (
    <section className="py-8 relative group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: (category.color || '#3b82f6') + '25' }}
          >
            <Icon name={category.icon || 'Tag'} size={20} style={{ color: category.color || '#3b82f6' }} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {category.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore verified ads in {category.name}
            </p>
          </div>
        </div>
        <Link
          to={`/category/${category.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="relative">
        {/* Scroll Buttons */}
        {!isLoading && listings.length > 3 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} className="text-slate-700 dark:text-slate-200" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} className="text-slate-700 dark:text-slate-200" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-60 sm:w-64 shrink-0 snap-start">
                  <div className="card overflow-hidden">
                    <Skeleton className="h-40 rounded-t-2xl rounded-b-none" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : listings.map(listing => (
                <div key={listing.id} className="w-60 sm:w-64 shrink-0 snap-start">
                  <ListingCard listing={listing} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listingsByCategory, setListingsByCategory] = useState<Record<string, Listing[]>>({});
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingListings, setLoadingListings] = useState<Record<string, boolean>>({});

  // 3D Hero Video Controls State
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (userHasAnyRole(user, ['super_admin'])) {
        navigate('/superadmin', { replace: true });
        return;
      }
      if (userHasAnyRole(user, ['admin'])) {
        navigate('/admin', { replace: true });
        return;
      }
      if (userHasAnyRole(user, ['moderator'])) {
        navigate('/moderator', { replace: true });
        return;
      }
    }

    const loadData = () => {
      listingsService
        .getFeaturedListings()
        .then(setFeaturedListings)
        .catch(console.error)
        .finally(() => setLoadingFeatured(false));

      categoriesService
        .getCategories()
        .then(allCats => {
          const mainCats = allCats.filter(c => !c.parent_id);
          setCategories(mainCats);
          setLoadingCategories(false);

          mainCats.forEach(cat => {
            setLoadingListings(prev => ({ ...prev, [cat.id]: true }));
            listingsService
              .getCategoryListingsHome(cat.id, 12)
              .then(listings => {
                setListingsByCategory(prev => ({ ...prev, [cat.id]: listings }));
              })
              .catch(console.error)
              .finally(() => {
                setLoadingListings(prev => ({ ...prev, [cat.id]: false }));
              });
          });
        })
        .catch(err => {
          console.error(err);
          setLoadingCategories(false);
        });
    };

    loadData();

    // Subscribe to listings table changes (realtime)
    const channel = supabase
      .channel('home-listings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, loading, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('location', selectedCity);
    navigate(`/listings?${params.toString()}`);
  };

  const quickPills = [
    { label: 'Mobile Phones', icon: Smartphone, query: 'Mobile Phones' },
    { label: 'Cars', icon: Car, query: 'Cars' },
    { label: 'Bikes', icon: Bike, query: 'Bikes' },
    { label: 'Property', icon: HomeIcon, query: 'Property for Sale' },
    { label: 'Electronics', icon: Tv, query: 'Electronics' },
    { label: 'Jobs', icon: Briefcase, query: 'Jobs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200">
      {/* ── 1. MODERN THEME-RESPONSIVE HERO SECTION WITH 3D CINEMATIC SHOWCASE ── */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800/80">
        
        {/* Luminous Ambient Glows for Light & Dark Mode */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[360px] bg-blue-500/10 dark:bg-primary-600/25 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-400/15 dark:bg-accent-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Pakistan's #1 Verified Marketplace
              <Star size={13} className="text-amber-500 fill-amber-500 ml-0.5" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight sm:leading-none">
              Buy, Sell & Discover
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-amber-600 dark:from-blue-400 dark:via-indigo-300 dark:to-amber-300 bg-clip-text text-transparent">
                Everything Across Pakistan
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg mb-8 max-w-2xl mx-auto font-normal leading-relaxed">
              Connect directly with verified sellers in your city. Safe chat, verified listings, and 0% commission.
            </p>

            {/* Glassmorphic Search Bar */}
            <form
              onSubmit={handleSearch}
              className="p-2 sm:p-2.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-700/60 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 mb-8"
            >
              <div className="flex-1 relative flex items-center">
                <Search size={20} className="absolute left-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Find Mobiles, Cars, Bikes, Laptops, Houses..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-sm font-medium transition-all"
                />
              </div>

              <div className="sm:w-48 relative flex items-center">
                <MapPin size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full pl-10 pr-8 py-3.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-transparent text-slate-800 dark:text-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 text-sm font-medium transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Pakistan</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Search Ads
              </button>
            </form>

            {/* ── 3D CINEMATIC SHOWCASE VIDEO CARD ── */}
            <div className="relative max-w-4xl mx-auto rounded-3xl p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-amber-500/30 shadow-2xl shadow-primary-600/15 dark:shadow-primary-950/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 group mb-6">
              <div className="relative rounded-[22px] overflow-hidden bg-slate-950 aspect-video sm:aspect-[21/9] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/hero-promo.mp4" type="video/mp4" />
                  <source src="/All%20in%20One%20video.mp4" type="video/mp4" />
                </video>

                {/* Subtle Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 pointer-events-none" />

                {/* Top Badge on Video */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-lg pointer-events-none">
                  <Sparkles size={13} className="text-amber-400 animate-pulse" />
                  <span>3D Marketplace Showcase</span>
                </div>

                {/* Video Controls Bar (Bottom Right) */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) {
                          videoRef.current.pause();
                          setIsPlaying(false);
                        } else {
                          videoRef.current.play();
                          setIsPlaying(true);
                        }
                      }
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-lg"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={14} className="text-slate-300" /> : <Volume2 size={14} className="text-amber-400" />}
                    <span className="hidden sm:inline">{isMuted ? 'Mute' : 'Sound On'}</span>
                  </button>
                </div>

                {/* Bottom Left Slogan */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-left pointer-events-none hidden sm:block">
                  <p className="text-xs font-bold text-white/90 drop-shadow-md">
                    Everything You Need • All In One Marketplace
                  </p>
                  <p className="text-[10px] text-white/70">
                    Vehicles • Mobiles • Real Estate • Electronics • Fashion • Furniture
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Category Suggestion Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {quickPills.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.query);
                    navigate(`/listings?q=${encodeURIComponent(item.query)}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 backdrop-blur-md border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <item.icon size={13} className="text-primary-500 dark:text-primary-400" />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. TRUST STATS HIGHLIGHT STRIP ── */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl backdrop-blur-lg">
          <div className="flex items-center gap-3 p-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">50,000+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live Active Ads</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified Sellers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">30+ Cities</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nationwide Reach</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">Instant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct Chat & Offers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ── 3. EXPLORE CATEGORIES (LIGHT & DARK ADAPTIVE CARDS) ── */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
                <Layers size={14} /> Popular Categories
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Explore by Category
              </h2>
            </div>
            <Link
              to="/listings"
              className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5"
            >
              All Categories <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
            {loadingCategories
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center">
                    <Skeleton className="w-12 h-12 rounded-2xl mb-3" />
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))
              : categories.map((cat, i) => {
                  const meta = getCategoryMeta(cat.name, i);
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${meta.border} hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 overflow-hidden text-center shadow-sm`}
                      >
                        {/* Background Tint on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        {/* Icon Container */}
                        <div
                          className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform duration-300`}
                          style={{
                            background: `linear-gradient(135deg, ${cat.color || meta.accentColor}, ${cat.color || meta.accentColor}dd)`,
                          }}
                        >
                          <Icon name={cat.icon || 'Tag'} size={24} className="text-white" />
                        </div>

                        {/* Category Name */}
                        <span className="relative text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 leading-tight">
                          {cat.name}
                        </span>

                        <span className="relative text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                          Explore Ads
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
          </div>
        </section>

        {/* ── 4. FEATURED & PROMOTED LISTINGS (GOLD ACCENT CAROUSEL) ── */}
        {(loadingFeatured || featuredListings.length > 0) && (
          <section className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50/50 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-transparent border border-amber-500/25 dark:border-amber-500/15 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Flame size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      Featured & Trending Deals
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      Hot
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Handpicked verified listings with top buyer interest
                  </p>
                </div>
              </div>

              <Link
                to="/listings?featured=true"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                View all featured <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {loadingFeatured
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card overflow-hidden">
                      <Skeleton className="h-40 rounded-t-2xl rounded-b-none" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                : featuredListings.slice(0, 12).map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
            </div>
          </section>
        )}

        {/* ── 5. CATEGORY-WISE SECTIONS (ROW BY ROW) ── */}
        <div className="space-y-4">
          {loadingCategories
            ? Array.from({ length: 3 }).map((_, i) => (
                <section key={i} className="py-8 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-2xl" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="w-64 shrink-0">
                        <div className="card overflow-hidden">
                          <Skeleton className="h-40 rounded-t-2xl rounded-b-none" />
                          <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            : categories.map(cat => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  listings={listingsByCategory[cat.id] || []}
                  isLoading={loadingListings[cat.id]}
                />
              ))}
        </div>

        {/* ── 6. WHY CHOOSE ALL IN ONE FEATURE HIGHLIGHTS ── */}
        <section className="my-16 p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              Why All In One Marketplace
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Built for Fast, Secure Local Trading
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <Shield size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Verified Sellers & Ads</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                All ads pass moderator approval and users are phone-verified for genuine, scam-free transactions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">WhatsApp-Style SafeChat</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Negotiate prices, exchange voice notes, and receive instant push notifications without sharing your personal number.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Smart AI Assistance</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Get instant price evaluations, smart recommendations, and 24/7 AI-guided buying assistance.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. POST AD PROMO HERO BANNER (CTA) ── */}
        <section className="relative rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-700 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-3">
              100% Free Forever
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mb-3 leading-tight">
              Have something to sell? Post your ad in 60 seconds!
            </h2>
            <p className="text-primary-100 text-sm sm:text-base mb-6 font-normal">
              Reach thousands of buyers across Pakistan with photos, product videos, and direct customer chats.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={user ? '/dashboard/listings/new' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-700 hover:bg-slate-100 font-extrabold text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Post Free Ad Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md transition-all"
              >
                Browse All Deals
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;