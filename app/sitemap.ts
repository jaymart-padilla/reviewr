import { siteConfig } from '@/lib/config';
import { paths } from '@/lib/paths';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}${paths.workspaces.url}`,
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}${paths.about.url}`,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}${paths.guide.url}`,
      priority: 0.4,
    },
  ];
}
