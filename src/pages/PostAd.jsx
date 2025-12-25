import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Upload, X, MapPin, Camera,
  Check, Loader2, ShoppingBag, Users, Truck, Briefcase
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

const listingTypes = [
  { value: 'item', label: 'Sell an Item', icon: ShoppingBag, description: 'Tools, materials, equipment' },
  { value: 'service', label: 'Offer a Service', icon: Users, description: 'Subcontractor services' },
  { value: 'machine', label: 'Rent a Machine', icon: Truck, description: 'Machinery for hire' },
  { value: 'job', label: 'Post a Job', icon: Briefcase, description: 'Job openings' },
];

const categories = {
  item: [
    { value: 'tools_materials', label: 'Tools & Materials' },
  ],
  service: [
    { value: 'subcontractors', label: 'Subcontractor Services' },
  ],
  machine: [
    { value: 'machines', label: 'Machine Hire' },
  ],
  job: [
    { value: 'jobs', label: 'Jobs' },
  ],
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

export default function PostAd() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    subcategory: '',
    title: '',
    description: '',
    price: '',
    price_type: 'fixed',
    condition: '',
    images: [],
    city: '',
    location_text: '',
    owner_name: '',
    owner_phone: '',
    owner_whatsapp: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('PostAd'));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          owner_name: userData.full_name || '',
        }));
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('PostAd'));
      }
    };
    checkAuth();
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Listing.create(data),
    onSuccess: (data) => {
      navigate(createPageUrl(`ListingDetail?id=${data.id}`));
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

  const handleSubmit = () => {
    createMutation.mutate({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      status: 'active',
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.type;
      case 2:
        return formData.title && formData.description && formData.category;
      case 3:
        return formData.images.length > 0;
      case 4:
        return formData.city && formData.owner_phone;
      default:
        return true;
    }
  };

  const totalSteps = 5;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F47524]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="flex items-center gap-2 text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{step > 1 ? 'Back' : 'Cancel'}</span>
            </button>
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="mt-4 h-1" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
              What would you like to post?
            </h1>
            <p className="text-gray-500 mb-8">Choose the type of listing</p>
            
            <div className="grid gap-4">
              {listingTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                    formData.type === type.value
                      ? 'border-[#F47524] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.type === type.value ? 'bg-[#F47524]' : 'bg-gray-100'
                  }`}>
                    <type.icon className={`h-6 w-6 ${
                      formData.type === type.value ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                  {formData.type === type.value && (
                    <Check className="ml-auto h-5 w-5 text-[#F47524]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
              Add Details
            </h1>
            <p className="text-gray-500 mb-8">Tell us about your listing</p>

            <div className="space-y-6">
              <div>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.type]?.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.category && subcategories[formData.category] && (
                <div>
                  <Label>Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, subcategory: val }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories[formData.category].map((sub) => (
                        <SelectItem key={sub} value={sub.toLowerCase()}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Title *</Label>
                <Input
                  className="mt-2"
                  placeholder="e.g., Makita Cordless Drill - Like New"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  className="mt-2"
                  placeholder="Describe your item, service, or job in detail..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (LKR)</Label>
                  <Input
                    className="mt-2"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Price Type</Label>
                  <Select
                    value={formData.price_type}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, price_type: val }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceTypes.map((pt) => (
                        <SelectItem key={pt.value} value={pt.value}>
                          {pt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'item' && (
                <div>
                  <Label>Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, condition: val }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
              Add Photos
            </h1>
            <p className="text-gray-500 mb-8">Add up to 8 photos (minimum 1 required)</p>

            <div className="grid grid-cols-3 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 text-xs bg-[#F47524] text-white px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              
              {formData.images.length < 8 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#F47524] transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Photo</span>
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
        )}

        {/* Step 4: Location & Contact */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
              Location & Contact
            </h1>
            <p className="text-gray-500 mb-8">Where is this located and how to reach you</p>

            <div className="space-y-6">
              <div>
                <Label>City / District *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Address (Optional)</Label>
                <Input
                  className="mt-2"
                  placeholder="Street address or area"
                  value={formData.location_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_text: e.target.value }))}
                />
              </div>

              <div>
                <Label>Your Name</Label>
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
                  placeholder="+94 7X XXX XXXX"
                  value={formData.owner_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value }))}
                />
              </div>

              <div>
                <Label>WhatsApp Number (Optional)</Label>
                <Input
                  className="mt-2"
                  type="tel"
                  placeholder="Same as phone if not specified"
                  value={formData.owner_whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_whatsapp: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
              Review & Publish
            </h1>
            <p className="text-gray-500 mb-8">Make sure everything looks good</p>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              {formData.images.length > 0 && (
                <img
                  src={formData.images[0]}
                  alt=""
                  className="w-full aspect-video object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-semibold text-gray-900">{formData.title}</h2>
              <p className="text-2xl font-bold text-[#F47524] mt-2">
                {formData.price ? `LKR ${parseFloat(formData.price).toLocaleString()}` : 'Contact for price'}
              </p>
              <div className="flex items-center gap-2 text-gray-500 mt-3">
                <MapPin className="h-4 w-4" />
                <span>{formData.city}</span>
              </div>
              <p className="text-gray-600 mt-4 line-clamp-3">{formData.description}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-[#F47524] hover:bg-[#E06418] h-12"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 bg-[#F47524] hover:bg-[#E06418] h-12"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Publish Listing
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}