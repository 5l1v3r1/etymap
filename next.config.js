/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    transpilePackages: ["ui"],

    appDir: true,
  },
};

module.exports = nextConfig;
