import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Eye, Star, BadgeCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function ListingCard({ listing, variant = 'grid' }) {
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

  if (variant === 'list') {
    return (
      <Link
        to={createPageUrl(`ListingDetail?id=${listing.id}`)}
        className="flex gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
      >
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            src={listing.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'}
            alt={listing.title}
            className="w-full h-full object-cover rounded-lg"
          />
          {listing.featured && (
            <Badge className="absolute top-2 left-2 bg-[#F47524] text-white text-[10px]">
              Featured
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
          <p className="text-lg font-bold text-[#F47524] mt-1">
            {formatPrice(listing.price)}
            <span className="text-sm font-normal text-gray-500 ml-1">
              {priceTypeLabels[listing.price_type]}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{listing.city || listing.location_text || 'Sri Lanka'}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {listing.created_date && formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={createPageUrl(`ListingDetail?id=${listing.id}`)}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {listing.featured && (
          <Badge className="absolute top-3 left-3 bg-[#F47524] text-white">
            Featured
          </Badge>
        )}
        {listing.condition && listing.type === 'item' && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-white/90 text-gray-700 text-[10px]"
          >
            {listing.condition.replace('_', ' ')}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px] group-hover:text-[#F47524] transition-colors">
          {listing.title}
        </h3>
        <p className="text-lg font-bold text-[#F47524] mt-2">
          {formatPrice(listing.price)}
          <span className="text-sm font-normal text-gray-500 ml-1">
            {priceTypeLabels[listing.price_type]}
          </span>
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">{listing.city || listing.location_text || 'Sri Lanka'}</span>
          </div>
          {listing.owner_verified && (
            <BadgeCheck className="h-4 w-4 text-blue-500" />
          )}
        </div>
      </div>
    </Link>
  );
}