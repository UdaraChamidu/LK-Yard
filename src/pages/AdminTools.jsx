import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MOCK_PROFILES = [
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
    portfolio: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800']
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
    portfolio: ['https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800']
  },
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
  }
];

const MOCK_LISTINGS = [
    {
        title: 'Hilti TE 70-ATC/AVR Combi Hammer',
        price: 150000,
        type: 'SALE',
        category: 'Tools',
        location: 'Colombo',
        description: 'Heavy duty combi hammer for drilling and chiseling.',
        status: 'active',
        views: 120,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800']
    },
    {
        title: 'Excavator for Rent - CAT 320',
        price: 25000,
        type: 'RENT',
        category: 'Heavy Machinery',
        location: 'Kandy',
        description: 'Daily rental rate. Operator included.',
        status: 'active',
        views: 85,
        images: ['https://images.unsplash.com/photo-1582226294371-33157297d025?w=800']
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
