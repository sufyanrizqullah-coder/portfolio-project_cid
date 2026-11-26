import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai proses seeding...')

  // Buat akun admin pertama (hanya jika belum ada)
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'AdminCid@gmail.com'
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'OnlyCidzzz'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.user.create({
      data: {
        name: 'Admin Cid',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
        mustChangePassword: true,
      },
    })
    console.log(`✅ Akun admin dibuat: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Akun admin sudah ada: ${adminEmail}`)
  }

  // Buat kategori default
  const defaultCategories = [
    { name: 'Web Development', description: 'Proyek pengembangan website' },
    { name: 'Mobile App', description: 'Aplikasi mobile Android dan iOS' },
    { name: 'UI/UX Design', description: 'Desain antarmuka pengguna' },
    { name: 'Data Science', description: 'Analisis data dan machine learning' },
    { name: 'Backend API', description: 'REST API dan microservices' },
  ]

  for (const cat of defaultCategories) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cat.name, slug, description: cat.description },
    })
  }
  console.log('✅ Kategori default dibuat')

  // Buat pengaturan default
  const defaultSettings = [
    { key: 'site_name', value: 'Portfolio Projects' },
    { key: 'site_description', value: 'Kumpulan proyek dan karya terbaik' },
    { key: 'projects_per_page', value: '12' },
    { key: 'show_github', value: 'true' },
    { key: 'show_demo', value: 'true' },
  ]

  for (const setting of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Pengaturan default dibuat')

  // Buat contoh proyek untuk preview (bisa dihapus)
  const webCategory = await prisma.category.findFirst({ where: { slug: 'web-development' } })
  if (webCategory) {
    const existing = await prisma.portfolio.findUnique({ where: { slug: 'contoh-proyek-dashboard' } })
    if (!existing) {
      await prisma.portfolio.create({
        data: {
          title: 'Contoh Proyek Dashboard',
          slug: 'contoh-proyek-dashboard',
          categoryId: webCategory.id,
          shortDescription: 'Dashboard admin modern dengan fitur manajemen data lengkap',
          fullDescription: 'Ini adalah contoh proyek untuk preview. Proyek ini dibuat menggunakan Next.js, Tailwind CSS, dan Prisma ORM. Fitur utama meliputi autentikasi, CRUD data, dan visualisasi statistik.',
          technologies: JSON.stringify(['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'SQLite']),
          status: 'published',
          allowDownload: false,
        },
      })
      console.log('✅ Contoh proyek dibuat')
    }
  }

  console.log('🎉 Seeding selesai!')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
