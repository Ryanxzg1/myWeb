import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ['192.168.1.52', 'localhost'],
  experimental: {
    // Wajib karena aplikasi ini punya dua root layout (`[locale]` dan `admin`),
    // sehingga tidak ada satu layout yang bisa menyusun 404 global.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    resolveAlias: {
      // Ini satu-satunya hal yang dilakukan `createNextIntlPlugin()` untuk
      // konfigurasi kita (tanpa message extraction / precompile).
      //
      // Alias dipasang manual karena plugin tersebut menarik `@swc/core` ke
      // jalur transpile `next.config.ts`, dan binding native `@swc/core` gagal
      // dimaterialisasi ketika cache root-nya berada di bawah direktori yang
      // group-writable (mis. `~/.cache` dengan mode 775).
      //
      // `next-intl/server` mengimpor `next-intl/config` saat runtime, jadi
      // alias ini WAJIB ada. Kalau nanti memakai message extraction
      // (`experimental.extract` / `experimental.messages`), plugin resmi
      // kembali diperlukan dan masalah izin cache itu harus dibereskan lebih
      // dulu.
      "next-intl/config": "./i18n/request.ts",
    },
  },
};

export default nextConfig;
