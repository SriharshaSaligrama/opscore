import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    cacheComponents: true,
    reactCompiler: true,
    typedRoutes: true,
    compiler: {
        removeConsole: {
            exclude: ['error'],
        },
    },
};

export default nextConfig;
