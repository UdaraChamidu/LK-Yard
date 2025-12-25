import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Upload, X, Loader2, Save
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

const categories = {
  item: [{ value: 'tools_materials', label: 'Tools & Materials' }],
  service: [{ value: 'subcontractors', label: 'Subcontractor Services' }],
  machine: [{ value: 'machines', label: 'Machine Hire' }],
  job: [{ value: 'jobs', label: 'Jobs' }],
};

const subcategories = {
  tools_materials: ['Power Tools', 'Hand Tools', 'Building Materials', 'Plumbing', 'Electrical', 'Flooring', 'Hardware'],
  subcontractors: ['Mason', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Welder', 'Tiler'],
  machines: ['Excavator', 'JCB', 'Lorry', 'Crane', 'Concrete Mixer', 'Scaffolding', 'Generator'],
  jobs: ['Engineering', 'Construction', 'Skilled Trade', 'Management', 'Administration'],
};

const conditions = [
  { value: 'new', label: 'Brand New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'used', label: 'Used' },
];

const priceTypes = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'monthly', label: 'Per Month' },
];

const locations = [
  'Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 
  'Negombo', 'Ratnapura', 'Batticaloa', 'Matara'
];

export default function EditListing() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('EditListing'));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('EditListing'));
      }
    };
    checkAuth();
  }, []);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId && !!user,
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        type: listing.type,
        category: listing.category,
        subcategory: listing.subcategory || '',
        title: listing.title,
        description: listing.description,
        price: listing.price?.toString() || '',
        price_type: listing.price_type,
        condition: listing.condition || '',
        images: listing.images || [],
        city: listing.city || '',
        location_text: listing.location_text || '',
        owner_name: listing.owner_name || '',
        owner_phone: listing.owner_phone || '',
        owner_whatsapp: listing.owner_whatsapp || '',
      });
    }
  }, [listing]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Listing.update(listingId, data),
    onSuccess: () => {
      navigate(createPageUrl(`ListingDetail?id=${listingId}`));
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls].slice(0, 8),
    }));
    setIsUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
    });
  };

  if (!user || isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F47524]" />
      </div>
    );
  }

  if (listing && listing.created_by !== user.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#111111] mb-2">Unauthorized</h2>
          <p className="text-[#616367] mb-4">You don't have permission to edit this listing</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#616367] hover:text-[#111111]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#111111] font-['Poppins'] mb-8">
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl p-6">
            <Label className="text-base font-semibold">Photos</Label>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              {formData.images.length < 8 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#F47524]">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-[#616367]">Add</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Details */}
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                className="mt-2"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                className="mt-2"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.type]?.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category && subcategories[formData.category] && (
                <div>
                  <Label>Subcategory</Label>
                  <Select value={formData.subcategory} onValueChange={(val) => setFormData(prev => ({ ...prev, subcategory: val }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories[formData.category].map((sub) => (
                        <SelectItem key={sub} value={sub.toLowerCase()}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (LKR)</Label>
                <Input
                  className="mt-2"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div>
                <Label>Price Type</Label>
                <Select value={formData.price_type} onValueChange={(val) => setFormData(prev => ({ ...prev, price_type: val }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceTypes.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'item' && (
              <div>
                <Label>Condition</Label>
                <Select value={formData.condition} onValueChange={(val) => setFormData(prev => ({ ...prev, condition: val }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Location & Contact */}
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div>
              <Label>City *</Label>
              <Select value={formData.city} onValueChange={(val) => setFormData(prev => ({ ...prev, city: val }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Address (Optional)</Label>
              <Input
                className="mt-2"
                value={formData.location_text}
                onChange={(e) => setFormData(prev => ({ ...prev, location_text: e.target.value }))}
              />
            </div>

            <div>
              <Label>Contact Name</Label>
              <Input
                className="mt-2"
                value={formData.owner_name}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Phone Number *</Label>
              <Input
                className="mt-2"
                type="tel"
                value={formData.owner_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label>WhatsApp (Optional)</Label>
              <Input
                className="mt-2"
                type="tel"
                value={formData.owner_whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_whatsapp: e.target.value }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-[#F47524] hover:bg-[#E06418]"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}