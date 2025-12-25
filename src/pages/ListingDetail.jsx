import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, Eye, Clock, Share2, Heart, Flag,
  Phone, MessageCircle, BadgeCheck, Star, ChevronLeft, ChevronRight,
  Calendar, Tag, User, Shield, HeartOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow, format } from 'date-fns';
import ListingCard from '../components/listings/ListingCard';
import ReviewForm from '../components/reviews/ReviewForm';

export default function ListingDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: listingId } = useParams();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {}
    };
    checkAuth();
  }, []);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      try {
        return await base44.entities.Listing.get(listingId);
      } catch (error) {
        return null;
      }
    },
    enabled: !!listingId,
  });

  const { data: relatedListings = [] } = useQuery({
    queryKey: ['related-listings', listing?.category],
    queryFn: () => base44.entities.Listing.filter(
      { category: listing.category, status: 'active' },
      '-created_date',
      4
    ),
    enabled: !!listing?.category,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['listing-reviews', listingId],
    queryFn: () => base44.entities.Review.filter(
      { target_id: listingId, target_type: 'listing' },
      '-created_date',
      10
    ),
    enabled: !!listingId,
  });

  const { data: isFavorited, refetch: refetchFavorite } = useQuery({
    queryKey: ['is-favorited', listingId, user?.email],
    queryFn: async () => {
      const favs = await base44.entities.Favorite.filter({ user_email: user.email, listing_id: listingId });
      return favs.length > 0 ? favs[0] : null;
    },
    enabled: !!listingId && !!user,
  });

  const reportMutation = useMutation({
    mutationFn: (data) => base44.entities.Report.create(data),
    onSuccess: () => {
      setIsReportOpen(false);
      setReportReason('');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await base44.entities.Favorite.delete(isFavorited.id);
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          listing_id: listingId,
          listing_title: listing.title,
          listing_image: listing.images?.[0],
          listing_price: listing.price,
        });
      }
    },
    onSuccess: () => {
      refetchFavorite();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-gray-500 mb-4">This listing may have been removed</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const images = listing.images?.length > 0 
    ? listing.images 
    : ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'];

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `LKR ${price.toLocaleString()}`;
  };

  const priceTypeLabels = {
    fixed: '',
    negotiable: '(Negotiable)',
    hourly: '/hour',
    daily: '/day',
    monthly: '/month',
  };

  const conditionLabels = {
    new: 'Brand New',
    like_new: 'Like New',
    good: 'Good Condition',
    fair: 'Fair Condition',
    used: 'Used',
  };

  const handleWhatsApp = () => {
    const phone = listing.owner_whatsapp || listing.owner_phone;
    if (phone) {
      const message = encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title}`);
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleCall = () => {
    if (listing.owner_phone) {
      window.open(`tel:${listing.owner_phone}`, '_self');
    }
  };

  const handleReport = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    reportMutation.mutate({
      target_id: listingId,
      target_type: 'listing',
      reporter_email: user.email,
      reason: 'other',
      details: reportReason,
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative aspect-[4/3]">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {listing.featured && (
                  <Badge className="absolute top-4 left-4 bg-[#F47524]">Featured</Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        idx === currentImageIndex ? 'border-[#F47524]' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 font-['Poppins']">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.city || listing.location_text || 'Sri Lanka'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {listing.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {listing.created_date && formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={toggleFavoriteMutation.isPending}
                    className={isFavorited ? 'text-red-500 border-red-500' : ''}
                  >
                    {isFavorited ? (
                      <Heart className="h-4 w-4 fill-current" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#F47524]">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-lg text-gray-500">
                  {priceTypeLabels[listing.price_type]}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {listing.condition && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {conditionLabels[listing.condition]}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-gray-100">
                  <Tag className="h-3 w-3 mr-1" />
                  {listing.category?.replace('_', ' ')}
                </Badge>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Specifications */}
              {listing.specifications && Object.keys(listing.specifications).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-3">Specifications</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(listing.specifications).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">{key}</p>
                          <p className="font-medium text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Review Form */}
            <ReviewForm
              targetId={listingId}
              targetType="listing"
              targetName={listing.title}
            />

            {/* Reviews */}
            {reviews.filter(r => r.moderated).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Reviews ({reviews.filter(r => r.moderated).length})</h2>
                <div className="space-y-4">
                  {reviews.filter(r => r.moderated).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.reviewer_name}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-400" />
                  </div>
                  {listing.owner_verified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-blue-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{listing.owner_name || 'Seller'}</h3>
                  <p className="text-sm text-gray-500">
                    {listing.owner_verified ? 'Verified Seller' : 'Member'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button 
                  className="w-full bg-[#F47524] hover:bg-[#E06418]"
                  onClick={handleCall}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
                <Link to={createPageUrl(`Messages?to=${listing.created_by}`)}>
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </Link>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Safety Tips</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Meet in a safe, public location</li>
                <li>• Check the item before payment</li>
                <li>• Pay only after inspecting</li>
                <li>• Don't pay in advance</li>
              </ul>
            </div>

            {/* Report */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full text-gray-500">
                  <Flag className="mr-2 h-4 w-4" />
                  Report this listing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Describe the issue..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleReport} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={!reportReason.trim()}
                  >
                    Submit Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.filter(l => l.id !== listingId).length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Listings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedListings
                .filter(l => l.id !== listingId)
                .slice(0, 4)
                .map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fixed Bottom CTA */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button 
            className="flex-1 bg-[#F47524] hover:bg-[#E06418]"
            onClick={handleCall}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
        </div>
      </div>
    </div>
  );
}