import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, Grid3X3, List, ChevronDown, X, 
  SlidersHorizontal, MapPin, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import ListingCard from '../components/listings/ListingCard';

const subcategories = [
  'All Items',
  'Power Tools',
  'Hand Tools',
  'Building Materials',
  'Plumbing',
  'Electrical',
  'Flooring',
  'Roofing',
  'Hardware',
  'Safety Equipment',
];

const conditions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'used', label: 'Used' },
];

const locations = [
  'All Locations',
  'Colombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Jaffna',
  'Kurunegala',
  'Negombo',
  'Ratnapura',
];



import { sampleListings } from '@/data/sampleListings';

export default function BuySell() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || 'All Items');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('subcategory');
    if (categoryParam) {
      setSelectedSubcategory(categoryParam);
    }
  }, [searchParams]);

  const { data: fetchedListings = [], isLoading } = useQuery({
    queryKey: ['buy-sell-listings'],
    queryFn: () => base44.entities.Listing.filter(
      { type: 'item', status: 'active' }, 
      null, 
      50
    ),
  });

  const listings = fetchedListings.length > 0 ? fetchedListings : sampleListings.filter(l => l.type === 'item');

  const filteredListings = listings.filter((listing) => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedSubcategory !== 'All Items' && listing.subcategory !== selectedSubcategory) {
      return false;
    }
    if (selectedCondition !== 'all' && listing.condition !== selectedCondition) {
      return false;
    }
    if (selectedLocation !== 'All Locations' && listing.city !== selectedLocation) {
      return false;
    }
    if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
      return false;
    }
    if (verifiedOnly && !listing.owner_verified) {
      return false;
    }
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.price || 0) - (b.price || 0);
      case 'price_high':
        return (b.price || 0) - (a.price || 0);
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      default:
        return new Date(b.created_date) - new Date(a.created_date);
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubcategory('All Items');
    setSelectedCondition('all');
    setSelectedLocation('All Locations');
    setPriceRange([0, 500000]);
    setVerifiedOnly(false);
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedSubcategory !== 'All Items' || 
    selectedCondition !== 'all' || 
    selectedLocation !== 'All Locations' ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000 ||
    verifiedOnly;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Subcategories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedSubcategory === sub
                  ? 'bg-[#F47524] text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range (LKR)</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500000}
          step={5000}
          className="my-4"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>LKR {priceRange[0].toLocaleString()}</span>
          <span>LKR {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((cond) => (
              <SelectItem key={cond.value} value={cond.value}>
                {cond.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Verified Only */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={setVerifiedOnly}
        />
        <label htmlFor="verified" className="text-sm text-gray-700 cursor-pointer">
          Verified sellers only
        </label>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="flex">
        {/* Fixed Sidebar */}
        <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-30 overflow-y-auto pb-4">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-lg text-gray-900">Filters</h2>
          </div>
          <div className="p-4">
             <FilterContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:pl-64 transition-all duration-300">
          {/* Header (Search & Sort) - Moved Inside Content */}
          <div className="glass sticky top-16 z-20">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tools and materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {/* Sort & View */}
                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 h-10">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden md:flex items-center border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="md:hidden h-10">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <Badge className="ml-2 bg-[#F47524] text-white">!</Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedSubcategory !== 'All Items' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {selectedSubcategory}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubcategory('All Items')} />
                    </Badge>
                  )}
                  {selectedCondition !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {conditions.find(c => c.value === selectedCondition)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition('all')} />
                    </Badge>
                  )}
                  {selectedLocation !== 'All Locations' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedLocation}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation('All Locations')} />
                    </Badge>
                  )}
                  {verifiedOnly && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" />
                      Verified Only
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-8 max-w-7xl mx-auto">
            {/* Listings Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedListings.length}</span> items found
              </p>
            </div>

            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : sortedListings.length > 0 ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} variant={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters} variant="outline" className="border-gray-200">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}