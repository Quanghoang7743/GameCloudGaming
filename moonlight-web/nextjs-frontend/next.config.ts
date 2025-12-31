/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
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
