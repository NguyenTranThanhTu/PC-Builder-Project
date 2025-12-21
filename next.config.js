/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn2.cellphones.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tse1.mm.bing.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    domains: ['localhost', 'lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
