export const sampleListings = [
  {
    id: 'item_1',
    type: 'item',
    category: 'tools_materials',
    subcategory: 'Power Tools',
    title: 'DeWalt 20V Max Cordless Drill',
    description: 'Brand new DeWalt cordless drill with 2 batteries and charger. Never used, original packaging.',
    price: 45000,
    price_type: 'fixed',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800'
    ],
    city: 'Colombo',
    district: 'Colombo',
    location_text: 'Colombo 03',
    featured: true,
    status: 'active',
    views: 125,
    owner_name: 'Hardware Mart',
    owner_phone: '0771234567',
    owner_verified: true,
    created_date: new Date().toISOString()
  },
  {
    id: 'item_2',
    type: 'item',
    category: 'tools_materials',
    subcategory: 'Building Materials',
    title: 'High Quality Red Bricks',
    description: 'First class red bricks for sale. Bulk orders available. Transport can be arranged.',
    price: 35,
    price_type: 'fixed',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1590074072786-a66914d668f1?w=800'
    ],
    city: 'Gampaha',
    district: 'Gampaha',
    location_text: 'Yakkala',
    featured: false,
    status: 'active',
    views: 45,
    owner_name: 'Saman Traders',
    owner_phone: '0712345678',
    owner_verified: false,
    created_date: new Date().toISOString()
  },
  {
    id: 'machine_1',
    type: 'machine',
    category: 'machines',
    subcategory: 'excavator',
    title: 'Kobelco SK200 Excavator for Hire',
    description: '20 ton excavator available for long term rent. Experienced operator included.',
    price: 45000,
    price_type: 'daily',
    condition: 'used',
    images: [
      'https://images.unsplash.com/photo-1582236828557-41804f378df2?w=800',
      'https://images.unsplash.com/photo-1517482591600-6060c5fd2865?w=800'
    ],
    city: 'Kandy',
    district: 'Kandy',
    location_text: 'Peradeniya',
    featured: true,
    status: 'active',
    views: 312,
    owner_name: 'Kandy Constructions',
    owner_phone: '0761234567',
    owner_verified: true,
    specifications: {
      'Bucket Capacity': '0.9 m3',
      'Operating Weight': '20,000 kg',
      'Year': '2018'
    },
    created_date: new Date().toISOString()
  },
  {
    id: 'machine_2',
    type: 'machine',
    category: 'machines',
    subcategory: 'jcb',
    title: 'JCB 3DX Super Backhoe Loader',
    description: 'JCB available for daily or hourly rent. Material leveling and excavation.',
    price: 5500,
    price_type: 'hourly',
    condition: 'good',
    images: [
      'https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?w=800'
    ],
    city: 'Kurunegala',
    district: 'Kurunegala',
    location_text: 'Town Area',
    featured: false,
    status: 'active',
    views: 89,
    owner_name: 'Ranaweera Movers',
    owner_phone: '0721234567',
    owner_verified: true,
    created_date: new Date().toISOString()
  }
];
