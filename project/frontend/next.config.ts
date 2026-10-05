import type { NextConfig } from 'next';

import createMDX from '@next/mdx';

const serverBuild = process.env.SERVER_BUILD === '1';

const nextConfig: NextConfig = {
  typescript: {
    // CI runs `npm run typecheck`; avoid duplicating the TypeScript worker on the
    // memory-constrained production host.
    ignoreBuildErrors: serverBuild,
  },
  experimental: serverBuild
    ? {
        cpus: 1,
        parallelServerBuildTraces: false,
        parallelServerCompiles: false,
        staticGenerationMaxConcurrency: 1,
        staticGenerationMinPagesPerWorker: 100,
        webpackBuildWorker: false,
        workerThreads: false,
        webpackMemoryOptimizations: true,
      }
    : {},
};

// Case studies live in content/work/*.mdx and are loaded with dynamic imports
// (lib/case-studies.ts), so MDX files are not routes themselves.
const withMDX = createMDX({});

export default withMDX(nextConfig);
