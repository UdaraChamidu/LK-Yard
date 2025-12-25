import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, Star, BadgeCheck, Phone, MessageCircle,
  Calendar, Briefcase, FileText, Award, Globe, Clock, Users, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewForm from '../components/reviews/ReviewForm';

export default function ProfileDetail() {
  const navigate = useNavigate();
  const { id: profileId } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      try {
        return await base44.entities.Profile.get(profileId);
      } catch (error) {
        return null;
      }
    },
    enabled: !!profileId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['profile-reviews', profileId],
    queryFn: () => base44.entities.Review.filter(
      { target_id: profileId, target_type: 'profile' },
      '-created_date',
      20
    ),
    enabled: !!profileId,
  });

  const { data: userListings = [] } = useQuery({
    queryKey: ['user-listings', profile?.user_email],
    queryFn: () => base44.entities.Listing.filter(
      { created_by: profile.user_email, status: 'active' },
      '-created_date',
      20
    ),
    enabled: !!profile?.user_email,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const phone = profile.whatsapp || profile.phone;
    if (phone) {
      const message = encodeURIComponent(`Hi, I found your profile on LKYard and would like to discuss a project.`);
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleCall = () => {
    if (profile.phone) {
      window.open(`tel:${profile.phone}`, '_self');
    }
  };

  const roleLabels = {
    subcontractor: 'Subcontractor',
    professional: 'Professional',
    machine_owner: 'Machine Owner',
    seller: 'Seller',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="relative mx-auto md:mx-0">
              <img
                src={profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=F47524&color=fff&size=120`}
                alt={profile.display_name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-gray-100"
              />
              {profile.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  <BadgeCheck className="h-7 w-7 text-blue-500" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl font-bold text-gray-900 font-['Poppins']">
                  {profile.display_name}
                </h1>
                <Badge className="w-fit mx-auto md:mx-0 bg-purple-100 text-purple-800">
                  {profile.designation || roleLabels[profile.role]}
                </Badge>
              </div>

              {profile.rating > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(profile.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({profile.rating_count} reviews)</span>
                </div>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city}
                  </span>
                )}
                {profile.languages?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {profile.languages.join(', ')}
                  </span>
                )}
              </div>

              {/* Rates */}
              {(profile.hourly_rate || profile.daily_rate) && (
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  {profile.hourly_rate && (
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-500">Hourly Rate</p>
                      <p className="font-bold text-[#F47524]">LKR {profile.hourly_rate.toLocaleString()}</p>
                    </div>
                  )}
                  {profile.daily_rate && (
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-500">Daily Rate</p>
                      <p className="font-bold text-[#F47524]">LKR {profile.daily_rate.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button 
                className="bg-[#F47524] hover:bg-[#E06418]"
                onClick={handleCall}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
              <Link to={createPageUrl(`RequestQuote?profile_id=${profile.id}`)}>
                <Button variant="outline" className="w-full">
                  Request Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="mt-6">
          <TabsList className="bg-white shadow-sm w-full justify-start">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="listings">Ads ({userListings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6 mt-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Service Groups (Layer 2) */}
            {profile.service_groups?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-[#111111] mb-3">Services Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.service_groups.map((group, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-orange-50 text-[#F47524] font-medium">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Skills (Layer 3) */}
            {profile.detailed_skills?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-[#111111] mb-3">Specializations & Technical Skills</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {profile.detailed_skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[#616367] text-sm">
                      <span className="text-green-600">✓</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#F47524]" />
                  Certifications
                </h2>
                <div className="space-y-2">
                  {profile.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-[#F47524] rounded-full" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {profile.service_areas?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#F47524]" />
                  Service Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.service_areas.map((area, idx) => (
                    <Badge key={idx} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CV */}
            {profile.cv_url && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#F47524]" />
                  Resume / CV
                </h2>
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F47524] hover:underline"
                >
                  Download CV
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            {profile.portfolio?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {profile.portfolio.map((project, idx) => (
                  <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm">
                    {project.images?.[0] && (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No portfolio items yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            {userListings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {userListings.map((listing) => (
                  <Link key={listing.id} to={createPageUrl(`ListingDetail?id=${listing.id}`)}>
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100">
                        {listing.images?.[0] && (
                          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-[#111111] line-clamp-1">{listing.title}</h3>
                        <p className="text-[#F47524] font-semibold mt-1">
                          {listing.price ? `LKR ${listing.price.toLocaleString()}` : 'Contact for price'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#616367] mt-2">
                          <MapPin className="h-3 w-3" />
                          {listing.city || listing.location_text || 'Sri Lanka'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active ads posted</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <ReviewForm
                targetId={profileId}
                targetType="profile"
                targetName={profile.display_name}
              />

              {reviews.filter(r => r.moderated).length > 0 ? (
                <div className="space-y-4">
                  {reviews.filter(r => r.moderated).map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewer_name || 'Anonymous'}</p>
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
                        </div>
                      </div>
                      <p className="text-gray-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Fixed CTA */}
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