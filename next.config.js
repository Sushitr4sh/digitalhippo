/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Because we're pulling the images from the file system, we need to authorize our local computer to be a valid source for these images
    remotePatterns: [
      {
        hostname: "localhost",
        pathname: "**",
        port: "3000",
        protocol: "http",
      },
    ],
  },
};

module.exports = nextConfig;
