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
 * Safely merges any categories from the database into the master CATEGORIES hierarchy,
 * guaranteeing that the full 3-level tree structure is ALWAYS completely preserved.
 */
function mergeWithDbCategories(baseList: Category[], dbList: Category[]): Category[] {
  if (!dbList || dbList.length === 0) return baseList;

  // Deep copy base categories to prevent mutation
  const map = new Map<string, Category>();
  baseList.forEach(c => {
    map.set(c.id, {
      ...c,
      subcategories: (c.subcategories || []).map(s => ({
        ...s,
        subcategories: s.subcategories ? [...s.subcategories] : []
      }))
    });
  });

  // Check if any category from DB is new (created by admin)
  dbList.forEach(dbItem => {
    if (!dbItem.parent_id) {
      if (!map.has(dbItem.id)) {
        map.set(dbItem.id, { ...dbItem, subcategories: [] });
      } else {
        const existing = map.get(dbItem.id)!;
        existing.name = dbItem.name || existing.name;
        existing.icon = dbItem.icon || existing.icon;
        existing.color = dbItem.color || existing.color;
      }
    } else {
      // Find parent in Level 1
      const parentRoot = map.get(dbItem.parent_id);
      if (parentRoot) {
        if (!parentRoot.subcategories) parentRoot.subcategories = [];
        const existingSub = parentRoot.subcategories.find(s => s.id === dbItem.id);
        if (!existingSub) {
          parentRoot.subcategories.push({ ...dbItem, subcategories: [] });
        }
      } else {
        // Find parent in Level 2 (sub-subcategories)
        for (const root of map.values()) {
          const parentSub = root.subcategories?.find(s => s.id === dbItem.parent_id);
          if (parentSub) {
            if (!parentSub.subcategories) parentSub.subcategories = [];
            const existingSubSub = parentSub.subcategories.find(ss => ss.id === dbItem.id);
            if (!existingSubSub) {
              parentSub.subcategories.push({ ...dbItem });
            }
            break;
          }
        }
      }
    }
  });

  return Array.from(map.values());
}

const SCROLLBAR_CLASSES =
  "p-1.5 overflow-y-auto max-h-[400px] space-y-0.5 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600";

