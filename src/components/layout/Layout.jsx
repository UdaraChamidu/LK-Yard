import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Menu, X, Search, Plus, User, LogOut, ChevronDown, 
  Home, ShoppingBag, Users, Truck, Briefcase, Building2,
  MessageSquare, Settings, Heart, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        console.log('Not authenticated');
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Buy & Sell', page: 'BuySell', icon: ShoppingBag },
    { name: 'Subcontractors', page: 'Subcontractors', icon: Users },
    { name: 'Hire Machines', page: 'HireMachines', icon: Truck },
    { name: 'Professionals', page: 'Professionals', icon: Briefcase },
    { name: 'Jobs', page: 'Jobs', icon: Building2 },
  ];

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'si', label: 'සිං' },
    { code: 'ta', label: 'தமி' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: #F47524;
          --primary-hover: #E06418;
          --secondary: #616367;
          --accent: #111111;
        }
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69480f5d3b7800a9469b8931/e59d0284e_image.png"
                alt="LKYard"
                className="w-10 h-10 object-contain"
              />
              <span className="hidden sm:block text-xl font-semibold text-[#111111] font-['Poppins']">
                LKYard
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`text-sm font-medium transition-colors hover:text-[#F47524] ${
                    currentPageName === item.page ? 'text-[#F47524]' : 'text-[#616367]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs font-medium">
                    {languages.find(l => l.code === language)?.label}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={language === lang.code ? 'bg-orange-50' : ''}
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search - Desktop */}
              <Link to={createPageUrl('Search')} className="hidden md:flex">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5 text-[#616367]" />
                </Button>
              </Link>

              {/* Post Ad Button */}
              <Link to={createPageUrl('PostAd')} className="hidden sm:flex">
                <Button className="bg-[#F47524] hover:bg-[#E06418] text-white font-medium">
                  <Plus className="mr-1 h-4 w-4" />
                  Post Ad
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#F47524] rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="font-medium text-sm">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Dashboard'))}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Messages'))}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Favorites'))}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('Settings'))}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="border-[#F47524] text-[#F47524] hover:bg-[#F47524] hover:text-white"
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPageName === item.page
                      ? 'bg-orange-50 text-[#F47524]'
                      : 'text-[#616367] hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <Link
                to={createPageUrl('PostAd')}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-[#F47524] text-white rounded-lg"
              >
                <Plus className="h-5 w-5" />
                Post Your Ad
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#111111] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69480f5d3b7800a9469b8931/e59d0284e_image.png"
                  alt="LKYard"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-lg font-semibold font-['Poppins']">LKYard</span>
              </div>
              <p className="text-gray-400 text-sm">
                Sri Lanka's trusted construction marketplace for materials, services, and professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-['Poppins']">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl('BuySell')} className="hover:text-white">Tools & Materials</Link></li>
                <li><Link to={createPageUrl('Subcontractors')} className="hover:text-white">Subcontractors</Link></li>
                <li><Link to={createPageUrl('HireMachines')} className="hover:text-white">Machine Hire</Link></li>
                <li><Link to={createPageUrl('Professionals')} className="hover:text-white">Professionals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-['Poppins']">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Safety Tips</Link></li>
                <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-['Poppins']">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 LKYard.lk. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-2">
          <Link to={createPageUrl('Home')} className="flex flex-col items-center py-1 px-3">
            <Home className={`h-5 w-5 ${currentPageName === 'Home' ? 'text-[#F47524]' : 'text-gray-500'}`} />
            <span className="text-[10px] mt-1">Home</span>
          </Link>
          <Link to={createPageUrl('Search')} className="flex flex-col items-center py-1 px-3">
            <Search className={`h-5 w-5 ${currentPageName === 'Search' ? 'text-[#F47524]' : 'text-gray-500'}`} />
            <span className="text-[10px] mt-1">Search</span>
          </Link>
          <Link to={createPageUrl('PostAd')} className="flex flex-col items-center py-1 px-3 -mt-4">
            <div className="w-12 h-12 bg-[#F47524] rounded-full flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </Link>
          <Link to={createPageUrl('Messages')} className="flex flex-col items-center py-1 px-3">
            <MessageSquare className={`h-5 w-5 ${currentPageName === 'Messages' ? 'text-[#F47524]' : 'text-gray-500'}`} />
            <span className="text-[10px] mt-1">Messages</span>
          </Link>
          <Link to={createPageUrl('Dashboard')} className="flex flex-col items-center py-1 px-3">
            <User className={`h-5 w-5 ${currentPageName === 'Dashboard' ? 'text-[#F47524]' : 'text-gray-500'}`} />
            <span className="text-[10px] mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}