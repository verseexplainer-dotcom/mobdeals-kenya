export const siteConfig = {
  name: 'MobDeals Kenya',
  shortName: 'MobDeals',
  locale: 'en-KE',
  siteUrl: import.meta.env.PUBLIC_SITE_URL,
  defaultTitle: 'MobDeals Kenya | Premium Electronics in Nairobi',
  defaultDescription: 'Premium ecommerce experience for laptops, desktops, printers, monitors, storage, smartphones, projectors, and internet hardware in Nairobi and across Kenya.',
  defaultImage: '/images/og-default.jpg',
  logo: '/images/logo.png',
  themeColor: '#020617',
  twitterHandle: '',
  whatsappNumber: '254701499849',
  storageBucket: 'products',
  supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY
} as const;
