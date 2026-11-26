import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, getSessionFromRequest } from '@/lib/auth'
import { apiError, apiResponse, slugify } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  const isAdmin = session?.role === 'admin'

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const year = searchParams.get('year') || ''
  const sort = searchParams.get('sort') || 'newest'
  const status = searchParams.get('status') || ''

  // Ambil limit dari settings jika tidak di-override via query param
  let limit = parseInt(searchParams.get('limit') || '0')
  if (!limit || limit <= 0) {
    if (!isAdmin) {
      const setting = await prisma.siteSettings.findUnique({ where: { key: 'projects_per_page' } })
      limit = setting ? parseInt(setting.value) || 12 : 12
    } else {
      limit = parseInt(searchParams.get('limit') || '10')
    }
  }

  const where: Record<string, unknown> = {}

  // Publik hanya lihat published
  if (!isAdmin) {
    where.status = 'published'
  } else if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { shortDescription: { contains: search } },
    ]
  }

  if (category) {
    where.category = { slug: category }
  }

  if (year) {
    where.completionDate = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    }
  }

  const orderBy: Record<string, string> =
    sort === 'oldest'
      ? { createdAt: 'asc' }
      : sort === 'name'
      ? { title: 'asc' }
      : { createdAt: 'desc' }

  const [items, total] = await Promise.all([
    prisma.portfolio.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        files: { select: { id: true, fileName: true, fileUrl: true, fileType: true, fileSize: true, allowDownload: true } },
      },
    }),
    prisma.portfolio.count({ where }),
  ])

  return apiResponse({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  try {
    const body = await req.json()
    const {
      title, categoryId, shortDescription, fullDescription,
      thumbnail, technologies, extraCategories, demoUrl, githubUrl,
      startDate, completionDate, status, allowDownload,
    } = body

    if (!title || !categoryId || !shortDescription) {
      return apiError('Judul, kategori, dan deskripsi singkat wajib diisi')
    }

    // Buat slug unik
    let slug = slugify(title)
    const existing = await prisma.portfolio.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const portfolio = await prisma.portfolio.create({
      data: {
        title,
        slug,
        categoryId,
        shortDescription,
        fullDescription: fullDescription || '',
        thumbnail: thumbnail || null,
        technologies: JSON.stringify(technologies || []),
        extraCategories: JSON.stringify(extraCategories || []),
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        status: status || 'draft',
        allowDownload: allowDownload || false,
      },
      include: { category: true },
    })

    await logActivity(session.userId, 'CREATE_PROJECT', `Membuat proyek: ${title}`)

    return apiResponse({ portfolio }, 201)
  } catch (err) {
    console.error(err)
    return apiError('Gagal membuat proyek', 500)
  }
}
