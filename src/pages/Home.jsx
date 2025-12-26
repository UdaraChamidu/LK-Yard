import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Eye, ThumbsUp, Clock, Plus, 
  Hammer, Users, Truck, Wrench, Building2, Home as HomeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ListingCard from '../components/listings/ListingCard';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  { id: 'all', name: 'All Categories', icon: HomeIcon },
  { id: 'subcontractors', name: 'Contractors', icon: Users },
  { id: 'machines', name: 'Equipment Rental', icon: Truck },
  { id: 'tools_materials', name: 'Building Materials', icon: Hammer },
  { id: 'professionals', name: 'Professionals', icon: Building2 },
  { id: 'jobs', name: 'Jobs & Careers', icon: Wrench },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: allListings = [], isLoading } = useQuery({
    queryKey: ['home-listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, null, 20),
  });

  const filteredListings = (selectedCategory === 'all' 
    ? allListings 
    : allListings.filter(l => l.category === selectedCategory))
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(createPageUrl(`Search?${params.toString()}`));
  };

  return (
    <div className="pb-20 lg:pb-0">
      {/* Search Bar */}
      <div className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for construction services, contractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" className="bg-[#F47524] hover:bg-[#E06418] h-12 px-8">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Categories */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm sticky top-20">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-[#111111]">Categories</h2>
              </div>
              <div className="p-2">
                {categories.map((cat) => {
                  const getCategoryUrl = (id) => {
                     switch(id) {
                        case 'subcontractors': return createPageUrl('Subcontractors');
                        case 'machines': return createPageUrl('HireMachines');
                        case 'tools_materials': return createPageUrl('BuySell?subcategory=Building Materials');
                        case 'professionals': return createPageUrl('Professionals');
                        case 'jobs': return createPageUrl('Jobs');
                        default: return null;
                     }
                  };

                  const targetUrl = getCategoryUrl(cat.id);
                  const isSelected = cat.id === 'all' && selectedCategory === 'all';
                  const classes = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-[#F47524] text-white'
                        : 'text-[#616367] hover:bg-gray-50'
                    }`;

                  if (targetUrl) {
                    return (
                      <Link
                        key={cat.id}
                        to={targetUrl}
                        className={classes}
                      >
                        <cat.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={classes}
                    >
                      <cat.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* CTA Banner */}
            <div className="bg-[#F47524] rounded-2xl p-8 text-white">
              <h1 className="text-2xl md:text-3xl font-bold font-['Poppins'] mb-2">
                Post Your Construction Ad
              </h1>
              <p className="text-white/90 mb-6">
                Reach thousands of customers looking for construction services
              </p>
              <Link to={createPageUrl('PostAd')}>
                <Button className="bg-white text-[#111111] hover:bg-gray-50 h-11">
                  <Plus className="mr-2 h-5 w-5" />
                  Post Ad Now
                </Button>
              </Link>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-[#616367]">No listings available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
