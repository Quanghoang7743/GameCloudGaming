/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Auth routes go to Rust backend
      // Note: We use Next.js API routes for /api/hosts and /api/host
      // to bridge Python JWT auth with Rust host management
      {
        source: '/login',
        destination: 'http://localhost:8080/login',
      },
      {
        source: '/authenticate',
        destination: 'http://localhost:8080/authenticate',
      },
      {
        source: '/logout',
        destination: 'http://localhost:8080/logout',
      },
    ];
  },
};

export default nextConfig;
