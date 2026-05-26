export interface Talent {
  id: string;
  name: string;
  category: 'Influencer' | 'Athlete' | 'Player';
  subCategory: string;
  followers: number;
  engagementRate: number;
  location: string;
  verified: boolean;
  profileImage: string;
  coverImage?: string;
  bio: string;
  tags: string[];
  portfolio: string[];
  stats: {
    posts: number;
    avgLikes: number;
    avgComments: number;
  };
  collaborations: Array<{
    brand: string;
    description: string;
    date: string;
  }>;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  brandLogo?: string;
  description: string;
  budget: string;
  category: string;
  requirements: string[];
  deadline: string;
  status: 'active' | 'pending' | 'completed';
  applicants: number;
}

export const mockTalents: Talent[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    category: 'Influencer',
    subCategory: 'Lifestyle & Fashion',
    followers: 850000,
    engagementRate: 4.8,
    location: 'Los Angeles, CA',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1615843644216-14d9b92a02ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXIlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzc0OTU2NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    coverImage: 'https://images.unsplash.com/photo-1582005450386-52b25f82d9bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGNvbGxhYm9yYXRpb24lMjBtZWV0aW5nfGVufDF8fHx8MTc3NTAyODUzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Fashion & lifestyle content creator passionate about sustainable living and authentic brand partnerships.',
    tags: ['Fashion', 'Lifestyle', 'Sustainability', 'Beauty'],
    portfolio: [
      'https://images.unsplash.com/photo-1737491220179-ef20cfb2497a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NzUwMjg1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1615843644216-14d9b92a02ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXIlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzc0OTU2NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    stats: {
      posts: 1248,
      avgLikes: 42500,
      avgComments: 850,
    },
    collaborations: [
      {
        brand: 'Nike',
        description: 'Summer activewear campaign featuring sustainable materials',
        date: '2025',
      },
      {
        brand: 'Sephora',
        description: 'Beauty product launch and review series',
        date: '2024',
      },
    ],
    socialMedia: {
      instagram: '@sarahjohnson',
      youtube: 'SarahJohnsonVlogs',
      tiktok: '@sarahj',
    },
  },
  {
    id: '2',
    name: 'Marcus Williams',
    category: 'Athlete',
    subCategory: 'Basketball',
    followers: 1200000,
    engagementRate: 5.2,
    location: 'Miami, FL',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1671518707590-4900d05ad5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyJTIwc3BvcnRzfGVufDF8fHx8MTc3NTAyNzg0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    coverImage: 'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWFtfGVufDF8fHx8MTc3NDk1OTE0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Professional basketball player and sports ambassador. Inspiring the next generation through athletics and community work.',
    tags: ['Basketball', 'Sports', 'Fitness', 'Youth Development'],
    portfolio: [
      'https://images.unsplash.com/photo-1671518707590-4900d05ad5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyJTIwc3BvcnRzfGVufDF8fHx8MTc3NTAyNzg0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    stats: {
      posts: 856,
      avgLikes: 68000,
      avgComments: 1200,
    },
    collaborations: [
      {
        brand: 'Adidas',
        description: 'Signature shoe line collaboration',
        date: '2025',
      },
      {
        brand: 'Gatorade',
        description: 'Sports nutrition campaign',
        date: '2024',
      },
    ],
    socialMedia: {
      instagram: '@marcusw',
      twitter: '@marcuswilliams',
    },
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    category: 'Player',
    subCategory: 'Gaming & Esports',
    followers: 650000,
    engagementRate: 6.1,
    location: 'Austin, TX',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1758179761789-87792b6132a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzdHJlYW1lciUyMGVzcG9ydHN8ZW58MXx8fHwxNzc1MDI4NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    coverImage: 'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWFtfGVufDF8fHx8MTc3NDk1OTE0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Professional esports player and content creator. Streaming gaming content and competing in international tournaments.',
    tags: ['Gaming', 'Esports', 'Streaming', 'Tech'],
    portfolio: [
      'https://images.unsplash.com/photo-1758179761789-87792b6132a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzdHJlYW1lciUyMGVzcG9ydHN8ZW58MXx8fHwxNzc1MDI4NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    stats: {
      posts: 2150,
      avgLikes: 38000,
      avgComments: 950,
    },
    collaborations: [
      {
        brand: 'Razer',
        description: 'Gaming peripherals sponsorship',
        date: '2025',
      },
      {
        brand: 'Red Bull',
        description: 'Energy drink partnership for esports events',
        date: '2024',
      },
    ],
    socialMedia: {
      instagram: '@emmarodriguez',
      youtube: 'EmmaGaming',
      tiktok: '@emmar',
    },
  },
  {
    id: '4',
    name: 'David Chen',
    category: 'Athlete',
    subCategory: 'Fitness & Training',
    followers: 450000,
    engagementRate: 5.8,
    location: 'San Francisco, CA',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1759476533830-8cc4b219f0c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYXRobGV0ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDk2MzgzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    coverImage: 'https://images.unsplash.com/photo-1582005450386-52b25f82d9bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGNvbGxhYm9yYXRpb24lMjBtZWV0aW5nfGVufDF8fHx8MTc3NTAyODUzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Certified fitness trainer and wellness coach. Helping people achieve their fitness goals through personalized training.',
    tags: ['Fitness', 'Training', 'Wellness', 'Nutrition'],
    portfolio: [
      'https://images.unsplash.com/photo-1759476533830-8cc4b219f0c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYXRobGV0ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDk2MzgzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    stats: {
      posts: 1650,
      avgLikes: 28000,
      avgComments: 620,
    },
    collaborations: [
      {
        brand: 'Under Armour',
        description: 'Fitness apparel campaign',
        date: '2025',
      },
    ],
    socialMedia: {
      instagram: '@davidchenfit',
      youtube: 'DavidChenFitness',
    },
  },
  {
    id: '5',
    name: 'Jessica Park',
    category: 'Influencer',
    subCategory: 'Beauty & Makeup',
    followers: 920000,
    engagementRate: 4.5,
    location: 'New York, NY',
    verified: false,
    profileImage: 'https://images.unsplash.com/photo-1737491220179-ef20cfb2497a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NzUwMjg1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Beauty and makeup artist creating tutorials and product reviews for everyday looks.',
    tags: ['Beauty', 'Makeup', 'Skincare', 'Tutorials'],
    portfolio: [],
    stats: {
      posts: 1820,
      avgLikes: 45000,
      avgComments: 980,
    },
    collaborations: [],
    socialMedia: {
      instagram: '@jessicapark',
      youtube: 'JessicaParkBeauty',
    },
  },
  {
    id: '6',
    name: 'Alex Thompson',
    category: 'Player',
    subCategory: 'Gaming & Esports',
    followers: 780000,
    engagementRate: 5.9,
    location: 'Seattle, WA',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDk4NjM2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Competitive FPS player and gaming influencer. Sharing gameplay tips and strategies.',
    tags: ['Gaming', 'FPS', 'Streaming', 'Competitive'],
    portfolio: [],
    stats: {
      posts: 2450,
      avgLikes: 42000,
      avgComments: 1150,
    },
    collaborations: [
      {
        brand: 'Logitech',
        description: 'Gaming accessories partnership',
        date: '2025',
      },
    ],
    socialMedia: {
      instagram: '@alexthompson',
      youtube: 'AlexThompsonGaming',
    },
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Summer Athletic Wear Launch',
    brand: 'Nike',
    description: 'Looking for athletes and fitness influencers to promote our new summer athletic wear collection. Must have strong engagement and authentic fitness content.',
    budget: '$5,000 - $10,000',
    category: 'Athlete',
    requirements: [
      '500K+ followers',
      'Fitness or sports niche',
      'High engagement rate',
      'US-based preferred',
    ],
    deadline: '2026-05-15',
    status: 'active',
    applicants: 24,
  },
  {
    id: '2',
    title: 'Gaming Headset Product Launch',
    brand: 'Razer',
    description: 'Seeking esports players and gaming content creators for our new premium gaming headset launch. Looking for authentic reviews and gameplay content.',
    budget: '$3,000 - $7,000',
    category: 'Player',
    requirements: [
      '300K+ followers',
      'Gaming/esports content',
      'Regular streaming schedule',
      'Previous brand partnerships',
    ],
    deadline: '2026-04-30',
    status: 'active',
    applicants: 18,
  },
  {
    id: '3',
    title: 'Sustainable Fashion Campaign',
    brand: 'Patagonia',
    description: 'Partnering with lifestyle and fashion influencers who align with our sustainability values. Create authentic content showcasing our eco-friendly products.',
    budget: '$4,000 - $8,000',
    category: 'Influencer',
    requirements: [
      '400K+ followers',
      'Sustainability focus',
      'Strong storytelling',
      'Multiple platform presence',
    ],
    deadline: '2026-05-20',
    status: 'active',
    applicants: 32,
  },
  {
    id: '4',
    title: 'Beauty Product Review Series',
    brand: 'Sephora',
    description: 'Looking for beauty influencers to create an honest review series of our new skincare line. Must have experience with beauty product reviews.',
    budget: '$2,500 - $5,000',
    category: 'Influencer',
    requirements: [
      '250K+ followers',
      'Beauty/makeup content',
      'Video creation skills',
      'Authentic reviews',
    ],
    deadline: '2026-04-25',
    status: 'active',
    applicants: 45,
  },
];

