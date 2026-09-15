import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Product images render through a plain <img> (see components/ProductImage.tsx)
  // so shop staff can paste any image URL in the admin panel. If you switch to
  // next/image later, list the image hosts you allow here.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

export default nextConfig
