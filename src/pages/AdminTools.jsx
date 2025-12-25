import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MOCK_PROFILES = [
  // Professionals
  {
    display_name: 'Amara Constructions',
    role: 'professional',
    designation: 'civil_engineer',
    city: 'Colombo',
    daily_rate: 15000,
    rating: 4.8,
    rating_count: 24,
    verified: true,
    service_groups: ['Structural Design', 'Construction Management'],
    about: 'Leading civil engineering firm in Colombo.',
    skills: ['AutoCAD', 'Revit', 'Project Management'],
    portfolio: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800']
  },
  {
    display_name: 'Kandy Architects',
    role: 'professional',
    designation: 'architect',
    city: 'Kandy',
    daily_rate: 20000,
    rating: 4.9,
    rating_count: 15,
    verified: true,
    service_groups: ['Architectural Design', 'Interior Design'],
    about: 'Award winning architectural designs.',
    skills: ['SketchUp', 'Lumion', 'V-Ray'],
    portfolio: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800']
  },
  {
    display_name: 'BuildRight QS Services',
    role: 'professional',
    designation: 'quantity_surveyor',
    city: 'Gampaha',
    daily_rate: 12000,
    rating: 4.7,
    rating_count: 32,
    verified: true,
    service_groups: ['Cost Estimation', 'BOQ Preparation'],
    about: 'Precise quantity surveying and cost management.',
    skills: ['QS Pro', 'Excel', 'Contract Administration'],
    portfolio: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800']
  },
  // Subcontractors
  {
      display_name: 'Rohan Masonry',
      role: 'subcontractor',
      main_category: 'masonry_blockwork',
      city: 'Galle',
      daily_rate: 4500,
      rating: 4.5,
      rating_count: 42,
      verified: true,
      service_groups: ['Brick Masonry', 'Plastering'],
      about: 'Expert mason with 15 years experience.',
      skills: ['Brick laying', 'Plastering', 'Tiling'],
      portfolio: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800']
  },
  {
      display_name: 'Silva Plumbing',
      role: 'subcontractor',
      main_category: 'plumbing_electrical',
      city: 'Colombo',
      daily_rate: 5000,
      rating: 4.6,
      rating_count: 28,
      verified: true,
      service_groups: ['Water Supply Installation', 'Sanitary Fitting', 'Drainage Works'],
      about: 'Comprehensive plumbing solutions for home and industry.',
      skills: ['Pipe fitting', 'Leak detection'],
      portfolio: ['https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=800']
  },
  {
      display_name: 'Perera Electricals',
      role: 'subcontractor',
      main_category: 'plumbing_electrical',
      city: 'Kurunegala',
      daily_rate: 5500,
      rating: 4.8,
      rating_count: 55,
      verified: true,
      service_groups: ['Electrical Wiring', 'Panel Installation', 'Lighting Work'],
      about: 'Certified industrial and domestic electrician.',
      skills: ['Wiring', 'Panel Boards', 'Troubleshooting'],
      portfolio: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800']
  },
  {
      display_name: 'Lanka Woodworks',
      role: 'subcontractor',
      main_category: 'doors_windows_metal',
      city: 'Moratuwa',
      daily_rate: 6000,
      rating: 4.7,
      rating_count: 20,
      verified: false,
      service_groups: ['Door Installation', 'Window Installation'],
      about: 'Fine carpentry and joinery work.',
      skills: ['Carpentry', 'Wood carving'],
      portfolio: ['https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=800']
  }
];

