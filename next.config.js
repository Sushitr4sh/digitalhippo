/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Because we're pulling the images from the file system, we need to authorize our local computer to be a valid source for these images
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "https://digitalhippo-production-ecdf.up.railway.app/",
      },
    ],
  },
};

module.exports = nextConfig;
