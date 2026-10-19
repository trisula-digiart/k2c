import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allows larger payloads for direct video/photo multipart uploads
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default withPWA(nextConfig);
