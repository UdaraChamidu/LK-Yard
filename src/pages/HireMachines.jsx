import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, MapPin, Calendar, ChevronDown, X,
  SlidersHorizontal, Truck, Clock
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
                  : 'hover:bg-gray-100 text-gray-700'
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
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-medium">Machine Rental</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
            Hire Construction Machinery
          </h1>
          <p className="text-green-100 max-w-2xl mx-auto">
            Rent excavators, JCBs, lorries, cranes and more from verified owners across Sri Lanka
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search machines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-36">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
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
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms
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