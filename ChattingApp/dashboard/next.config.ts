import type { NextConfig } from "next";

const nextConfig: NextConfig = {

};

module.exports = {
  allowedDevOrigins: [
    'http://127.0.0.1:5003',
    'http://localhost:5003'
  ]
}

export default nextConfig;