export const categories = [
  {
    id: 'influencer',
    name: 'Influencer',
    icon: '📱',
    description: 'Content creators and social media personalities',
    subCategories: ['Lifestyle & Fashion', 'Beauty & Makeup', 'Travel', 'Food & Cooking', 'Tech & Reviews'],
  },
  {
    id: 'athlete',
    name: 'Athlete',
    icon: '⚽',
    description: 'Professional athletes and fitness experts',
    subCategories: ['Basketball', 'Football', 'Tennis', 'Fitness & Training', 'Running', 'Combat Sports'],
  },
  {
    id: 'player',
    name: 'Player',
    icon: '🎮',
    description: 'Esports players and gaming content creators',
    subCategories: ['Gaming & Esports', 'FPS Games', 'MOBA Games', 'Streaming', 'Mobile Gaming'],
  },
];

export const testimonials = [
  {
    name: 'Michael Roberts',
    role: 'Marketing Director at TechCorp',
    image: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDk4NjM2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    content: 'This platform revolutionized how we connect with influencers. Found the perfect match for our campaign in just days!',
    rating: 5,
  },
  {
    name: 'Sarah Miller',
    role: 'Brand Manager at FitLife',
    image: 'https://images.unsplash.com/photo-1615843644216-14d9b92a02ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXIlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzc0OTU2NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    content: 'The quality of athletes on this platform is outstanding. We\'ve built amazing partnerships that delivered real results.',
    rating: 5,
  },
  {
    name: 'Emma Davis',
    role: 'Content Creator',
    image: 'https://images.unsplash.com/photo-1737491220179-ef20cfb2497a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NzUwMjg1MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    content: 'As an influencer, this platform helped me find authentic brand partnerships that align with my values.',
    rating: 5,
  },
];
