/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/LaForja',
  assetPrefix: '/LaForja/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
