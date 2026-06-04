/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/video.mjpg",
        destination: "http://127.0.0.1:8000/video.mjpg",
      },
    ];
  },
};

export default nextConfig;
