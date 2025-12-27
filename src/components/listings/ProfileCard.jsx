import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Star, BadgeCheck, Phone, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProfileCard({ profile, showActions = true }) {
  const getRoleBadgeColor = (role) => {
    const colors = {
      subcontractor: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      machine_owner: 'bg-green-100 text-green-800',
      seller: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatRate = (rate, type) => {
    if (!rate) return null;
    return `LKR ${rate.toLocaleString()}/${type}`;
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary hover:border-transparent transition-all duration-300 border border-gray-400">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=F47524&color=fff&size=80`}
              alt={profile.display_name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
            />
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">{profile.display_name}</h3>
              <Badge className={`text-[10px] ${getRoleBadgeColor(profile.role)}`}>
                {profile.designation || profile.role?.replace('_', ' ')}
              </Badge>
            </div>
            {profile.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm">{profile.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({profile.rating_count})</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{profile.city || profile.location_text || 'Sri Lanka'}</span>
            </div>
          </div>
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {profile.skills.slice(0, 4).map((skill, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="bg-gray-100 text-gray-600 text-[10px] font-normal"
              >
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 4 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">
                +{profile.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {(profile.hourly_rate || profile.daily_rate) && (
          <div className="flex items-center gap-3 mt-4 text-sm">
            {profile.hourly_rate && (
              <span className="text-[#F47524] font-semibold">
                {formatRate(profile.hourly_rate, 'hr')}
              </span>
            )}
            {profile.daily_rate && (
              <span className="text-[#F47524] font-semibold">
                {formatRate(profile.daily_rate, 'day')}
              </span>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <Link to={createPageUrl(`Profile/${profile.id}`)} className="flex-1">
              <Button variant="outline" className="w-full text-sm border-[#F47524] text-[#F47524] hover:text-[#F47524] hover:bg-orange-50 bg-white">
                View Profile
              </Button>
            </Link>
            <Link to={createPageUrl(`RequestQuote?profile_id=${profile.id}`)}>
              <Button className="bg-[#F47524] hover:bg-[#E06418] text-sm px-4">
                Request Quote
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}