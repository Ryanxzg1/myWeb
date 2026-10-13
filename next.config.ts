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
        // Panel admin tidak boleh masuk cache bersama: responsnya bergantung
        // pada cookie sesi. Tanpa aturan ini, halaman admin yang diprerender
        // statis dilayani dengan `Cache-Control: s-maxage=...` seperti konten
        // publik.
        //
        // Halaman admin belum dipaksa dinamis karena `cacheComponents` menolak
        // data runtime di luar Suspense. Begitu Fase 6 membaca sesi di Server
        // Component, route-nya menjadi dinamis dengan sendirinya; aturan ini
        // tetap jadi penjaga lapis kedua yang tidak bergantung pada isi halaman.
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
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
