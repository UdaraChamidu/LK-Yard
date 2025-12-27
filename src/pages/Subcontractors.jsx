import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, MapPin, Star, ChevronDown, X,
  SlidersHorizontal, BadgeCheck, Users
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
import ProfileCard from '../components/listings/ProfileCard';

const mainCategories = [
  { value: 'all', label: 'All Categories', icon: '🏗️' },
  { value: 'earthwork_excavation', label: 'Earthwork & Excavation', icon: '⛏️' },
  { value: 'concrete_structural', label: 'Concrete & Structural Works', icon: '🏗️' },
  { value: 'masonry_blockwork', label: 'Masonry & Block Work', icon: '🧱' },
  { value: 'flooring_tiling', label: 'Flooring, Tiling & Waterproofing', icon: '🔲' },
  { value: 'finishing', label: 'Finishing (Plastering & Painting)', icon: '🎨' },
  { value: 'roofing_ceiling', label: 'Roofing & Ceiling', icon: '🏠' },
  { value: 'doors_windows_metal', label: 'Doors, Windows & Metal Works', icon: '🚪' },
  { value: 'plumbing_electrical', label: 'Plumbing & Electrical', icon: '🔌' },
  { value: 'landscaping_external', label: 'Landscaping & External Works', icon: '🌳' },
  { value: 'testing_maintenance', label: 'Testing, Maintenance & Special Services', icon: '🔧' },
];

const serviceGroups = {
  earthwork_excavation: [
    'Site Clearing',
    'Manual Excavation',
    'Machine Excavation',
    'Earth Filling & Compaction',
    'Dewatering',
    'Material Transport',
  ],
  concrete_structural: [
    'Plain Concrete',
    'Reinforced Concrete',
    'Ready-Mix Supply',
    'Concrete Pumping',
    'Formwork / Shuttering',
    'Structural Steel Work',
    'Bar Bending & Fixing',
  ],
  masonry_blockwork: [
    'Brick Masonry',
    'Block Masonry',
    'Stone Masonry',
    'Partition Walls',
    'Retaining Walls',
  ],
  flooring_tiling: [
    'Floor Tiling',
    'Wall Tiling',
    'Marble / Granite Laying',
    'Waterproofing',
    'Epoxy Flooring',
    'Wood Flooring',
  ],
  finishing: [
    'Plastering',
    'Painting (Interior)',
    'Painting (Exterior)',
    'Texture Finishing',
    'Skirting Work',
  ],
  roofing_ceiling: [
    'Roof Tiling',
    'Metal Roofing',
    'Ceiling Installation',
    'False Ceiling',
    'Roof Waterproofing',
  ],
  doors_windows_metal: [
    'Aluminum Work',
    'Steel Fabrication',
    'Door Installation',
    'Window Installation',
    'Grill Work',
    'Gate Fabrication',
  ],
  plumbing_electrical: [
    'Water Supply Installation',
    'Drainage Works',
    'Sanitary Fitting',
    'Electrical Wiring',
    'Panel Installation',
    'Lighting Work',
  ],
  landscaping_external: [
    'Gardening',
    'Paving Work',
    'Boundary Wall',
    'Driveway Construction',
    'External Drainage',
  ],
  testing_maintenance: [
    'Quality Testing',
    'Building Inspection',
    'Maintenance Services',
    'Repair Work',
  ],
};

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

import { sampleSubcontractors } from '@/data/sampleProfiles';

