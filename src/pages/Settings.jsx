import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, User, Bell, Shield, Globe, LogOut, 
  Camera, Loader2, Check, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    language: 'en',
    email_notifications: true,
    push_notifications: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('Settings'));
          return;
        }
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          location: userData.location || '',
          language: userData.language || 'en',
          email_notifications: userData.email_notifications !== false,
          push_notifications: userData.push_notifications !== false,
        }));
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Settings'));
      }
    };
    checkAuth();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await base44.auth.updateMe({
      phone: formData.phone,
      location: formData.location,
      language: formData.language,
      email_notifications: formData.email_notifications,
      push_notifications: formData.push_notifications,
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

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
      <div className="bg-white border-b mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors bg-gray-50 hover:bg-orange-50 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 font-['Poppins']">Settings</h1>
          <div className="w-16"></div> 
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 font-['Poppins']">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <User className="h-4 w-4 text-[#F47524]" />
            </div>
            Profile Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                className="mt-2"
                value={formData.full_name}
                disabled
                placeholder="Your name"
              />
              <p className="text-xs text-gray-500 mt-1">Name cannot be changed here</p>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                className="mt-2"
                value={user.email}
                disabled
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                className="mt-2"
                type="tel"
                placeholder="+94 7X XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                className="mt-2"
                placeholder="Your city or district"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Globe className="h-4 w-4 text-[#F47524]" />
            </div>
            Language & Region
          </h2>
          
          <div>
            <Label>Preferred Language</Label>
            <Select
              value={formData.language}
              onValueChange={(val) => setFormData(prev => ({ ...prev, language: val }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="si">සිංහල (Sinhala)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-[#F47524]" />
            </div>
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <Switch
                checked={formData.email_notifications}
                onCheckedChange={(val) => setFormData(prev => ({ ...prev, email_notifications: val }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <Switch
                checked={formData.push_notifications}
                onCheckedChange={(val) => setFormData(prev => ({ ...prev, push_notifications: val }))}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-[#F47524]" />
            </div>
            Security
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label>Change Password</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="password"
                  placeholder="New password"
                  value={formData.newPassword || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <Button 
                  disabled={!formData.newPassword || formData.newPassword.length < 6}
                  onClick={async () => {
                    try {
                      await base44.auth.updatePassword(formData.newPassword);
                      setFormData(prev => ({ ...prev, newPassword: '' }));
                      alert('Password updated successfully');
                    } catch (error) {
                      alert('Error updating password: ' + error.message);
                    }
                  }}
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#F47524] hover:bg-[#E06418] h-12 rounded-xl text-lg font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : saved ? (
            <span className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Check className="h-5 w-5" />
              Saved Successfully
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out of your account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}