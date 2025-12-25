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
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#F47524] text-white'
                        : 'text-[#616367] hover:bg-gray-50'
                    }`}
                  >
                    <cat.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                ))}
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
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={createPageUrl(`ListingDetail?id=${listing.id}`)}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600'}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {listing.category && (
                          <Badge className="bg-[#F47524] text-white text-xs capitalize">
                            {listing.category.replace('_', ' ')}
                          </Badge>
                        )}
                        {listing.featured && (
                          <Badge className="bg-purple-600 text-white text-xs">
                            Featured
                          </Badge>
                        )}
                        {listing.owner_verified && (
                          <Badge className="bg-green-600 text-white text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-semibold text-[#111111] line-clamp-2 mb-2 group-hover:text-[#F47524] transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-[#616367] line-clamp-2 mb-4">
                        {listing.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-[#616367]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {listing.featured ? '245' : '0'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views || 0}
                          </span>
                        </div>
                        {listing.created_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
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