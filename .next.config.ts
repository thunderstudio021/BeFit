/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true, // Habilita funcionalidades experimentais
  },
  images: {
    domains: [
      "images.unsplash.com",
      "your-supabase-project.supabase.co",
      "localhost",
      "cdn.comunidadeimobiliaria.com",
      "avatars.githubusercontent.com"
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow"
          },
          {
            key: "Cache-Control",
            value: "no-store"
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig