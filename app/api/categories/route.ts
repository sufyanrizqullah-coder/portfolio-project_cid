import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiError, apiResponse, slugify } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { portfolios: true } },
    },
  })
  return apiResponse({ categories })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { name, description } = await req.json()
  if (!name) return apiError('Nama kategori wajib diisi')

  let slug = slugify(name)
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const category = await prisma.category.create({
    data: { name, slug, description: description || null },
  })

  await logActivity(session.userId, 'CREATE_CATEGORY', `Membuat kategori: ${name}`)
  return apiResponse({ category }, 201)
}
