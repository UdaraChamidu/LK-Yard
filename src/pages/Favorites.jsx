import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

export default function Favorites() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('Favorites'));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Favorites'));
      }
    };
    checkAuth();
  }, []);

  const { data: myFavorites = [], isLoading } = useQuery({
    queryKey: ['my-favorites-page', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="lg:hidden hover:bg-orange-50">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-['Poppins']">
                <Heart className="h-5 w-5 text-[#F47524] fill-[#F47524]" />
                Saved Ads
              </h1>
              <p className="text-sm text-gray-500">
                {myFavorites.length} listing{myFavorites.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : myFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myFavorites.map((fav) => (
              <Link key={fav.id} to={createPageUrl(`ListingDetail?id=${fav.listing_id}`)} className="group">
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {fav.listing_image ? (
                        <img 
                          src={fav.listing_image} 
                          alt={fav.listing_title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <ShoppingBag className="h-10 w-10" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
                      <Heart className="h-4 w-4 text-[#F47524] fill-[#F47524]" />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-[#111111] line-clamp-2 mb-2 group-hover:text-[#F47524] transition-colors">
                      {fav.listing_title}
                    </h3>
                    <p className="text-[#F47524] font-bold text-lg mb-auto">
                      {fav.listing_price ? `LKR ${fav.listing_price.toLocaleString()}` : 'Price on Request'}
                    </p>
                    
                    {fav.notes && (
                      <div className="mt-3 bg-yellow-50 p-2 rounded text-xs text-yellow-700 italic border border-yellow-100">
                        "{fav.notes}"
                      </div>
                    )}
                    
                    <Separator className="my-3" />
                    <p className="text-xs text-[#616367] flex items-center gap-1">
                       Saved {fav.created_date && formatDistanceToNow(new Date(fav.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-[#F47524]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">No saved ads yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Tap the heart icon on any listing to save it here for later access.
            </p>
            <Link to={createPageUrl('BuySell')}>
              <Button className="bg-[#111111] hover:bg-[#2d2d2d]">
                Browse Listings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