export const CategoryDropdown: React.FC = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchInteractionRef = useRef(false);

  // Authoritative categories tree (initialized with full hierarchy from constants.ts)
  const [categoriesList, setCategoriesList] = useState<Category[]>(CATEGORIES);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [hoveredSubCatId, setHoveredSubCatId] = useState<string | null>(null);

  // Asynchronously merge dynamic / admin-managed categories
  useEffect(() => {
    let isMounted = true;
    categoriesService
      .getCategories()
      .then(fetched => {
        if (isMounted && fetched && fetched.length > 0) {
          const merged = mergeWithDbCategories(CATEGORIES, fetched as unknown as Category[]);
          setCategoriesList(merged);
        }
      })
      .catch(err => {
        console.warn('Using default static categories:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-close on navigation
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

  // Clear debounce timeout
  const cancelCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Debounced close prevents flickering when moving between columns or button
  const scheduleClose = useCallback(() => {
    cancelCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredCatId(null);
      setHoveredSubCatId(null);
    }, 250);
  }, [cancelCloseTimeout]);

  // Active Category lookup (memoized)
  const activeCategory = useMemo(() => {
    if (!hoveredCatId) return null;
    return categoriesList.find(c => c.id === hoveredCatId) || null;
  }, [categoriesList, hoveredCatId]);

  // Active Subcategory lookup (memoized)
  const activeSubCategory = useMemo(() => {
    if (!activeCategory || !hoveredSubCatId) return null;
    return activeCategory.subcategories?.find(s => s.id === hoveredSubCatId) || null;
  }, [activeCategory, hoveredSubCatId]);

  // ──────────────────────────────────────────────
  // HOVER HANDLERS (Desktop / Mouse)
  // ──────────────────────────────────────────────
  const handleCategoryHover = (catId: string) => {
    cancelCloseTimeout();
    setHoveredCatId(catId);
    // Reset subcategory selection so Column 3 stays closed until subcategory is hovered
    setHoveredSubCatId(null);
  };

  const handleSubCategoryHover = (subId: string) => {
    cancelCloseTimeout();
    setHoveredSubCatId(subId);
  };

  // ──────────────────────────────────────────────
  // CLICK / TAP HANDLERS (Mouse navigates, Touch expands)
  // ──────────────────────────────────────────────
  const handleCategoryClick = (cat: Category, e: React.MouseEvent) => {
    const isTouch = isTouchInteractionRef.current;
    const hasSub = Boolean(cat.subcategories && cat.subcategories.length > 0);

    // On touch devices: tap once to expand subcategories, tap again to navigate
    if (isTouch && hasSub && hoveredCatId !== cat.id) {
      e.preventDefault();
      setHoveredCatId(cat.id);
      setHoveredSubCatId(null);
      return;
    }

    // Normal click or second tap: navigate & close
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  };

  const handleSubCategoryClick = (sub: Category, e: React.MouseEvent) => {
    const isTouch = isTouchInteractionRef.current;
    const hasSubSub = Boolean(sub.subcategories && sub.subcategories.length > 0);

    // On touch devices: tap once to expand sub-subcategories, tap again to navigate
    if (isTouch && hasSubSub && hoveredSubCatId !== sub.id) {
      e.preventDefault();
      setHoveredSubCatId(sub.id);
      return;
    }

    // Normal click or second tap: navigate & close
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  };

  const handleSubSubCategoryClick = () => {
    setIsOpen(false);
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  };

  // Toggle button click (manual open/close)
  const handleToggleClick = () => {
    cancelCloseTimeout();
    if (isOpen) {
      setIsOpen(false);
      setHoveredCatId(null);
      setHoveredSubCatId(null);
    } else {
      setIsOpen(true);
      setHoveredCatId(null);
      setHoveredSubCatId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:block ml-2"
      onPointerDown={(e) => {
        isTouchInteractionRef.current = e.pointerType === 'touch';
      }}
      onMouseEnter={() => {
        cancelCloseTimeout();
        setIsOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      {/* ── TRIGGER BUTTON ── */}
      <button
        onClick={handleToggleClick}
        aria-expanded={isOpen}
        aria-label="Categories menu"
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-2xl transition-all border select-none cursor-pointer",
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

      {/* ── MEGA DROPDOWN MENU ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            onMouseEnter={cancelCloseTimeout}
            onMouseLeave={scheduleClose}
            className="absolute top-full left-0 mt-2 z-50 flex flex-row rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 divide-x divide-slate-200 dark:divide-slate-800"
            style={{
              maxHeight: '460px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* INVISIBLE HOVER BRIDGE: Prevents mouseleave when cursor moves between button and dropdown */}
            <div className="absolute -top-3 left-0 w-full h-3 bg-transparent pointer-events-auto" />

            {/* ══════════════════════════════════════════════════════
                COLUMN 1: MAIN CATEGORIES (Always Visible)
                ══════════════════════════════════════════════════════ */}
            <div className="w-64 sm:w-72 flex flex-col shrink-0 bg-white dark:bg-[#0f172a]">
              {/* Header */}
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

              {/* Items List */}
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

            {/* ══════════════════════════════════════════════════════════════════
                COLUMN 2: SUBCATEGORIES (Opens Automatically on Category Hover)
                ══════════════════════════════════════════════════════════════════ */}
            {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
              <div className="w-64 sm:w-72 flex flex-col shrink-0 bg-slate-50 dark:bg-[#090e17] transition-all duration-150 ease-out">
                {/* Header */}
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

                {/* Items List */}
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

            {/* ════════════════════════════════════════════════════════════════════════════
                COLUMN 3: SUB-SUBCATEGORIES (Opens Automatically on Subcategory Hover)
                ════════════════════════════════════════════════════════════════════════════ */}
            {activeCategory && activeSubCategory && activeSubCategory.subcategories && activeSubCategory.subcategories.length > 0 && (
              <div className="w-64 sm:w-72 flex flex-col shrink-0 bg-white dark:bg-[#0f172a] transition-all duration-150 ease-out">
                {/* Header */}
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

                {/* Items List */}
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
