export const siteConfig = {
  name: 'SES NEXT GEN',
  shortName: 'SES',
  locale: 'en-KE',
  siteUrl: import.meta.env.PUBLIC_SITE_URL,
  defaultTitle: 'SES NEXT GEN | Premium Electronics in Nairobi',
  defaultDescription: 'Premium ecommerce experience for laptops, smartphones, printers, desktops, accessories, and modern tech essentials in Nairobi and across Kenya.',
  defaultImage: '/images/og-default.jpg',
  themeColor: '#020617',
  twitterHandle: '',
  storageBucket: 'products',
  supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY
} as const;
