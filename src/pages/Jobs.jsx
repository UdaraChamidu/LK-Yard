import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Search, MapPin, Briefcase, Clock, DollarSign, X,
  SlidersHorizontal, Building2, Calendar, BadgeCheck
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
import { formatDistanceToNow } from 'date-fns';

const jobTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'daily', label: 'Daily Wage' },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'construction', label: 'Construction' },
  { value: 'skilled_trade', label: 'Skilled Trade' },
  { value: 'management', label: 'Management' },
  { value: 'admin', label: 'Administration' },
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

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['job-listings'],
    queryFn: () => base44.entities.Listing.filter(
      { type: 'job', status: 'active' },
      null,
      50
    ),
  });

  const filteredListings = listings.filter((listing) => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && listing.price_type !== selectedType) {
      return false;
    }
    if (selectedCategory !== 'all' && listing.subcategory !== selectedCategory) {
      return false;
    }
    if (selectedLocation !== 'All Locations' && listing.city !== selectedLocation) {
      return false;
    }
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'salary_high':
        return (b.price || 0) - (a.price || 0);
      case 'salary_low':
        return (a.price || 0) - (b.price || 0);
      default:
        return new Date(b.created_date) - new Date(a.created_date);
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedLocation('All Locations');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'All Locations';

  const JobCard = ({ job }) => (
    <Link
      to={createPageUrl(`ListingDetail?id=${job.id}`)}
      className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{job.owner_name || 'Company'}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
              {jobTypes.find(t => t.value === job.price_type)?.label || 'Full Time'}
            </Badge>
            {job.city && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {job.city}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center text-[#F47524] font-semibold">
              <DollarSign className="h-4 w-4 mr-1" />
              {job.price ? `LKR ${job.price.toLocaleString()}` : 'Negotiable'}
              <span className="text-gray-400 font-normal text-sm ml-1">/month</span>
            </div>
            <div className="text-xs text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {job.created_date && formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Job Type */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
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

      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
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
                    placeholder="Search jobs..."
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
                      <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                      <SelectItem value="salary_low">Salary: Low to High</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Mobile Filter Button */}
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="md:hidden h-10">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
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
          <div className="bg-gradient-to-b from-blue-50/50 to-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Careers
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Top Companies
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2 leading-tight">
                    Find Construction 
                    <span className="text-blue-600">    Job Opportunities</span>
                  </h1>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xl mb-4">
                    Explore career opportunities in Sri Lanka's construction industry. 
                    From site supervisors and engineers to skilled laborers, find the perfect role to advance your career with leading companies.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      <span>Full-Time & Contract</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      <BadgeCheck className="h-4 w-4 text-green-500" />
                      <span>Verified Employers</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{sortedListings.length}</span> jobs available
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : sortedListings.length > 0 ? (
              <div className="space-y-4">
                {sortedListings.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or check back later
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