import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ["192.168.0.115"],
    typescript: {
        ignoreBuildErrors: true,
    },
    compiler: {
        styledComponents: true,
    },
};

export default nextConfig;
