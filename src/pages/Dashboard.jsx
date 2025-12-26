import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Settings, ShoppingBag, MessageSquare, Star, Calendar,
  Plus, Edit, Trash2, Eye, MoreVertical, BadgeCheck, Clock,
  ChevronRight, LogOut, Heart, Bell, RefreshCw, PauseCircle, PlayCircle,
  TrendingUp, CheckCircle2
} from 'lucide-react';
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

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }



  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');

  const stats = [
    { label: 'Active Listings', value: activeListings.length, icon: ShoppingBag, color: 'text-green-600' },
    { label: 'Total Views', value: myListings.reduce((sum, l) => sum + (l.views || 0), 0), icon: Eye, color: 'text-blue-600' },
    { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Saved Ads', value: myFavorites.length, icon: Heart, color: 'text-red-600' },
  ];

  const ListingItem = ({ listing, showCheckbox }) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
      {showCheckbox && (
        <Checkbox
          checked={selectedListings.includes(listing.id)}
          onCheckedChange={() => handleSelectListing(listing.id)}
        />
      )}
      <img
        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100'}
        alt={listing.title}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-[#111111] truncate">{listing.title}</h3>
          <Badge 
            variant="secondary" 
            className={`text-[10px] ${
              listing.status === 'active' ? 'bg-green-100 text-green-700' : 
              listing.status === 'sold' ? 'bg-gray-100 text-gray-700' : 
              listing.status === 'inactive' ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }`}
          >
            {listing.status}
          </Badge>
        </div>
        <p className="text-[#F47524] font-semibold mt-1">
          {listing.price ? `LKR ${listing.price.toLocaleString()}` : 'Contact for price'}
        </p>
        <div className="flex items-center gap-4 text-xs text-[#616367] mt-2">
          <span className="flex items-center gap-1" title="Total views">
            <Eye className="h-3 w-3" />
            {listing.views || 0}
          </span>
          <span className="flex items-center gap-1" title="Performance">
            <TrendingUp className="h-3 w-3" />
            {((listing.views || 0) / Math.max(1, Math.ceil((Date.now() - new Date(listing.created_date).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)}/day
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {listing.created_date && formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={createPageUrl(`ListingDetail?id=${listing.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Listing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={createPageUrl(`EditListing?id=${listing.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          {listing.status === 'active' ? (
            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'inactive' })}>
              <PauseCircle className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'active' })}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
            )}
            {listing.status !== 'sold' && (
            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'sold' })}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Sold
            </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => relistMutation.mutate(listing)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Duplicate Listing
            </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setDeleteId(listing.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#111111] to-[#2d2d2d] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              {myProfile?.verified && (
                <BadgeCheck className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-400 bg-white rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-['Poppins']">
                {user.role === 'admin' ? `Hello Admin ${user.full_name?.split(' ')[0]}!` : (user.full_name || 'Welcome!')}
              </h1>
              <p className="text-gray-400 mt-1">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={`${user.role === 'admin' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-white/10'} text-white border-0`}>
                  {user.role === 'admin' ? 'Administrator' : (myProfile?.role?.replace('_', ' ') || 'User')}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('PostAd')}>
                <Button className="bg-[#F47524] hover:bg-[#E06418]">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Ad
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-[#F47524]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="favorites">Saved Ads</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            {user?.role === 'admin' && (
              <>
                <TabsTrigger value="users">All Users</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews
                  {pendingReviews.length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white">{pendingReviews.length}</Badge>
                  )}
                </TabsTrigger>
              </>
            )}
          </TabsList>

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
                    <div key={u.id} className="bg-white rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[#111111]">{u.full_name}</h3>
                            <Badge variant="secondary" className={`text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                              {u.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#616367]">{u.email}</p>
                          {userProfile && (
                            <p className="text-xs text-[#616367] mt-1">
                              Profile: {userProfile.role} • {userProfile.city || 'No location'}
                            </p>
                          )}
                        </div>
                        {userProfile && (
                          <Link to={createPageUrl(`ProfileDetail?id=${userProfile.id}`)}>
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
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
                  <div key={review.id} className="bg-white rounded-xl p-5 border border-orange-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            Pending Approval
                          </Badge>
                          <Badge variant="outline">
                            {review.target_type}
                          </Badge>
                        </div>
                        <p className="font-medium text-[#111111] mb-1">{review.target_name}</p>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-[#616367] mb-2">{review.text}</p>
                        <p className="text-xs text-[#616367]">
                          By: {review.reviewer_name} ({review.reviewer_email})
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
                  </div>
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
              </Tabs>
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