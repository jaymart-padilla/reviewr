import { BRAND } from '@/lib/constants';

export const siteConfig = {
  name: BRAND.title,
  description: BRAND.description,
  url: process.env.NEXT_PUBLIC_SITE_URL!,
};
