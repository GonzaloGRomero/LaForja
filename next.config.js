/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/cueva-de-reparacion',
  assetPrefix: '/cueva-de-reparacion/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
