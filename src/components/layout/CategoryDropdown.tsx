import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import { categoriesService } from '../../services';
import { Category } from '../../types';
import Icon from '../ui/Icon';
import { cn } from '../../utils/helpers';

/**
 * Builds a 3-level hierarchical category tree from a flat list with parent_id references,
 * falling back to constants.ts CATEGORIES if empty or invalid.
 */
function buildCategoryHierarchy(allCats: Category[]): Category[] {
  if (!allCats || allCats.length === 0) return CATEGORIES;

  const hasNestedSubcategories = allCats.some(c => c.subcategories && c.subcategories.length > 0);
  if (hasNestedSubcategories && allCats.some(c => !c.parent_id)) {
    return allCats.filter(c => !c.parent_id);
  }

  const rootCats = allCats.filter(c => !c.parent_id);
  if (rootCats.length === 0) return CATEGORIES;

  return rootCats.map(root => {
    const subs = allCats.filter(c => c.parent_id === root.id);
    return {
      ...root,
      subcategories: subs.map(sub => {
        const subSubs = allCats.filter(c => c.parent_id === sub.id);
        return {
          ...sub,
          subcategories: subSubs.length > 0 ? subSubs : undefined
        };
      })
    };
  });
}

const SCROLLBAR_CLASSES =
  "p-1.5 overflow-y-auto max-h-[420px] space-y-0.5 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600";

