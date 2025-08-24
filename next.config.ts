// next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  api: {
    bodyParser: false,
  },

  experimental: {
    runtime: "nodejs",
  },
};

export default nextConfig;
