import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Send, Loader2, CheckCircle2, User, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const serviceTypes = [
  'General Construction',
  'Renovation',
  'Plumbing',
  'Electrical',
  'Painting',
  'Flooring',
  'Roofing',
  'Masonry',
  'Carpentry',
  'HVAC',
  'Other',
];

const budgetRanges = [
  'Under LKR 50,000',
  'LKR 50,000 - 100,000',
  'LKR 100,000 - 250,000',
  'LKR 250,000 - 500,000',
  'LKR 500,000 - 1,000,000',
  'Over LKR 1,000,000',
  'Not sure yet',
];

const timelines = [
  'ASAP',
  'Within 1 week',
  'Within 1 month',
  'Within 3 months',
  'Flexible',
];

export default function RequestQuote() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('profile_id');

  const [user, setUser] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    description: '',
    location: '',
    budget_range: '',
    timeline: '',
    requester_name: '',
    requester_phone: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl(`RequestQuote?profile_id=${profileId}`));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          requester_name: userData.full_name || '',
        }));
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl(`RequestQuote?profile_id=${profileId}`));
      }
    };
    checkAuth();
  }, [profileId]);

  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ id: profileId });
      return profiles[0];
    },
    enabled: !!profileId,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.LeadRequest.create(data),
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate({
      profile_id: profileId,
      profile_name: profile?.display_name,
      profile_email: profile?.user_email,
      requester_email: user.email,
      requester_name: formData.requester_name,
      requester_phone: formData.requester_phone,
      service_type: formData.service_type,
      description: formData.description,
      location: formData.location,
      budget_range: formData.budget_range,
      timeline: formData.timeline,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F47524]" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
            Quote Request Sent!
          </h1>
          <p className="text-gray-600 mb-6">
            {profile?.display_name || 'The professional'} will be notified and will contact you soon.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="flex-1 bg-[#F47524] hover:bg-[#E06418]"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
          Request a Quote
        </h1>
        <p className="text-gray-500 mb-8">
          Fill in the details below and the professional will contact you
        </p>

        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-xl p-5 shadow-sm mb-6 flex items-center gap-4">
            <img
              src={profile.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=F47524&color=fff&size=56`}
              alt={profile.display_name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{profile.display_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {profile.designation || profile.role}
                </Badge>
                {profile.city && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.city}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <Label>Type of Service *</Label>
            <Select
              value={formData.service_type}
              onValueChange={(val) => setFormData(prev => ({ ...prev, service_type: val }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project Description *</Label>
            <Textarea
              className="mt-2"
              placeholder="Describe your project in detail..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Project Location *</Label>
            <Input
              className="mt-2"
              placeholder="e.g., Colombo 07"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Budget Range</Label>
              <Select
                value={formData.budget_range}
                onValueChange={(val) => setFormData(prev => ({ ...prev, budget_range: val }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(val) => setFormData(prev => ({ ...prev, timeline: val }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelines.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Your Name *</Label>
            <Input
              className="mt-2"
              value={formData.requester_name}
              onChange={(e) => setFormData(prev => ({ ...prev, requester_name: e.target.value }))}
            />
          </div>

          <div>
            <Label>Your Phone Number *</Label>
            <Input
              className="mt-2"
              type="tel"
              placeholder="+94 7X XXX XXXX"
              value={formData.requester_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, requester_phone: e.target.value }))}
            />
          </div>

          <Button
            type="submit"
            disabled={!formData.service_type || !formData.description || !formData.location || !formData.requester_phone || submitMutation.isPending}
            className="w-full bg-[#F47524] hover:bg-[#E06418] h-12"
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Quote Request
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}