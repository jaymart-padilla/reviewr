import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  outputFileTracingIncludes: {
    // PDF.js loads its worker dynamically, including for server-side text extraction.
    '/workspaces/*': ['./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
  },
};

export default nextConfig;
