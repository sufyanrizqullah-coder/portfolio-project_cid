import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiError, apiResponse, slugify } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params
  const { name, description } = await req.json()

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return apiError('Kategori tidak ditemukan', 404)

  let slug = existing.slug
  if (name && name !== existing.name) {
    slug = slugify(name)
    const dup = await prisma.category.findFirst({ where: { slug, NOT: { id } } })
    if (dup) slug = `${slug}-${Date.now()}`
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: name || existing.name, slug, description: description ?? existing.description },
  })

  await logActivity(session.userId, 'UPDATE_CATEGORY', `Mengupdate kategori: ${category.name}`)
  return apiResponse({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params

  const count = await prisma.portfolio.count({ where: { categoryId: id } })
  if (count > 0) return apiError(`Kategori masih digunakan oleh ${count} proyek`, 400)

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return apiError('Kategori tidak ditemukan', 404)

  await prisma.category.delete({ where: { id } })
  await logActivity(session.userId, 'DELETE_CATEGORY', `Menghapus kategori: ${category.name}`)
  return apiResponse({ success: true })
}