export const CategoryDropdown: React.FC = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Categories source: initialized with CATEGORIES for instant zero-lag render,
  // then asynchronously augmented with dynamic/admin categories from DB.
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [hoveredSubCatId, setHoveredSubCatId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch-capable devices (tablets, mobile, touchscreens)
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('touchstart', () => setIsTouchDevice(true), { once: true });
  }, []);

  // Fetch admin-managed categories asynchronously without blocking initial render
  useEffect(() => {
    let isMounted = true;
    categoriesService
      .getCategories()
      .then(fetched => {
        if (isMounted && fetched && fetched.length > 0) {
          const hierarchical = buildCategoryHierarchy(fetched as unknown as Category[]);
          setCategoriesList(hierarchical);
        }
      })
      .catch(err => {
        console.warn('Could not load dynamic categories, falling back to static constants:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-close on route change
  useEffect(() => {
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  }, [location.pathname, location.search]);

  // Click outside to close
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHoveredCatId(null);
        setHoveredSubCatId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setHoveredCatId(null);
        setHoveredSubCatId(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clear pending close timeout
  const cancelCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Debounced close to prevent flickering when moving pointer between columns or button
  const scheduleClose = useCallback(() => {
    cancelCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredCatId(null);
      setHoveredSubCatId(null);
    }, 200);
  }, [cancelCloseTimeout]);

  // Active category & subcategory lookups (memoized for instantaneous O(1) response)
  const activeCategory = useMemo(() => {
    if (!hoveredCatId) return null;
    return categoriesList.find(c => c.id === hoveredCatId) || null;
  }, [categoriesList, hoveredCatId]);

  const activeSubCategory = useMemo(() => {
    if (!activeCategory || !hoveredSubCatId) return null;
    return activeCategory.subcategories?.find(s => s.id === hoveredSubCatId) || null;
  }, [activeCategory, hoveredSubCatId]);

  // Toggle button click (desktop or mobile/touch)
  const handleToggleClick = () => {
    cancelCloseTimeout();
    if (isOpen) {
      setIsOpen(false);
      setHoveredCatId(null);
      setHoveredSubCatId(null);
    } else {
      setIsOpen(true);
      // When opening, DO NOT auto-select any category so panel 2 & 3 stay closed until hovered/tapped
      setHoveredCatId(null);
      setHoveredSubCatId(null);
    }
  };

  // Hover handlers for Level 1 (Main Categories)
  const handleCategoryHover = (catId: string) => {
    if (isTouchDevice) return; // Touch devices use click/tap
    setHoveredCatId(catId);
    // Reset subcategory selection so Level 3 does NOT open automatically
    setHoveredSubCatId(null);
  };

  // Click handler for Level 1 (Main Categories)
  const handleCategoryClick = (cat: Category, e: React.MouseEvent) => {
    const hasSub = Boolean(cat.subcategories && cat.subcategories.length > 0);
    if (isTouchDevice && hasSub && hoveredCatId !== cat.id) {
      // Touch device: tap first to expand Level 2 subcategories
      e.preventDefault();
      setHoveredCatId(cat.id);
      setHoveredSubCatId(null);
      return;
    }
    // Mouse click or category without subcategories: navigate & close
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  };

  // Hover handlers for Level 2 (Subcategories)
  const handleSubCategoryHover = (subId: string) => {
    if (isTouchDevice) return;
    setHoveredSubCatId(subId);
  };

  // Click handler for Level 2 (Subcategories)
  const handleSubCategoryClick = (sub: Category, e: React.MouseEvent) => {
    const hasSubSub = Boolean(sub.subcategories && sub.subcategories.length > 0);
    if (isTouchDevice && hasSubSub && hoveredSubCatId !== sub.id) {
      // Touch device: tap to expand Level 3 sub-subcategories
      e.preventDefault();
      setHoveredSubCatId(sub.id);
      return;
    }
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  };

  // Sub-subcategory click
  const handleSubSubCategoryClick = () => {
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:block ml-2"
      onMouseEnter={() => {
        if (!isTouchDevice) {
          cancelCloseTimeout();
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) {
          scheduleClose();
        }
      }}
    >
      {/* TRIGGER BUTTON */}
      <button
        onClick={handleToggleClick}
        aria-expanded={isOpen}
        aria-label="Browse Categories"
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all border select-none",
          isOpen
            ? "bg-primary-50 text-primary-600 border-primary-200 dark:bg-slate-800 dark:text-primary-400 dark:border-slate-700 shadow-sm"
            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
        )}
      >
        <SlidersHorizontal size={14} className="text-primary-500" />
        <span>Categories</span>
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-200 text-slate-400 dark:text-slate-500",
            isOpen && "rotate-180 text-primary-500"
          )}
        />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            onMouseEnter={cancelCloseTimeout}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-0 mt-2.5 z-50 flex flex-row rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 divide-x divide-slate-200 dark:divide-slate-800"
            style={{
              maxHeight: '480px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* INVISIBLE HOVER BRIDGE (Prevents mouseleave when moving from button down to menu) */}
            <div className="absolute -top-3 left-0 w-full h-3 bg-transparent pointer-events-auto" />

            {/* ══════════════════════════════════════════════
                COLUMN 1: MAIN CATEGORIES (Always Visible)
                ══════════════════════════════════════════════ */}
            <div className="w-64 sm:w-72 flex flex-col shrink-0 bg-white dark:bg-[#0f172a]">
              {/* Column 1 Header */}
              <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950">
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  All Categories
                </span>
                <Link
                  to="/listings"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 dark:hover:text-primary-300 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={11} />
                </Link>
              </div>

              {/* Column 1 Items */}
              <div className={SCROLLBAR_CLASSES}>
                {categoriesList.map(cat => {
                  const isSelected = hoveredCatId === cat.id;
                  const hasSub = Boolean(cat.subcategories && cat.subcategories.length > 0);

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => handleCategoryHover(cat.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-2xl transition-colors cursor-pointer group select-none text-xs",
                        isSelected
                          ? "bg-primary-50 dark:bg-slate-800/90 text-primary-600 dark:text-primary-400 font-bold border-l-2 border-primary-500 shadow-xs"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                      )}
                    >
                      <Link
                        to={`/category/${cat.slug}`}
                        onClick={e => handleCategoryClick(cat, e)}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: (cat.color || '#3b82f6') + '20' }}
                        >
                          <Icon name={cat.icon || 'Tag'} size={15} style={{ color: cat.color || '#3b82f6' }} />
                        </div>
                        <span className="truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {cat.name}
                        </span>
                      </Link>

                      {hasSub && (
                        <ChevronRight
                          size={14}
                          className={cn(
                            "text-slate-400 dark:text-slate-500 shrink-0 transition-transform ml-1",
                            isSelected && "text-primary-500 translate-x-0.5"
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                COLUMN 2: SUBCATEGORIES (Opens ONLY when Category is hovered)
                ══════════════════════════════════════════════════════════════ */}
            {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
              <div className="w-64 sm:w-72 flex flex-col shrink-0 bg-slate-50 dark:bg-[#090e17] transition-all duration-150 ease-out">
                {/* Column 2 Header */}
                <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-100 dark:bg-slate-900">
                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate max-w-[160px]">
                    {activeCategory.name}
                  </span>
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 dark:hover:text-primary-300 hover:underline flex items-center gap-1 shrink-0"
                  >
                    View All <ArrowRight size={11} />
                  </Link>
                </div>

                {/* Column 2 Items */}
                <div className={SCROLLBAR_CLASSES}>
                  {activeCategory.subcategories.map(sub => {
                    const isSubSelected = hoveredSubCatId === sub.id;
                    const hasSubSub = Boolean(sub.subcategories && sub.subcategories.length > 0);

                    return (
                      <div
                        key={sub.id}
                        onMouseEnter={() => handleSubCategoryHover(sub.id)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-2xl transition-colors cursor-pointer group select-none text-xs",
                          isSubSelected
                            ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-bold border-l-2 border-primary-500 shadow-xs"
                            : "hover:bg-white/80 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
                        )}
                      >
                        <Link
                          to={`/category/${activeCategory.slug}?sub=${sub.id}`}
                          onClick={e => handleSubCategoryClick(sub, e)}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: (sub.color || activeCategory.color || '#3b82f6') + '20' }}
                          >
                            <Icon
                              name={sub.icon || activeCategory.icon || 'Tag'}
                              size={13}
                              style={{ color: sub.color || activeCategory.color || '#3b82f6' }}
                            />
                          </div>
                          <span className="truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {sub.name}
                          </span>
                        </Link>

                        {hasSubSub && (
                          <ChevronRight
                            size={14}
                            className={cn(
                              "text-slate-400 dark:text-slate-500 shrink-0 transition-transform ml-1",
                              isSubSelected && "text-primary-500 translate-x-0.5"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
                COLUMN 3: SUB-SUBCATEGORIES (Opens ONLY when Subcategory hovered)
                ════════════════════════════════════════════════════════════════════ */}
            {activeCategory && activeSubCategory && activeSubCategory.subcategories && activeSubCategory.subcategories.length > 0 && (
              <div className="w-64 sm:w-72 flex flex-col shrink-0 bg-white dark:bg-[#0f172a] transition-all duration-150 ease-out">
                {/* Column 3 Header */}
                <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950">
                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate max-w-[160px]">
                    {activeSubCategory.name}
                  </span>
                  <Link
                    to={`/category/${activeCategory.slug}?sub=${activeSubCategory.id}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 dark:hover:text-primary-300 hover:underline flex items-center gap-1 shrink-0"
                  >
                    View All <ArrowRight size={11} />
                  </Link>
                </div>

                {/* Column 3 Items */}
                <div className={SCROLLBAR_CLASSES}>
                  {activeSubCategory.subcategories.map(subSub => (
                    <Link
                      key={subSub.id}
                      to={`/category/${activeCategory.slug}?sub=${activeSubCategory.id}&subSub=${subSub.id}`}
                      onClick={handleSubSubCategoryClick}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-primary-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group text-xs select-none"
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: (subSub.color || activeCategory.color || '#3b82f6') + '18' }}
                      >
                        <Icon
                          name={subSub.icon || activeCategory.icon || 'Tag'}
                          size={12}
                          style={{ color: subSub.color || activeCategory.color || '#3b82f6' }}
                        />
                      </div>
                      <span className="truncate">{subSub.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryDropdown;
