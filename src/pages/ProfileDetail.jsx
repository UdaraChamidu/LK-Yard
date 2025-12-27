import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, MapPin, Star, BadgeCheck, Phone, MessageCircle,
  Calendar, Briefcase, FileText, Award, Globe, Clock, Users, ShoppingBag, Settings,
  Facebook, Linkedin, Instagram, ExternalLink, Mail, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewForm from '../components/reviews/ReviewForm';
import { motion } from 'framer-motion';

import { sampleProfessionals, sampleSubcontractors } from '@/data/sampleProfiles';
import ImageWithLoader from '@/components/ui/ImageWithLoader';
import { useAuth } from '@/context/AuthContext';

export default function ProfileDetail() {
  const navigate = useNavigate();
  const { id: profileId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      // 1. Check if it's the current admin user
      if (user && user.uid === profileId && user.role === 'admin') {
        return {
          id: user.uid,
          display_name: user.full_name || 'Admin User',
          role: 'admin',
          user_email: user.email,
          designation: 'System Administrator',
          verified: true,
          bio: 'Platform Administrator',
          skills: ['System Management'],
          city: 'Headquarters',
          rating: 5.0,
          rating_count: 1
        };
      }

      // 2. Check sample data
      const sampleProfile = [...sampleProfessionals, ...sampleSubcontractors].find(p => p.id === profileId);
      if (sampleProfile) return sampleProfile;

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
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <div className="bg-white rounded-2xl h-64 animate-pulse shadow-sm" />
          <div className="bg-white rounded-2xl h-96 animate-pulse shadow-sm" />
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
    admin: 'Administrator',
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#F47524] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium text-sm">Back to results</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="relative mx-auto md:mx-0 group">
              <div className="rounded-full p-1 bg-gradient-to-br from-orange-100 to-white border border-orange-100 shadow-inner">
                <img
                  src={profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=F47524&color=fff&size=120`}
                  alt={profile.display_name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {profile.verified && (
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100">
                  <BadgeCheck className="h-6 w-6 text-blue-500 fill-blue-50" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 font-['Poppins'] tracking-tight">
                    {profile.display_name}
                  </h1>
                  <Badge className="w-fit mx-auto md:mx-0 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100 px-3 py-1">
                    {profile.designation || roleLabels[profile.role]}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-gray-500">
                  {profile.city && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {profile.city}
                    </div>
                  )}
                  {profile.languages?.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      {profile.languages.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {profile.rating > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="flex bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(profile.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-lg text-gray-900">{profile.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({profile.rating_count} reviews)</span>
                  </div>
                </div>
              )}

              {/* Rates */}
              {(profile.hourly_rate || profile.daily_rate) && (
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  {profile.hourly_rate && (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 px-4 py-2.5 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Hourly Rate</p>
                      <p className="font-bold text-[#F47524] text-lg">LKR {profile.hourly_rate.toLocaleString()}</p>
                    </div>
                  )}
                  {profile.daily_rate && (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 px-4 py-2.5 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Daily Rate</p>
                      <p className="font-bold text-[#F47524] text-lg">LKR {profile.daily_rate.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-64">
              {user?.role === 'admin' && user?.uid === profile.id ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 text-center mb-2">Admin Controls</p>
                  <Button 
                    className="w-full bg-[#F47524] hover:bg-[#E06418] rounded-xl shadow-md shadow-orange-500/10 transition-transform active:scale-95"
                    onClick={() => navigate(createPageUrl('Settings'))}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 rounded-xl border-gray-200"
                    onClick={() => navigate(createPageUrl('Dashboard'))}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 rounded-xl shadow-md shadow-green-600/10 transition-transform hover:scale-105 active:scale-95"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button 
                    className="w-full bg-[#F47524] hover:bg-[#E06418] rounded-xl shadow-md shadow-orange-500/10 transition-transform hover:scale-105 active:scale-95"
                    onClick={handleCall}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                  <Link to={createPageUrl(`RequestQuote?profile_id=${profile.id}`)} className="block">
                    <Button variant="outline" className="w-full bg-white hover:bg-gray-50 rounded-xl border-gray-200">
                      Request Quote
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="mt-8" onValueChange={setActiveTab}>
          <div className="sticky top-16 z-10 bg-gray-50 pt-2 pb-4">
            <TabsList className="bg-white shadow-sm w-full justify-start h-12 p-1 rounded-xl border border-gray-100 overflow-x-auto">
              {['about', 'portfolio', 'listings', 'reviews'].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="rounded-lg data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 hover:bg-gray-50 hover:text-orange-600 transition-colors px-4 h-full capitalize"
                >
                  {tab === 'listings' ? `Ads (${userListings.length})` : 
                   tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="about" className="space-y-6 mt-2">
              {/* Bio */}
              {profile.bio && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#F47524] pl-3">About</h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Service Groups */}
              {profile.service_groups?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#F47524] pl-3">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.service_groups.map((group, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-orange-50 text-[#F47524] font-medium px-3 py-1.5 hover:bg-orange-100 transition-colors">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detailed Skills */}
                {profile.detailed_skills?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300 h-full">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-[#F47524]" />
                      Skills
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {profile.detailed_skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold text-xs">✓</span>
                          </div>
                          <span className="text-gray-700 font-medium">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {profile.certifications?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300 h-full">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#F47524]" />
                      Certifications
                    </h2>
                    <div className="space-y-3">
                      {profile.certifications.map((cert, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="mt-1 w-2 h-2 bg-[#F47524] rounded-full flex-shrink-0" />
                          <span className="text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service Areas */}
              {profile.service_areas?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#F47524]" />
                    Service Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.service_areas.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50 transition-colors px-3 py-1">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CV */}
              {profile.cv_url && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 hover:bg-orange-50/30 transition-all duration-300">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#F47524]" />
                    Resume / CV
                  </h2>
                  <a
                    href={profile.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#F47524] hover:text-[#E06418] font-medium bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View / Download CV
                  </a>
                </div>
              )}
            </TabsContent>

            <TabsContent value="portfolio" className="mt-2">
              {profile.portfolio?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {profile.portfolio.map((project, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      {project.images?.[0] && (
                        <div className="h-56 w-full overflow-hidden">
                          <ImageWithLoader
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{project.title}</h3>
                        <p className="text-gray-600 line-clamp-3">{project.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No portfolio items yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listings" className="mt-2">
              {userListings.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {userListings.map((listing) => (
                    <Link key={listing.id} to={createPageUrl(`ListingDetail?id=${listing.id}`)}>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {listing.images?.[0] && (
                            <ImageWithLoader 
                              src={listing.images[0]} 
                              alt={listing.title} 
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                            />
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                            {listing.category}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{listing.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <MapPin className="h-3 w-3" />
                            {listing.city || listing.location_text || 'Sri Lanka'}
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <p className="text-[#F47524] font-bold text-lg">
                              {listing.price ? `LKR ${listing.price.toLocaleString()}` : 'Contact for price'}
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(listing.created_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No active ads posted</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-2">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h2>
                  <ReviewForm
                    targetId={profileId}
                    targetType="profile"
                    targetName={profile.display_name}
                  />
                </div>

                {reviews.filter(r => r.moderated).length > 0 ? (
                  <div className="space-y-4">
                    {reviews.filter(r => r.moderated).map((review) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        key={review.id} 
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-white shadow-sm">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{review.reviewer_name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(review.created_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl italic">"{review.text}"</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No reviews yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>

      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 h-12 rounded-xl font-bold shadow-lg shadow-green-600/20"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp
          </Button>
          <Button 
            className="flex-1 bg-[#F47524] hover:bg-[#E06418] h-12 rounded-xl font-bold shadow-lg shadow-orange-500/20"
            onClick={handleCall}
          >
            <Phone className="mr-2 h-5 w-5" />
            Call
          </Button>
        </div>
      </div>
    </div>
  );
}