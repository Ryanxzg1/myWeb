import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Konten demo (bukan data pribadi asli — PRD bagian 9 Maintainability). */
async function main() {
  // Cegah akun admin terbentuk dengan password default di environment production
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.SEED_ADMIN_PASSWORD
  ) {
    throw new Error(
      "SEED_ADMIN_PASSWORD wajib didefinisikan saat menjalankan seeder di environment production",
    );
  }

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "changeme123";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      passwordHash: await hashPassword(password),
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Your Name",
      tagline: { id: "Full-stack Developer", en: "Full-stack Developer" },
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      publicEmail: email,
      blogUrl: "https://blog.example.com",
      defaultMetaTitle: { id: "Your Name — Portfolio", en: "Your Name — Portfolio" },
      defaultMetaDescription: {
        id: "Portofolio dan pengalaman Your Name.",
        en: "Portfolio and experience of Your Name.",
      },
      analyticsEnabled: false,
    },
  });

  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Your Name",
      headline: { id: "Membangun web yang cepat", en: "Building fast web" },
      subheadline: { id: "Developer & problem solver", en: "Developer & problem solver" },
      about: {
        id: "<p>Halo, saya Your Name. Saya membangun aplikasi web.</p>",
        en: "<p>Hi, I'm Your Name. I build web applications.</p>",
      },
    },
  });

  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: [
        {
          company: "Acme Corp",
          role: { id: "Senior Developer", en: "Senior Developer" },
          description: { id: "<p>Memimpin tim produk.</p>", en: "<p>Led the product team.</p>" },
          location: "Jakarta",
          startedAt: new Date("2022-01-01"),
          current: true,
          status: "published",
          publishedAt: new Date(),
          sortOrder: 0,
        },
        {
          company: "Beta Studio",
          role: { id: "Developer", en: "Developer" },
          description: { id: "<p>Membangun fitur inti.</p>", en: "<p>Built core features.</p>" },
          location: "Bandung",
          startedAt: new Date("2019-06-01"),
          endedAt: new Date("2021-12-31"),
          current: false,
          status: "published",
          publishedAt: new Date(),
          sortOrder: 1,
        },
      ],
    });
  }

  if ((await prisma.project.count()) === 0) {
    await prisma.project.createMany({
      data: [
        {
          slug: "demo-project",
          title: { id: "Proyek Demo", en: "Demo Project" },
          summary: { id: "Contoh proyek.", en: "An example project." },
          description: { id: "<p>Deskripsi lengkap proyek demo.</p>", en: "<p>Full description of the demo project.</p>" },
          techStack: ["Next.js", "PostgreSQL", "Prisma"],
          demoUrl: "https://example.com",
          repoUrl: "https://github.com/example/demo",
          gallery: [],
          isFeatured: true,
          status: "published",
          publishedAt: new Date(),
          sortOrder: 0,
        },
      ],
    });
  }

  if ((await prisma.skill.count()) === 0) {
    await prisma.skill.createMany({
      data: [
        { name: "TypeScript", group: "Frontend", sortOrder: 0 },
        { name: "React", group: "Frontend", sortOrder: 1 },
        { name: "PostgreSQL", group: "Backend", sortOrder: 0 },
        { name: "Docker", group: "Infra", sortOrder: 0 },
      ],
    });
  }

  console.log("Seed selesai. Admin:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
