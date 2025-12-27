import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Eye, ThumbsUp, Clock, Plus, 
  Hammer, Users, Truck, Wrench, Building2, Home as HomeIcon,
  Grid3X3, List, Check, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [viewMode, setViewMode] = useState('grid');

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
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="flex">
        {/* Fixed Sidebar */}
        <aside className="hidden lg:flex flex-col fixed left-3 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-30 overflow-y-auto pb-4">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 font-heading">Categories</h2>
          </div>
          <div className="p-2 space-y-1">
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
              const classes = `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                  isSelected
                  ? 'bg-[#F47524]/10 text-[#F47524] font-medium'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-[#F47524]'
                }`;

              const content = (
                <>
                  <cat.icon className={`h-5 w-5 transition-colors ${isSelected ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
                  <span className="text-sm">{cat.name}</span>
                </>
              );

              if (targetUrl) {
                return <Link key={cat.id} to={targetUrl} className={classes}>{content}</Link>;
              }

              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={classes}>
                  {content}
                </button>
              );
            })}
          </div>

          {/* Quick Access Section */}
          <div className="p-4 mt-6 border-t border-gray-100">
            <h2 className="font-semibold text-gray-900 font-heading text-sm mb-3 uppercase tracking-wider text-xs text-gray-500">Quick Access</h2>
            <div className="space-y-1">
               <Link to={createPageUrl('PostAd')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                  <Plus className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                  <span className="text-sm">Post New Ad</span>
               </Link>
               <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                  <ThumbsUp className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                  <span className="text-sm">Saved Ads</span>
               </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64 transition-all duration-300">
          {/* Search Bar - Moved Inside Content */}
          <div className="glass py-4 sticky top-16 z-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search for construction services, contractors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all shadow-sm"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 h-12 px-8 shadow-lg shadow-orange-500/20 transition-all hover:scale-105">
                  Search
                </Button>
              </form>
            </div>
          </div>

          <div className="px-4 py-4 md:px-8 space-y-8 max-w-7xl mx-auto">
            {/* Purpose & CTA Section */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Purpose Section */}
              <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2 leading-tight">
                    Welcome to 
                    <span className="text-[#F47524]">    LK-Yard</span>
                  </h1>
                  <p className="text-gray-600 leading-relaxed mb-4 max-w-2xl">
                    Sri Lanka's premier construction marketplace. We connect you with top-rated professionals, high-quality tools, reliable machinery, and skilled labor. Whether you're building a dream home or managing a large project, find everything you need in one place.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Users className="h-4 w-4 text-[#F47524]" />
                      <span>Verified Pros</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Truck className="h-4 w-4 text-[#F47524]" />
                      <span>Quality Machines</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Hammer className="h-4 w-4 text-[#F47524]" />
                      <span>Best Tools</span>
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-5">
                  <HomeIcon className="w-64 h-64 -mb-12 -mr-12" />
                </div>
              </div>

              {/* Mini CTA */}
              <div className="bg-gradient-to-br from-[#F47524] to-[#cc5500] rounded-2xl p-4 text-white shadow-lg flex flex-col relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-heading leading-tight">Post Your Ad</h2>
                      <p className="text-orange-100 text-sm">Start selling in minutes</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="p-1 bg-white/20 rounded-full">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="font-medium text-orange-50">Reach many active buyers</span>
                    </li>

                    <li className="flex items-center gap-2 text-sm">
                      <div className="p-1 bg-white/20 rounded-full">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="font-medium text-orange-50">Instant approval</span>
                    </li>
                  </ul>
                  
                  <Link to={createPageUrl('PostAd')} className="mt-auto">
                    <Button className="w-full bg-white text-[#F47524] hover:bg-orange-50 font-semibold shadow-md border-0 h-11">
                      Post Your Ad Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                {/* Decorative Circles */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/5 rounded-full blur-3xl" />
              </div>
            </div>

            {/* Listings Header & Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 font-heading">Recent Listings</h2>
              <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} variant={viewMode} />
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
