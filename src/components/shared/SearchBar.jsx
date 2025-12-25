import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'tools_materials', label: 'Tools & Materials' },
  { value: 'subcontractors', label: 'Subcontractors' },
  { value: 'machines', label: 'Machine Hire' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'jobs', label: 'Jobs' },
];

const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'colombo', label: 'Colombo' },
  { value: 'gampaha', label: 'Gampaha' },
  { value: 'kandy', label: 'Kandy' },
  { value: 'galle', label: 'Galle' },
  { value: 'jaffna', label: 'Jaffna' },
  { value: 'kurunegala', label: 'Kurunegala' },
  { value: 'negombo', label: 'Negombo' },
];

export default function SearchBar({ variant = 'default', initialValues = {} }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValues.query || '');
  const [category, setCategory] = useState(initialValues.category || 'all');
  const [location, setLocation] = useState(initialValues.location || 'all');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    if (location && location !== 'all') params.set('location', location);
    navigate(createPageUrl(`Search?${params.toString()}`));
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-2 md:p-3">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tools, services, machines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 md:h-14 text-base border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#F47524]/20"
              />
            </div>

            {/* Category Select */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48 h-12 md:h-14 border-0 bg-gray-50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Select */}
            <div className="relative">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full md:w-40 h-12 md:h-14 border-0 bg-gray-50 pl-10">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button 
              type="submit"
              className="h-12 md:h-14 px-8 bg-[#F47524] hover:bg-[#E06418] text-white font-semibold text-base"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      <Button type="submit" className="bg-[#F47524] hover:bg-[#E06418]">
        Search
      </Button>
    </form>
  );
}