const MOCK_LISTINGS = [
    // Tools (Items)
    {
        title: 'Hilti TE 70-ATC/AVR Combi Hammer',
        price: 150000,
        type: 'item',
        category: 'tools_materials',
        subcategory: 'power tools',
        location: 'Colombo',
        city: 'Colombo',
        description: 'Heavy duty combi hammer for drilling and chiseling. Barely used.',
        status: 'active',
        condition: 'like_new',
        views: 120,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
    },
    {
        title: 'Makita Cordless Drill Set',
        price: 45000,
        type: 'item',
        category: 'tools_materials',
        subcategory: 'power tools',
        location: 'Gampaha',
        city: 'Gampaha',
        description: 'Complete set with 2 batteries and charger.',
        status: 'active',
        condition: 'good',
        views: 85,
        images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800']
    },
    {
        title: 'Scaffolding Pipes & Clamps',
        price: 500,
        price_type: 'fixed', 
        type: 'item',
        category: 'tools_materials',
        subcategory: 'building materials',
        location: 'Kandy',
        city: 'Kandy',
        description: 'Galvanized scaffolding pipes per foot.',
        status: 'active',
        condition: 'used',
        views: 45,
        images: ['https://images.unsplash.com/photo-1588012886079-16019865a264?w=800']
    },
    // Machines (Rental)
    {
        title: 'Excavator for Rent - CAT 320',
        price: 25000,
        price_type: 'daily',
        type: 'machine',
        category: 'machines',
        subcategory: 'excavator',
        location: 'Kandy',
        city: 'Kandy',
        description: 'Daily rental rate. Operator included. Fuel excluded.',
        status: 'active',
        condition: 'good',
        views: 210,
        images: ['https://images.unsplash.com/photo-1567586326266-96b61df3f6f1?w=800']
    },
    {
        title: 'JCB 3DX Backhoe Loader',
        price: 18000,
        price_type: 'daily',
        type: 'machine',
        category: 'machines',
        subcategory: 'jcb',
        location: 'Kurunegala',
        city: 'Kurunegala',
        description: 'Available for immediate hire. Good condition.',
        status: 'active',
        condition: 'good',
        views: 156,
        images: ['https://images.unsplash.com/photo-1547631899-7bdd59d43616?w=800']
    },
    {
        title: 'Concrete Mixer Truck',
        price: 35000,
        price_type: 'daily',
        type: 'machine',
        category: 'machines',
        subcategory: 'concrete_mixer',
        location: 'Colombo',
        city: 'Colombo',
        description: 'Ready mix transport.',
        status: 'active',
        condition: 'good',
        views: 92,
        images: ['https://images.unsplash.com/photo-1587050007604-fa73f309cbba?w=800']
    },
    // Jobs
    {
        title: 'Site Supervisor Needed',
        price: 85000,
        price_type: 'monthly',
        type: 'job',
        category: 'jobs',
        subcategory: 'construction',
        location: 'Colombo',
        city: 'Colombo',
        description: 'Experienced site supervisor needed for a high-rise project in Colombo 3. Minimum 5 years experience.',
        status: 'active',
        views: 340,
        images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800']
    },
    {
        title: 'Masons Wanted Urgently',
        price: 4000,
        price_type: 'daily',
        type: 'job',
        category: 'jobs',
        subcategory: 'skilled_trade',
        location: 'Galle',
        city: 'Galle',
        description: 'Skilled masons needed for a villa project. Accommodation provided.',
        status: 'active',
        views: 120,
        images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800']
    },
    {
        title: 'Junior Civil Engineer',
        price: 60000,
        price_type: 'monthly',
        type: 'job',
        category: 'jobs',
        subcategory: 'engineering',
        location: 'Kandy',
        city: 'Kandy',
        description: 'Fresh graduates welcome. Site management and QA/QC duties.',
        status: 'active',
        views: 180,
        images: ['https://images.unsplash.com/photo-1531834685032-c34bf0d84c7c?w=800']
    }
];

export default function AdminTools() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const { user } = useAuth();

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const seedProfiles = async () => {
    setLoading(true);
    addLog('Starting Profile Seeding...');
    try {
      for (const profile of MOCK_PROFILES) {
        await base44.entities.Profile.create({
            ...profile,
            user_email: user?.email || 'admin@lkyard.lk', // Assign to current user for visibility
            created_at: new Date().toISOString()
        });
        addLog(`Created profile: ${profile.display_name}`, 'success');
      }
      addLog('Profile Seeding Completed!', 'success');
    } catch (error) {
      addLog(`Error seeding profiles: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const seedListings = async () => {
      setLoading(true);
      addLog('Starting Listing Seeding...');
      try {
        for (const listing of MOCK_LISTINGS) {
          await base44.entities.Listing.create({
              ...listing,
              created_by: user?.email || 'admin@lkyard.lk',
              seller: { name: user?.full_name || 'Admin', id: user?.uid },
              created_date: new Date().toISOString()
          });
          addLog(`Created listing: ${listing.title}`, 'success');
        }
        addLog('Listing Seeding Completed!', 'success');
      } catch (error) {
        addLog(`Error seeding listings: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-[#F47524]" />
          Admin Tools: Data Seeder
        </h1>
        <p className="text-gray-600 mt-2">
          Use this tool to populate your Firebase database with sample data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Sample Profiles</h2>
          <p className="text-sm text-gray-500 mb-4">
            Adds sample professionals and subcontractors (Engineers, Architects, Masons).
          </p>
          <Button onClick={seedProfiles} disabled={loading} className="w-full bg-[#F47524]">
            Seed Profiles
          </Button>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Sample Listings</h2>
          <p className="text-sm text-gray-500 mb-4">
            Adds sample tool sales and machinery rentals.
          </p>
          <Button onClick={seedListings} disabled={loading} className="w-full bg-[#111111]">
            Seed Listings
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 text-gray-300 font-mono text-sm h-64 overflow-y-auto">
        <h3 className="text-gray-500 mb-2 border-b border-gray-700 pb-2">Execution Logs</h3>
        {logs.length === 0 && <span className="text-gray-600 italic">Ready...</span>}
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 ${
            log.type === 'error' ? 'text-red-400' : 
            log.type === 'success' ? 'text-green-400' : 'text-gray-300'
          }`}>
            <span className="text-gray-600">[{log.time}]</span>
            <span>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
