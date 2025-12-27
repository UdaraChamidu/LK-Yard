import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search, MapPin, Star, X, SlidersHorizontal, 
  BadgeCheck, Briefcase, GraduationCap
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

const designations = [
  { value: 'all', label: 'All Professionals' },
  { value: 'civil_engineer', label: 'Civil Engineers' },
  { value: 'architect', label: 'Architects' },
  { value: 'quantity_surveyor', label: 'Quantity Surveyors' },
  { value: 'site_supervisor', label: 'Site Supervisors' },
  { value: 'project_manager', label: 'Project Managers' },
  { value: 'structural_engineer', label: 'Structural Engineers' },
  { value: 'interior_designer', label: 'Interior Designers' },
];

const locations = [
  'All Locations',
  'Colombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Jaffna',
  'Kurunegala',
];

import { sampleProfessionals } from '@/data/sampleProfiles';

export default function Professionals() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState(searchParams.get('designation') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [rateRange, setRateRange] = useState([0, 50000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const designationParam = searchParams.get('designation');
    if (designationParam) {
      setSelectedDesignation(designationParam);
    }
  }, [searchParams]);

  const { data: fetchedProfiles = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => base44.entities.Profile.filter({ role: 'professional' }, '-rating', 50),
  });

  const profiles = fetchedProfiles.length > 0 ? fetchedProfiles : sampleProfessionals;

  const filteredProfiles = profiles.filter((profile) => {
    if (searchQuery && !profile.display_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedDesignation !== 'all' && profile.designation !== selectedDesignation) {
      return false;
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
    setSelectedDesignation('all');
    setSelectedLocation('All Locations');
    setRateRange([0, 50000]);
    setVerifiedOnly(false);
    setMinRating(0);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDesignation !== 'all' ||
    selectedLocation !== 'All Locations' ||
    rateRange[0] > 0 ||
    rateRange[1] < 50000 ||
    verifiedOnly ||
    minRating > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Designations */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Profession</h3>
        <div className="space-y-2">
          {designations.map((des) => (
            <button
              key={des.value}
              onClick={() => setSelectedDesignation(des.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedDesignation === des.value
                  ? 'bg-[#F47524] text-white'
                  : 'hover:bg-orange-50 hover:text-[#F47524] text-gray-700'
              }`}
            >
              {des.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Rate */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Daily Rate (LKR)</h3>
        <Slider
          value={rateRange}
          onValueChange={setRateRange}
          max={50000}
          step={1000}
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
          Verified professionals only
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
                    placeholder="Search professionals..."
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
                      <SelectItem value="reviews">Most Reviewed</SelectItem>
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
            </div>
          </div>

          {/* Hero & Description */}
          <div className="bg-gradient-to-b from-purple-50/50 to-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Expert Services
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Licensed Pros
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2 leading-tight">
                    Hire Top <br/>
                    <span className="text-purple-600">Construction Professionals</span>
                  </h1>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xl mb-4">
                    Connect with qualified experts including Civil Engineers, Architects, and Quantity Surveyors. 
                    Ensure your project meets the highest industry standards with professional guidance.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <BadgeCheck className="h-4 w-4 text-green-500" />
                      <span>Identity Verified</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Top Rated</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Active Pros</p>
                      <p className="text-xl font-bold text-gray-900">120+</p>
                    </div>
                    <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedProfiles.length}</span> professionals found
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
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No professionals found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={clearFilters} variant="outline" className="mt-4 border-gray-200">
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