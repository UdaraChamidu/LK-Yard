import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, Users, User, Star, MessageSquare, Calendar, 
  ChevronRight, TrendingUp, Clock, CheckCircle2, XCircle, Search, Filter,
  Settings, LogOut, Heart, Database, Shield,
  Eye, ShoppingBag, Mail, BadgeCheck, Plus, RefreshCw, PauseCircle, PlayCircle, Trash2, MoreVertical, Edit, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import Messages from './Messages';
import Favorites from './Favorites';
// import Settings from './Settings';
import AdminTools from './AdminTools';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('Dashboard'));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Dashboard'));
      }
    };
    checkAuth();
  }, []);

  const { data: myListings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: myBookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ requester_email: user.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ user_email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: myFavorites = [] } = useQuery({
    queryKey: ['my-favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['my-inquiries', user?.email],
    queryFn: async () => {
      const leadRequests = await base44.entities.LeadRequest.filter({ profile_email: user.email }, '-created_date', 50);
      return leadRequests;
    },
    enabled: !!user?.email,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 100),
    enabled: user?.role === 'admin',
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 100),
    enabled: user?.role === 'admin',
  });

  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: () => base44.entities.Review.filter({ moderated: false }, '-created_date', 100),
    enabled: user?.role === 'admin',
  });

  const approveReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.update(id, { moderated: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Listing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setDeleteId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Listing.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const relistMutation = useMutation({
    mutationFn: (listing) => {
      const { id, created_date, updated_date, created_by, views, ...listingData } = listing;
      return base44.entities.Listing.create({ ...listingData, status: 'active', views: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }) => {
      await Promise.all(ids.map(id => base44.entities.Listing.update(id, data)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setSelectedListings([]);
      setBulkActionOpen(false);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.Listing.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setSelectedListings([]);
      setBulkActionOpen(false);
    },
  });

  const handleSelectAll = () => {
    if (selectedListings.length === myListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(myListings.map(l => l.id));
    }
  };

  const handleSelectListing = (id) => {
    setSelectedListings(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Login'));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const SidebarItem = ({ icon: Icon, label, value, onClick, isLink = false }) => {
    const isActive = activeTab === value && !isLink;
    return (
      <button
        onClick={() => {
          if (isLink && onClick) {
              onClick();
          } else {
              setActiveTab(value);
          }
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-orange-50 text-[#F47524] font-medium shadow-sm' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-[#F47524]' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span>{label}</span>
        {isActive && <ChevronRight className="h-4 w-4 ml-auto text-orange-400" />}
      </button>
    );
  };

  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');

  const stats = [
    { label: 'Active Listings', value: activeListings.length, icon: Package, color: 'text-green-600' },
    { label: 'Total Views', value: myListings.reduce((sum, l) => sum + (l.views || 0), 0), icon: Eye, color: 'text-blue-600' },
    { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Saved Ads', value: myFavorites.length, icon: Heart, color: 'text-red-600' },
  ];

  const ListingItem = ({ listing, showCheckbox }) => (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300"
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {showCheckbox && (
          <Checkbox
            checked={selectedListings.includes(listing.id)}
            onCheckedChange={() => handleSelectListing(listing.id)}
            className="data-[state=checked]:bg-[#F47524] data-[state=checked]:border-[#F47524]"
          />
        )}
        <div className="relative overflow-hidden rounded-xl w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-100">
          <img
            src={listing.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            listing.status === 'active' ? 'bg-green-500 text-white' : 
            listing.status === 'sold' ? 'bg-gray-500 text-white' : 
            'bg-yellow-500 text-white'
          }`}>
            {listing.status}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1 text-lg group-hover:text-[#F47524] transition-colors">{listing.title}</h3>
            <p className="text-[#F47524] font-bold text-lg mt-0.5">
              {listing.price ? `LKR ${listing.price.toLocaleString()}` : 'Contact for price'}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`ListingDetail?id=${listing.id}`)} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Listing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`EditListing?id=${listing.id}`)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Link>
              </DropdownMenuItem>
              {listing.status === 'active' ? (
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'inactive' })} className="cursor-pointer">
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'active' })} className="cursor-pointer">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              {listing.status !== 'sold' && (
                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'sold' })} className="cursor-pointer">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Sold
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => relistMutation.mutate(listing)} className="cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" />
                Duplicate Listing
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={() => setDeleteId(listing.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 mt-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <span className="flex items-center gap-1.5" title="Total views">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-gray-700">{listing.views || 0}</span> Views
          </span>
          <span className="flex items-center gap-1.5" title="Performance">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-medium text-gray-700">
              {((listing.views || 0) / Math.max(1, Math.ceil((Date.now() - new Date(listing.created_date).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)}/day
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-orange-500" />
            {listing.created_date && formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-72 bg-white border-r h-auto lg:min-h-[calc(100vh-64px)] p-6 flex flex-col gap-2 shadow-sm z-20">
        <div className="mb-2 px-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</h2>
            <div className="space-y-1 font-medium text-sm">
                <SidebarItem icon={LayoutDashboard} label="Overview" value="overview" />
                <SidebarItem icon={Package} label="My Listings" value="listings" />
                <SidebarItem icon={Heart} label="Saved Ads" value="favorites" />
                <SidebarItem icon={Calendar} label="Bookings" value="bookings" />
                <SidebarItem icon={MessageSquare} label="Inquiries" value="inquiries" />
                <SidebarItem icon={MessageSquare} label="Messages" value="messages_page" />
            </div>
        </div>

        {user.role === 'admin' && (
            <div className="mb-2 px-2 space-y-2">
                <h2 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Admin</h2>
                <div className="space-y-1 font-medium text-sm">
                    <SidebarItem icon={Users} label="All Users" value="users" />
                    <SidebarItem icon={Star} label="Reviews" value="reviews" />
                    <SidebarItem icon={Database} label="Admin Tools" value="admintools" />
                </div>
            </div>
        )}

        <div className="mt-4 px-2 pt-3 border-t font-medium text-sm">
            <SidebarItem icon={Settings} label="Settings" value="settings" />
            
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-1 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group mt-1"
            >
                <LogOut className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                <span>Log Out</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header Section */}
        <div className="bg-white border-b px-8 py-6 sticky top-0 z-10 shadow-sm/50 backdrop-blur-xl bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Poppins']">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'listings' && 'My Listings'}
                {activeTab === 'bookings' && 'My Bookings'}
                {activeTab === 'inquiries' && 'Inquiries'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'reviews' && 'Reviews Management'}
                {activeTab === 'messages_page' && 'Messages'}
                {activeTab === 'favorites' && 'Saved Ads'}
                {activeTab === 'settings' && 'Account Settings'}
                {activeTab === 'admintools' && 'Admin Tools'}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-2xl text-gray-500 font-['Poppins']">
                  Welcome back, <span className="text-[#F47524] font-medium">{user.full_name}</span>
                </p>
                <Badge variant="secondary" className="bg-orange-50 text-purple-700 hover:bg-orange-100 border-none px-3 py-1 self-center mt-1">
                    {user.role === 'admin' ? 'Administrator' : (myProfile?.role?.replace('_', ' ') || 'User')}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <Link to={createPageUrl('PostAd')}>
                 <Button className="bg-[#F47524] hover:bg-[#E06418] shadow-lg shadow-orange-500/20">
                    <Package className="mr-2 h-4 w-4" />
                    Post Ad
                 </Button>
               </Link>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsContent value="overview" className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { label: 'Active Listings', value: activeListings.length, icon: ShoppingBag, color: 'bg-green-100 text-green-600' },
                { label: 'Total Views', value: myListings.reduce((sum, l) => sum + (l.views || 0), 0), icon: Eye, color: 'bg-blue-100 text-blue-600' },
                { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'bg-purple-100 text-purple-600' },
                { label: 'Message Threads', value: 0, icon: Mail, color: 'bg-orange-100 text-orange-600' }, 
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-300 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this week
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity / Inquiries Preview */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-300 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 ">Recent Inquiries</h3>
                  <Link to={createPageUrl('Messages')} className="text-sm text-[#F47524] hover:underline">View all</Link>
                </div>
                {inquiries.length > 0 ? (
                  <div className="space-y-4">
                    {inquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg hover:border-orange-200 border border-transparent transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm font-bold text-[#F47524]">
                          {inquiry.requester_name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{inquiry.requester_name}</h4>
                            <span className="text-xs text-gray-500">
                              {inquiry.created_date && formatDistanceToNow(new Date(inquiry.created_date), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{inquiry.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <Badge variant="outline" className="text-xs">{inquiry.service_type}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No inquiries yet</p>
                  </div>
                )}
              </div>

              {/* Quick Actions / Tips */}
              <div className="bg-gradient-to-br from-[#F47524] to-[#ff9f61] rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-lg font-bold mb-2">Boost Your Reach</h3>
                <p className="text-white/90 text-sm mb-6">
                  Complete your profile and post high-quality listings to attract more customers.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#F47524]">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Verify Profile</p>
                      <p className="text-xs text-white/80">Get the blue tick</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#F47524]">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Get Reviews</p>
                      <p className="text-xs text-white/80">Build trust</p>
                    </div>
                  </div>
                </div>
                <Link to={createPageUrl('Settings')}>
                  <Button className="w-full mt-6 bg-white text-[#F47524] hover:bg-gray-100 border-none">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            {loadingListings ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
                ))}
              </div>
            ) : myListings.length > 0 ? (
              <div className="space-y-4">
                {/* Bulk Actions Bar */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedListings.length === myListings.length && myListings.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-[#616367]">
                      {selectedListings.length > 0 ? `${selectedListings.length} selected` : 'Select all'}
                    </span>
                  </div>

                  {selectedListings.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkUpdateMutation.mutate({ ids: selectedListings, data: { status: 'active' } })}
                        disabled={bulkUpdateMutation.isPending}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkUpdateMutation.mutate({ ids: selectedListings, data: { status: 'inactive' } })}
                        disabled={bulkUpdateMutation.isPending}
                      >
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Deactivate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkUpdateMutation.mutate({ ids: selectedListings, data: { status: 'sold' } })}
                        disabled={bulkUpdateMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Sold
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => setBulkActionOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <ListingItem key={listing.id} listing={listing} showCheckbox={true} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-4">Start selling by posting your first ad</p>
                <Link to={createPageUrl('PostAd')}>
                  <Button className="bg-[#F47524] hover:bg-[#E06418]">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Ad
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {myFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myFavorites.map((fav) => (
                  <Link key={fav.id} to={createPageUrl(`ListingDetail?id=${fav.listing_id}`)}>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100">
                        {fav.listing_image && (
                          <img src={fav.listing_image} alt={fav.listing_title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-[#111111] line-clamp-1">{fav.listing_title}</h3>
                        <p className="text-[#F47524] font-semibold mt-1">
                          {fav.listing_price ? `LKR ${fav.listing_price.toLocaleString()}` : 'Contact for price'}
                        </p>
                        {fav.notes && (
                          <p className="text-xs text-[#616367] mt-2 line-clamp-2">Note: {fav.notes}</p>
                        )}
                        <p className="text-xs text-[#616367] mt-2">
                          Saved {fav.created_date && formatDistanceToNow(new Date(fav.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-[#111111] mb-2">No saved ads yet</h3>
                <p className="text-[#616367]">Save listings you're interested in for quick access later</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {loadingBookings ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
                ))}
              </div>
            ) : myBookings.length > 0 ? (
              <div className="space-y-3">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.listing_title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.start_date} → {booking.end_date || 'TBD'}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Your booking requests will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            {inquiries.length > 0 ? (
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#111111]">{inquiry.requester_name}</h3>
                          <Badge 
                            variant="secondary"
                            className={`text-[10px] ${
                              inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                              inquiry.status === 'quoted' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#616367] mt-1">{inquiry.service_type}</p>
                        <p className="text-sm text-[#616367] mt-2 line-clamp-2">{inquiry.description}</p>
                        <div className="flex items-center gap-4 text-xs text-[#616367] mt-3">
                          {inquiry.location && (
                            <span>📍 {inquiry.location}</span>
                          )}
                          {inquiry.budget_range && (
                            <span>💰 {inquiry.budget_range}</span>
                          )}
                          <span>
                            {inquiry.created_date && formatDistanceToNow(new Date(inquiry.created_date), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Link to={createPageUrl('Messages')}>
                        <Button size="sm" className="bg-[#F47524] hover:bg-[#E06418]">
                          Reply
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-[#111111] mb-2">No inquiries yet</h3>
                <p className="text-[#616367]">Inquiries from potential customers will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {allUsers.length > 0 ? (
              <div className="space-y-3">
                {allUsers.map((u) => {
                  const userProfile = allProfiles.find(p => p.user_email === u.email);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={u.id} 
                      className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                          <User className="h-6 w-6 text-gray-400 group-hover:text-[#F47524] transition-colors" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#111111] group-hover:text-[#F47524] transition-colors">{u.full_name}</h3>
                            <Badge variant="secondary" className={`text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                              {u.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#616367]">{u.email}</p>
                          {userProfile && (
                            <p className="text-xs text-[#616367] mt-1 flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3 text-blue-500" />
                              {userProfile.role} • {userProfile.city || 'No location'}
                            </p>
                          )}
                        </div>
                        {userProfile && (
                          <Link to={createPageUrl(`ProfileDetail?id=${userProfile.id}`)}>
                            <Button size="sm" variant="outline" className="group-hover:bg-[#F47524] group-hover:text-white group-hover:border-[#F47524] transition-all">
                              View Profile
                            </Button>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-[#111111] mb-2">No users found</h3>
              </div>
              )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
              {pendingReviews.length > 0 ? (
              <div className="space-y-3">
                {pendingReviews.map((review) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    key={review.id} 
                    className="bg-white rounded-xl p-6 border border-orange-100 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 animate-pulse">
                            Pending Approval
                          </Badge>
                          <Badge variant="outline" className="border-gray-200">
                            {review.target_type}
                          </Badge>
                        </div>
                        <p className="font-bold text-[#111111] mb-1 text-lg">{review.target_name}</p>
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-3">
                           <p className="text-sm text-gray-700 italic">"{review.text}"</p>
                        </div>
                        <p className="text-xs text-[#616367] flex items-center gap-1">
                          <User className="h-3 w-3" />
                          By: <span className="font-medium">{review.reviewer_name}</span> ({review.reviewer_email})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveReviewMutation.mutate(review.id)}
                          disabled={approveReviewMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          disabled={deleteReviewMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-[#111111] mb-2">No pending reviews</h3>
                <p className="text-[#616367]">All reviews have been moderated</p>
              </div>
              )}
              </TabsContent>

          <TabsContent value="messages_page" className="h-full">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-[calc(100vh-200px)]">
               <Messages />
            </div>
          </TabsContent>

          <TabsContent value="favorites">
             <Favorites />
          </TabsContent>

          <TabsContent value="settings">
             <Settings />
          </TabsContent>

          <TabsContent value="admintools">
             <AdminTools />
          </TabsContent>

          </Tabs>
        </div>
      </div>



      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Listings</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedListings.length} listing(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => bulkDeleteMutation.mutate(selectedListings)}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}