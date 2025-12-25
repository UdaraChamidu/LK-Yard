import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createPageUrl } from '@/utils';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // We'll log them in after registration (mock)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and privacy policy');
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would be a register call.
      // For mock, we'll just log them in with the new credentials.
      await login(formData.email, formData.password);
      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
           <div className="text-center">
             <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69480f5d3b7800a9469b8931/e59d0284e_image.png"
                alt="LKYard"
                className="w-12 h-12 object-contain mx-auto mb-4"
              />
            <h2 className="text-3xl font-bold font-['Poppins'] text-gray-900">Create an account</h2>
            <p className="mt-2 text-gray-600">Start your journey with LKYard today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked })}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                I agree to the <Link to="#" className="text-[#F47524] hover:underline">Terms</Link> and <Link to="#" className="text-[#F47524] hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <Button 
              type="submit" 
              className="w-full bg-[#F47524] hover:bg-[#E06418]"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to={createPageUrl('Login')} className="font-medium text-[#F47524] hover:text-[#E06418]">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Banner */}
      <div className="hidden lg:block relative bg-[#111111]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590644365607-1c5a08dc9606?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-bold font-['Poppins'] mb-6">Find the Best Professionals</h1>
            <p className="text-lg text-gray-300">
              Connect with skilled subcontractors, rent heavy machinery, and find the best deals on construction materials.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-1">5000+</h3>
                <p className="text-sm text-gray-300">Active Listings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="font-bold text-xl mb-1">1000+</h3>
                <p className="text-sm text-gray-300">Verified Pros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
