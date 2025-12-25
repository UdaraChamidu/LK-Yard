import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search as SearchIcon, Filter, Grid3X3, List, X,
  SlidersHorizontal, MapPin
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
import ProfileCard from '../components/listings/ProfileCard';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'tools_materials', label: 'Tools & Materials' },
  { value: 'subcontractors', label: 'Subcontractors' },
  { value: 'machines', label: 'Machine Hire' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'jobs', label: 'Jobs' },
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
];

export default function Search() {
  const urlParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(urlParams.get('location') || 'All Locations');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: listings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['search-listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 100),
  });

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['search-profiles'],
    queryFn: () => base44.entities.Profile.list('-rating', 50),
  });

  const isProfileCategory = selectedCategory === 'subcontractors' || selectedCategory === 'professionals';

  const filteredListings = listings.filter((listing) => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && listing.category !== selectedCategory) {
      return false;
    }
    if (selectedLocation !== 'All Locations' && listing.city !== selectedLocation) {
      return false;
    }
    if ((listing.price || 0) < priceRange[0] || (listing.price || 0) > priceRange[1]) {
      return false;
    }
    if (verifiedOnly && !listing.owner_verified) {
      return false;
    }
    return true;
  });

  const filteredProfiles = profiles.filter((profile) => {
    if (searchQuery && !profile.display_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory === 'subcontractors' && profile.role !== 'subcontractor') {
      return false;
    }
    if (selectedCategory === 'professionals' && profile.role !== 'professional') {
      return false;
    }
    if (selectedLocation !== 'All Locations' && profile.city !== selectedLocation) {
      return false;
    }
    if (verifiedOnly && !profile.verified) {
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

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    return (b.rating || 0) - (a.rating || 0);
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('All Locations');
    setPriceRange([0, 500000]);
    setVerifiedOnly(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'All Locations' ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000 ||
    verifiedOnly;

  const isLoading = loadingListings || loadingProfiles;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-[#F47524] text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {!isProfileCategory && (
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
      )}

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

      <div className="flex items-center gap-3">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={setVerifiedOnly}
        />
        <label htmlFor="verified" className="text-sm text-gray-700 cursor-pointer">
          Verified only
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

  const resultCount = isProfileCategory ? sortedProfiles.length : sortedListings.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search listings, services, professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
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

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {selectedLocation !== 'All Locations' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedLocation}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation('All Locations')} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-36">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{resultCount}</span> results found
              </p>
            </div>

            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : resultCount > 0 ? (
              isProfileCategory ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {sortedProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                  {sortedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} variant={viewMode} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
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