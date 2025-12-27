import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Menu, X, Search, Plus, User, LogOut, ChevronDown, 
  Home, ShoppingBag, Users, Truck, Briefcase, Building2,
  MessageSquare, Settings, Heart, Bell, Database
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
import { ModeToggle } from '@/components/mode-toggle';

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
    <div className="min-h-screen bg-gray-100 font-sans text-foreground">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69480f5d3b7800a9469b8931/e59d0284e_image.png"
                alt="LKYard"
                className="w-10 h-10 object-contain"
              />
              <span className="hidden sm:block text-xl font-semibold text-accent font-heading">
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
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-glow hover:shadow-lg transition-all">
                  <Plus className="mr-1 h-4 w-4" />
                  Post Ad
                </Button>
              </Link>
              
              <ModeToggle />

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
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('AdminTools'))}>
                        <Database className="mr-2 h-4 w-4" />
                        Admin Tools
                      </DropdownMenuItem>
                    )}
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
      <footer className={`bg-[#111111] text-white mt-auto transition-all duration-300 ${
        ['Home', 'BuySell', 'Subcontractors', 'HireMachines', 'Professionals', 'Jobs'].includes(currentPageName) 
          ? 'lg:pl-64' 
          : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69480f5d3b7800a9469b8931/e59d0284e_image.png"
                  alt="LKYard"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-base font-semibold font-['Poppins'] text-xl">LKYard</span>
              </div>
              <p className="text-gray-400 text-s max-w-sm leading-relaxed">
                Sri Lanka's trusted construction marketplace. Connect with professionals, find jobs, hire machines, and buy materials.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 font-heading text-lg text-gray-200">Platform</h4>
              <ul className="space-y-1.5 text-s text-gray-400">
                <li><Link to={createPageUrl('BuySell')} className="hover:text-white transition-colors">Tools & Materials</Link></li>
                <li><Link to={createPageUrl('Subcontractors')} className="hover:text-white transition-colors">Subcontractors</Link></li>
                <li><Link to={createPageUrl('HireMachines')} className="hover:text-white transition-colors">Machine Hire</Link></li>
                <li><Link to={createPageUrl('Professionals')} className="hover:text-white transition-colors">Professionals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 font-heading text-lg text-gray-200">Support</h4>
              <ul className="space-y-1.5 text-s text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Safety Tips</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 font-heading text-lg text-gray-200">Developers</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex flex-col">
                  <span className="text-gray-300 font-medium">Udara Chamidu</span>
                  <a href="mailto:udara@example.com" className="hover:text-white transition-colors">chamiduudara321@gmail.com</a>
                  <span className="text-[10px] text-gray-500">+94 76 172 0686</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-gray-300 font-medium">Charaka Viduranga</span>
                  <a href="mailto:charaka@example.com" className="hover:text-white transition-colors">charaka@viduranga1@gmail.com</a>
                  <span className="text-[10px] text-gray-500">+94 71 987 6543</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-s text-gray-500">
            <p>© 2024 LKYard.lk. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
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