export default function Subcontractors() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedServiceGroups, setSelectedServiceGroups] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [rateRange, setRateRange] = useState([0, 10000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const { data: fetchedProfiles = [], isLoading } = useQuery({
    queryKey: ['subcontractors'],
    queryFn: () => base44.entities.Profile.filter({ role: 'subcontractor' }, '-rating', 50),
  });

  const profiles = fetchedProfiles.length > 0 ? fetchedProfiles : sampleSubcontractors;

  const filteredProfiles = profiles.filter((profile) => {
    if (searchQuery && !profile.display_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && profile.main_category !== selectedCategory) {
      return false;
    }
    if (selectedServiceGroups.length > 0) {
      const hasMatch = selectedServiceGroups.some(sg => 
        profile.service_groups?.some(psg => psg.toLowerCase().includes(sg.toLowerCase()))
      );
      if (!hasMatch) return false;
    }
    if (selectedLocation !== 'All Locations' && profile.city !== selectedLocation) {
      return false;
    }
    if ((profile.daily_rate || 0) < rateRange[0] || (profile.daily_rate || 0) > rateRange[1]) {
      return false;
    }
    if (verifiedOnly && !profile.verified) {
      return false;
    }
    if ((profile.rating || 0) < minRating) {
      return false;
    }
    return true;
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    switch (sortBy) {
      case 'rate_low':
        return (a.daily_rate || 0) - (b.daily_rate || 0);
      case 'rate_high':
        return (b.daily_rate || 0) - (a.daily_rate || 0);
      case 'reviews':
        return (b.rating_count || 0) - (a.rating_count || 0);
      default:
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedServiceGroups([]);
    setSelectedLocation('All Locations');
    setRateRange([0, 10000]);
    setVerifiedOnly(false);
    setMinRating(0);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedServiceGroups.length > 0 ||
    selectedLocation !== 'All Locations' ||
    rateRange[0] > 0 ||
    rateRange[1] < 10000 ||
    verifiedOnly ||
    minRating > 0;

  const toggleServiceGroup = (group) => {
    setSelectedServiceGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Main Categories */}
      <div>
        <h3 className="font-semibold text-[#111111] mb-3">Main Category</h3>
        <div className="space-y-2">
          {mainCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setSelectedServiceGroups([]);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedCategory === cat.value
                  ? 'bg-[#F47524] text-white'
                  : 'hover:bg-gray-100 text-[#616367]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Service Groups (Layer 2) */}
      {selectedCategory !== 'all' && serviceGroups[selectedCategory] && (
        <div>
          <h3 className="font-semibold text-[#111111] mb-3">Service Type</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {serviceGroups[selectedCategory].map((group) => (
              <label
                key={group}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <Checkbox
                  checked={selectedServiceGroups.includes(group)}
                  onCheckedChange={() => toggleServiceGroup(group)}
                />
                <span className="text-sm text-[#616367]">{group}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Daily Rate */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Daily Rate (LKR)</h3>
        <Slider
          value={rateRange}
          onValueChange={setRateRange}
          max={10000}
          step={500}
          className="my-4"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>LKR {rateRange[0].toLocaleString()}</span>
          <span>LKR {rateRange[1].toLocaleString()}</span>
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

      {/* Min Rating */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                minRating === rating
                  ? 'bg-[#F47524] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {rating > 0 ? (
                <>
                  <Star className="h-3 w-3 fill-current" />
                  {rating}+
                </>
              ) : (
                'Any'
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Only */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={setVerifiedOnly}
        />
        <label htmlFor="verified" className="text-sm text-gray-700 cursor-pointer">
          Verified workers only
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
          {/* Header */}
          <div className="glass sticky top-16 z-20">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or skill..."
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
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="rate_low">Rate: Low to High</SelectItem>
                      <SelectItem value="rate_high">Rate: High to Low</SelectItem>
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
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {mainCategories.find(c => c.value === selectedCategory)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                    </Badge>
                  )}
                  {selectedServiceGroups.map((group) => (
                    <Badge key={group} variant="secondary" className="flex items-center gap-1">
                      {group}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleServiceGroup(group)} />
                    </Badge>
                  ))}
                  {selectedLocation !== 'All Locations' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedLocation}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation('All Locations')} />
                    </Badge>
                  )}
                  {minRating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {minRating}+ rating
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating(0)} />
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

          {/* Hero */}
          <div className="bg-gradient-to-r from-[#111111] to-[#2d2d2d] text-white py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-4">
                Find Skilled Subcontractors
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Connect with verified masons, plumbers, electricians, painters, and more across Sri Lanka
              </p>
            </div>
          </div>

          <div className="px-4 py-8 max-w-7xl mx-auto">
            {/* Profiles Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedProfiles.length}</span> workers found
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                ))}
              </div>
            ) : sortedProfiles.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {sortedProfiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
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

