import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Hammer, Users, Truck, Briefcase, Building2, 
  Wrench, HardHat, PaintBucket, Zap, Droplets
} from 'lucide-react';

const categories = [
  {
    id: 'tools_materials',
    name: 'Tools & Materials',
    icon: Hammer,
    color: 'bg-orange-100 text-orange-600',
    page: 'BuySell',
    count: '2,500+',
  },
  {
    id: 'subcontractors',
    name: 'Subcontractors',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    page: 'Subcontractors',
    count: '800+',
  },
  {
    id: 'machines',
    name: 'Machine Hire',
    icon: Truck,
    color: 'bg-green-100 text-green-600',
    page: 'HireMachines',
    count: '350+',
  },
  {
    id: 'professionals',
    name: 'Professionals',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-600',
    page: 'Professionals',
    count: '450+',
  },
  {
    id: 'jobs',
    name: 'Jobs & Careers',
    icon: Building2,
    color: 'bg-gray-100 text-gray-600',
    page: 'Jobs',
    count: '150+',
  },
];

const subCategories = [
  { name: 'Masons', icon: HardHat, page: 'Subcontractors?skill=mason' },
  { name: 'Plumbers', icon: Droplets, page: 'Subcontractors?skill=plumber' },
  { name: 'Electricians', icon: Zap, page: 'Subcontractors?skill=electrician' },
  { name: 'Painters', icon: PaintBucket, page: 'Subcontractors?skill=painter' },
  { name: 'Welders', icon: Wrench, page: 'Subcontractors?skill=welder' },
];

export default function CategoryGrid({ showSubCategories = false }) {
  return (
    <div className="space-y-8">
      {/* Main Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={createPageUrl(category.page)}
            className="group bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#F47524]/30"
          >
            <div className={`w-14 h-14 mx-auto rounded-xl ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <category.icon className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{category.count} listings</p>
          </Link>
        ))}
      </div>

      {/* Sub Categories */}
      {showSubCategories && (
        <div className="flex flex-wrap justify-center gap-3">
          {subCategories.map((sub) => (
            <Link
              key={sub.name}
              to={createPageUrl(sub.page)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#F47524]/30"
            >
              <sub.icon className="h-4 w-4 text-[#F47524]" />
              <span className="text-sm font-medium text-gray-700">{sub.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}