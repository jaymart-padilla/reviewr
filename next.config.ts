import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Vercel Functions cap the entire request payload at 4.5 MB. | refer: https://vercel.com/docs/functions/limitations
      bodySizeLimit: '4.5mb',
    },
  },
  serverExternalPackages: ['pdfjs-dist'],
  outputFileTracingIncludes: {
    // PDF.js loads its worker dynamically, including for server-side text extraction.
    '/workspaces/*': ['./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
  },
};

export default nextConfig;
