import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, MapPin, Calendar, ChevronDown, X,
  SlidersHorizontal, Truck, Clock, BadgeCheck
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
import ListingCard from '../components/listings/ListingCard';

const machineTypes = [
  { value: 'all', label: 'All Machines' },
  { value: 'excavator', label: 'Excavators' },
  { value: 'jcb', label: 'JCB / Backhoe Loaders' },
  { value: 'lorry', label: 'Lorries & Trucks' },
  { value: 'crane', label: 'Cranes' },
  { value: 'concrete_mixer', label: 'Concrete Mixers' },
  { value: 'scaffolding', label: 'Scaffolding' },
  { value: 'compactor', label: 'Compactors' },
  { value: 'generator', label: 'Generators' },
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

import { sampleListings } from '@/data/sampleListings';

export default function HireMachines() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  const { data: fetchedListings = [], isLoading } = useQuery({
    queryKey: ['machine-listings'],
    queryFn: () => base44.entities.Listing.filter(
      { type: 'machine', status: 'active' },
      null,
      50
    ),
  });

  const listings = fetchedListings.length > 0 ? fetchedListings : sampleListings.filter(l => l.type === 'machine');

  const filteredListings = listings.filter((listing) => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && listing.subcategory !== selectedType) {
      return false;
    }
    if (selectedLocation !== 'All Locations' && listing.city !== selectedLocation) {
      return false;
    }
    if ((listing.price || 0) < priceRange[0] || (listing.price || 0) > priceRange[1]) {
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
    setSelectedType('all');
    setSelectedLocation('All Locations');
    setPriceRange([0, 50000]);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'all' ||
    selectedLocation !== 'All Locations' ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Machine Types */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Machine Type</h3>
        <div className="space-y-2">
          {machineTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedType === type.value
                  ? 'bg-[#F47524] text-white'
                  : 'hover:bg-orange-50 hover:text-[#F47524] text-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Rate */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Daily Rate (LKR)</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={50000}
          step={1000}
          className="my-4"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>LKR {priceRange[0].toLocaleString()}</span>
          <span>LKR {priceRange[1].toLocaleString()}</span>
        </div>
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
          {/* Header */}
          <div className="glass sticky top-16 z-20">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search machines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44 h-10">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>

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
                  {selectedType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {machineTypes.find(t => t.value === selectedType)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType('all')} />
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

          {/* Hero & Description */}
          <div className="bg-gradient-to-b from-green-50/50 to-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Machine Rental
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Truck className="h-3 w-3" /> 50+ Types
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2 leading-tight">
                    Rent Heavy 
                    <span className="text-green-600">    Construction Machinery</span>
                  </h1>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xl mb-4">
                    Access a wide range of heavy machinery for any project size. 
                    From excavators and backhoes to cranes and dump trucks, rent directly from verified owners at competitive rates.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <BadgeCheck className="h-4 w-4 text-green-500" />
                      <span>Verified Owners</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Daily & Monthly Rates</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-8 max-w-7xl mx-auto">
            {/* Listings Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedListings.length}</span> machines available
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : sortedListings.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines found</h3>
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