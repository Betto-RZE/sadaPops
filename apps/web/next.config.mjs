/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep `next dev` artifacts separate so a production build cannot remove
  // chunks that the running local server still has in its manifest.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  transpilePackages: ['@mapa-dalias/game', '@mapa-dalias/types'],
  reactStrictMode: true,
};

export default nextConfig;
