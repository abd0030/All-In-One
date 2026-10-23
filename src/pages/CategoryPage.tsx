import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, SlidersHorizontal, MapPin, DollarSign, Tag, RefreshCw } from 'lucide-react';
import { listingsService } from '../services/listingsService';
import { Listing, Category, SearchFilters, ListingCondition } from '../types';
import ListingCard from '../components/listings/ListingCard';
import { Select, Spinner, EmptyState } from '../components/ui';
import { SORT_OPTIONS, CITIES, CONDITIONS } from '../utils/constants';
import Icon from '../components/ui/Icon';
import { categoriesService } from '../services';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({ sort_by: 'created_at' });

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedSubSubcategoryId, setSelectedSubSubcategoryId] = useState<string | null>(null);
  const [selectedPartTypeId, setSelectedPartTypeId] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const subParam = searchParams.get('sub');
  const subSubParam = searchParams.get('subSub');

  useEffect(() => {
    if (!slug) return;
    setCategoriesLoading(true);
    // Reset selection states
    setSelectedSubcategoryId(null);
    setSelectedSubSubcategoryId(null);
    setSelectedPartTypeId(null);

    categoriesService.getCategories()
      .then(allCats => {
        const typedCats = allCats as unknown as Category[];
        setAllCategories(typedCats);
        const found = typedCats.find(c => c.slug === slug);
        if (found) {
          const subcategories = typedCats.filter(c => c.parent_id === found.id);
          setCategory({
            ...found,
            subcategories
          });

          if (subParam) {
            const matchedSub = subcategories.find(s => s.id === subParam || s.slug === subParam);
            if (matchedSub) {
              setSelectedSubcategoryId(matchedSub.id);
              if (subSubParam) {
                const subSubs = typedCats.filter(c => c.parent_id === matchedSub.id);
                const matchedSubSub = subSubs.find(ss => ss.id === subSubParam || ss.slug === subSubParam);
                if (matchedSubSub) {
                  setSelectedSubSubcategoryId(matchedSubSub.id);
                }
              }
            }
          }
        } else {
          setCategory(null);
        }
      })
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
  }, [slug]);

  useEffect(() => {
    if (subParam && allCategories.length > 0) {
      const matchedSub = allCategories.find(s => s.id === subParam || s.slug === subParam);
      if (matchedSub) {
        setSelectedSubcategoryId(matchedSub.id);
        if (subSubParam) {
          const matchedSubSub = allCategories.find(ss => (ss.id === subSubParam || ss.slug === subSubParam) && ss.parent_id === matchedSub.id);
          if (matchedSubSub) {
            setSelectedSubSubcategoryId(matchedSubSub.id);
          }
        }
      }
    }
  }, [subParam, subSubParam, allCategories]);

  const subSubcategories = React.useMemo(() => {
    if (!selectedSubcategoryId || allCategories.length === 0) return [];
    return allCategories.filter(c => c.parent_id === selectedSubcategoryId);
  }, [selectedSubcategoryId, allCategories]);

  const subSubSubcategories = React.useMemo(() => {
    if (!selectedSubSubcategoryId || allCategories.length === 0) return [];
    return allCategories.filter(c => c.parent_id === selectedSubSubcategoryId);
  }, [selectedSubSubcategoryId, allCategories]);

  useEffect(() => {
    if (!category) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    setLoading(true);
    const activeCategoryId = selectedPartTypeId || selectedSubSubcategoryId || selectedSubcategoryId || category.id;
    listingsService.getListings({ ...filters, category_id: activeCategoryId }, page)
      .then(res => {
        setListings(res.data);
        setTotal(res.count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, filters, page, selectedSubcategoryId, selectedSubSubcategoryId, selectedPartTypeId]);

  if (categoriesLoading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Spinner size={36} />
    </div>
  );

  if (!category) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <p className="text-slate-500">Category not found.</p>
      <Link to="/listings" className="text-primary-600 hover:underline mt-2 inline-block">Browse all listings</Link>
    </div>
  );

  const getConditionsToUse = () => {
    const activeCategoryId = selectedPartTypeId || selectedSubSubcategoryId || selectedSubcategoryId || category?.id;
    if (!activeCategoryId) return CONDITIONS;
    const cat = allCategories.find(c => c.id === activeCategoryId);
    const parent = cat?.parent_id ? allCategories.find(c => c.id === cat.parent_id) : null;
    
    const isFurnitureConditionCat = (catId: string | undefined): boolean => {
      if (!catId) return false;
      const target = allCategories.find(c => c.id === catId);
      if (!target) return false;
      if (
        target.id === 'c1000000-0000-0000-0000-000000000006' ||
        target.slug === 'furniture-home-decor' ||
        target.name === 'Furniture & Home Decor' ||
        Boolean(target.id?.startsWith('d1000000-0000-0000-0000-00000000031')) ||
        Boolean(target.id?.startsWith('d1000000-0000-0000-0000-00000000032')) ||
        Boolean(target.id?.startsWith('d1000000-0000-0000-0000-000000001')) ||
        Boolean(target.id?.startsWith('d1000000-0000-0000-0000-000000002'))
      ) {
        return true;
      }
      if (target.parent_id) return isFurnitureConditionCat(target.parent_id);
      return false;
    };

      const isSimplifiedConditionCat = (catId: string | undefined): boolean => {
      if (!catId) return false;
      const target = allCategories.find(c => c.id === catId);
      if (!target) return false;
      if (
        target.id === 'c1000000-0000-0000-0000-000000000001' ||
        target.id === 'c1000000-0000-0000-0000-000000000099' ||
        target.id === 'c1000000-0000-0000-0000-000000000016' ||
        target.id === 'c1000000-0000-0000-0000-000000000005' ||
        target.id === 'c1000000-0000-0000-0000-000000000008' ||
        target.id === 'c1000000-0000-0000-0000-000000000010' ||
        target.id === 'c1000000-0000-0000-0000-000000000012' ||
        target.slug === 'vehicles' ||
        target.slug === 'bikes' ||
        target.slug === 'electronics-home-appliances' ||
        target.slug === 'fashion-beauty' ||
        target.slug === 'education' ||
        target.slug === 'sports-hobbies' ||
        target.slug === 'agriculture' ||
        target.name === 'Vehicles' ||
        target.name === 'Bikes' ||
        target.name === 'Electronics & Home Appliances' ||
        target.name === 'Fashion & Beauty' ||
        target.name === 'Education' ||
        target.name === 'Sports & Hobbies' ||
        target.name === 'Agriculture' ||
        Boolean(target.id?.startsWith('d1000000-') && !target.id?.startsWith('d1000000-0000-0000-0000-000000007'))
      ) {
        return true;
      }
      if (target.parent_id) return isSimplifiedConditionCat(target.parent_id);
      return false;
    };

    const checkKidsCategory = (catId: string | undefined): boolean => {
      if (!catId) return false;
      const target = allCategories.find(c => c.id === catId);
      if (!target) return false;
      if (target.id === 'c1000000-0000-0000-0000-000000000017' ||
          target.slug === 'kids' ||
          target.name === 'Kids' ||
          Boolean(target.id?.startsWith('d1000000-0000-0000-0000-000000007'))) {
        return true;
      }
      if (target.parent_id) return checkKidsCategory(target.parent_id);
      return false;
    };

    if (checkKidsCategory(activeCategoryId)) {
      const isBathDiapers = (catId: string | undefined): boolean => {
        if (!catId) return false;
        const target = allCategories.find(c => c.id === catId);
        if (!target) return false;
        if (target.id === 'd1000000-0000-0000-0000-000000007005' ||
            Boolean(target.id?.startsWith('d1000000-0000-0000-0000-0000000075')) ||
            target.slug?.includes('bath-diapers') ||
            target.name?.includes('Bath & Diapers')) {
          return true;
        }
        if (target.parent_id) return isBathDiapers(target.parent_id);
        return false;
      };

      const isKidsClothing = (catId: string | undefined): boolean => {
        if (!catId) return false;
        const target = allCategories.find(c => c.id === catId);
        if (!target) return false;
        if (target.id === 'd1000000-0000-0000-0000-000000007007' ||
            Boolean(target.id?.startsWith('d1000000-0000-0000-0000-0000000077')) ||
            target.slug?.includes('clothing') ||
            target.name?.includes('Clothing')) {
          return true;
        }
        if (target.parent_id) return isKidsClothing(target.parent_id);
        return false;
      };

      if (isBathDiapers(activeCategoryId)) {
        return CONDITIONS.filter(c => c.value === 'new');
      }
      if (isKidsClothing(activeCategoryId)) {
        return CONDITIONS.filter(c => c.value === 'new' || c.value === 'good');
      }
      return CONDITIONS.filter(c => c.value === 'new' || c.value === 'like_new' || c.value === 'good');
    }

    if (isFurnitureConditionCat(activeCategoryId)) {
      return [
        { value: 'new', label: 'New' },
        { value: 'like_new', label: 'Like New' },
        { value: 'good', label: 'Gently Used' },
        { value: 'fair', label: 'Used' },
        { value: 'poor', label: 'Needs Repair' }
      ];
    }

    if (isSimplifiedConditionCat(activeCategoryId)) {
      return CONDITIONS.filter(c => c.value === 'new' || c.value === 'good');
    }

    const isUnderAccessories = cat?.id === 'c1000000-0000-0000-0000-000000000118' ||
      cat?.slug === 'electronics-accessories' ||
      cat?.name === 'Accessories' ||
      parent?.id === 'c1000000-0000-0000-0000-000000000118' ||
      parent?.slug === 'electronics-accessories' ||
      parent?.name === 'Accessories';

    const isUnderCamera = cat?.id === 'c1000000-0000-0000-0000-000000000116' ||
      cat?.slug === 'cameras' ||
      cat?.name === 'Cameras' ||
      cat?.name === 'Camera & Accessories' ||
      parent?.id === 'c1000000-0000-0000-0000-000000000116' ||
      parent?.slug === 'cameras' ||
      parent?.name === 'Cameras' ||
      parent?.name === 'Camera & Accessories';

    const isComputerOtherAcc = cat?.id === '3a4d9e5c-96b9-4787-b9b2-229dbdc869b2' ||
      cat?.slug?.includes('other-accessories') ||
      cat?.name === 'Other Accessories' ||
      parent?.id === '3a4d9e5c-96b9-4787-b9b2-229dbdc869b2' ||
      parent?.slug?.includes('other-accessories') ||
      parent?.name === 'Other Accessories';

    if (isUnderAccessories || isUnderCamera || isComputerOtherAcc) {
      return CONDITIONS.filter(c => c.value === 'new' || c.value === 'good');
    }
    return CONDITIONS;
  };

  const conditionsToUse = getConditionsToUse();

  const isProperty = category?.id === 'c1000000-0000-0000-0000-000000000002' ||
    category?.slug === 'property-for-sale' ||
    category?.id === 'c1000000-0000-0000-0000-000000000015' ||
    category?.slug === 'property-for-rent';

  const isAnimals = category?.id === 'c1000000-0000-0000-0000-000000000009' ||
    category?.slug === 'animals' || category?.slug === 'pets' ||
    category?.name === 'Animals' || category?.name === 'Pets';

  const isServices = category?.id === 'c1000000-0000-0000-0000-000000000007' ||
    category?.slug === 'services' || category?.name === 'Services';

  const isBusiness = category?.id === 'c1000000-0000-0000-0000-000000000011' ||
    category?.slug === 'business-industrial' || category?.name === 'Business & Industrial' ||
    Boolean(category?.id?.startsWith('d1000000-0000-0000-0000-000000000f'));

  const isJobs = category?.id === 'c1000000-0000-0000-0000-000000000004' ||
    category?.slug === 'jobs' || category?.name === 'Jobs' ||
    Boolean(category?.id?.startsWith('d1000000-0000-0000-0000-000000004'));

  const isFashion = category?.id === 'c1000000-0000-0000-0000-000000000005' ||
    category?.slug === 'fashion-beauty' || category?.name === 'Fashion & Beauty' ||
    Boolean(category?.id?.startsWith('d1000000-0000-0000-0000-000000005'));

  const isEducation = category?.id === 'c1000000-0000-0000-0000-000000000008' ||
    category?.slug === 'education' || category?.name === 'Education' ||
    Boolean(category?.id?.startsWith('d1000000-0000-0000-0000-000000008'));

  const isSports = category?.id === 'c1000000-0000-0000-0000-000000000010' ||
    category?.slug === 'sports-hobbies' || category?.name === 'Sports & Hobbies' ||
    Boolean(category?.id?.startsWith('d1000000-0000-0000-0000-000000009'));

  const isAgriculture = category?.id === 'c1000000-0000-0000-0000-000000000012' ||
    category?.slug === 'agriculture' || category?.name === 'Agriculture' ||
    Boolean(category?.id?.startsWith('d1000000-0000-0000-0000-00000000a'));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Category Hero */}
      <div
        className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${category.color}dd, ${category.color}99)` }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <Icon name={category.icon} size={100} />
        </div>
        <nav className="flex items-center gap-1 text-sm text-white/70 mb-3">
          <Link to="/" className="hover:text-white">Home</Link>
          <ArrowRight size={12} />
          <span className="text-white">{category.name}</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon name={category.icon} size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-white/80 mt-1">{total.toLocaleString()} listings available</p>
          </div>
        </div>
        {/* Category Filter Pills */}
        <div className="space-y-3 mt-6">
          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map(sub => {
                const isSelected = selectedSubcategoryId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSubcategoryId(null);
                        setSelectedSubSubcategoryId(null);
                        setSelectedPartTypeId(null);
                      } else {
                        setSelectedSubcategoryId(sub.id);
                        setSelectedSubSubcategoryId(null);
                        setSelectedPartTypeId(null);
                      }
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 border-white shadow-sm font-bold scale-[1.03]'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-subcategories */}
          {selectedSubcategoryId && subSubcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/15">
              {subSubcategories.map(subSub => {
                const isSelected = selectedSubSubcategoryId === subSub.id;
                return (
                  <button
                    key={subSub.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSubSubcategoryId(null);
                        setSelectedPartTypeId(null);
                      } else {
                        setSelectedSubSubcategoryId(subSub.id);
                        setSelectedPartTypeId(null);
                      }
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 border-white shadow-sm font-bold scale-[1.03]'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {subSub.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-sub-subcategories (Accessory / Part Types) */}
          {selectedSubSubcategoryId && subSubSubcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/15">
              {subSubSubcategories.map(part => {
                const isSelected = selectedPartTypeId === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPartTypeId(null);
                      } else {
                        setSelectedPartTypeId(part.id);
                      }
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 border-white shadow-sm font-bold scale-[1.03]'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {part.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Premium Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-none mb-6 transition-all duration-300">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary-500 w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">Filter Listings</h2>
          </div>
          {(filters.location || filters.condition || filters.min_price || filters.max_price || filters.furnished || selectedSubcategoryId || selectedSubSubcategoryId || selectedPartTypeId) && (
            <button
              onClick={() => {
                setFilters({ sort_by: 'created_at' });
                setSelectedSubcategoryId(null);
                setSelectedSubSubcategoryId(null);
                setSelectedPartTypeId(null);
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-white dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-600 rounded-xl transition-all duration-250 border border-red-200 dark:border-red-950/40 hover:border-transparent active:scale-[0.98]"
            >
              <RefreshCw size={12} />
              Reset Filters
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* City select pill */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              <MapPin size={16} />
            </div>
            <select
              value={filters.location || ''}
              onChange={e => {
                setFilters(f => ({ ...f, location: e.target.value || undefined }));
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl cursor-pointer transition-all duration-200 appearance-none"
            >
              <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{city}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Furnished select pill */}
          {isProperty && (
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Tag size={16} />
              </div>
              <select
                value={filters.furnished || ''}
                onChange={e => {
                  setFilters(f => ({ ...f, furnished: e.target.value || undefined }));
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl cursor-pointer transition-all duration-200 appearance-none"
              >
                <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Furnished / Unfurnished</option>
                <option value="Furnished" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Furnished</option>
                <option value="Unfurnished" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Unfurnished</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          )}

          {/* Sex/Gender select pill */}
          {(isAnimals || isFashion) && (
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Tag size={16} />
              </div>
              <select
                value={filters.sex || ''}
                onChange={e => {
                  setFilters(f => ({ ...f, sex: e.target.value || undefined }));
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl cursor-pointer transition-all duration-200 appearance-none"
              >
                {isFashion ? (
                  <>
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Genders</option>
                    <option value="Men" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Men</option>
                    <option value="Women" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Women</option>
                    <option value="Unisex" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Unisex</option>
                    <option value="Boys" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Boys</option>
                    <option value="Girls" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Girls</option>
                  </>
                ) : (
                  <>
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Sex</option>
                    <option value="Male" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Male</option>
                    <option value="Female" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Female</option>
                    <option value="Pair" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Pair</option>
                  </>
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          )}

          {/* Condition select pill */}
          {!isProperty && !isAnimals && !isServices && !isBusiness && !isJobs && (
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Tag size={16} />
              </div>
              <select
                value={filters.condition || ''}
                onChange={e => {
                  setFilters(f => ({ ...f, condition: (e.target.value || undefined) as ListingCondition | undefined }));
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl cursor-pointer transition-all duration-200 appearance-none"
              >
                <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Conditions</option>
                {conditionsToUse.map(c => (
                  <option key={c.value} value={c.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{c.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          )}

          {/* Price Range Card / Pill */}
          {!isServices && !isJobs && (
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1 flex-1 min-w-[260px] gap-2 transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
              <div className="text-slate-400 dark:text-slate-500">
                <DollarSign size={16} />
              </div>
              <input
                type="number"
                placeholder="Min Price"
                value={filters.min_price || ''}
                onChange={e => {
                  setFilters(f => ({ ...f, min_price: e.target.value ? Number(e.target.value) : undefined }));
                  setPage(1);
                }}
                className="w-full bg-transparent border-0 py-1.5 text-sm focus:outline-none focus:ring-0 text-slate-700 dark:text-slate-200 font-semibold placeholder-slate-400"
              />
              <span className="text-slate-300 dark:text-slate-650 font-bold px-1">|</span>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.max_price || ''}
                onChange={e => {
                  setFilters(f => ({ ...f, max_price: e.target.value ? Number(e.target.value) : undefined }));
                  setPage(1);
                }}
                className="w-full bg-transparent border-0 py-1.5 text-sm focus:outline-none focus:ring-0 text-slate-700 dark:text-slate-200 font-semibold placeholder-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? '...' : `${total.toLocaleString()} listings`}
          </p>
          <Select
            options={SORT_OPTIONS}
            value={filters.sort_by || 'created_at'}
            onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value as SearchFilters['sort_by'] }))}
            className="text-sm w-44"
          />
        </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size={36} /></div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon={<Icon name={category.icon} size={28} />}
              title={`No ${category.name} listings yet`}
              description="Be the first to post in this category!"
              action={
                <Link to="/dashboard/listings/new" className="btn-primary">Post a Free Ad</Link>
              }
            />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </motion.div>

              {/* Load more */}
              {total > listings.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-8 py-3 border-2 border-primary-600 text-primary-600 font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default CategoryPage;
