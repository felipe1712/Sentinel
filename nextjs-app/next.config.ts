import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  
  transpilePackages: [
    "@fullcalendar/core",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/react",
  ],
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    // Additional Sass options can go here
  },
};

export default nextConfig;