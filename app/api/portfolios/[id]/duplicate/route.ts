import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse, slugify } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params
  const original = await prisma.portfolio.findUnique({ where: { id }, include: { files: true } })
  if (!original) return apiError('Proyek tidak ditemukan', 404)

  const baseTitle = `${original.title} (Salinan)`
  let slug = slugify(baseTitle)
  const existing = await prisma.portfolio.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const duplicate = await prisma.portfolio.create({
    data: {
      title: baseTitle,
      slug,
      categoryId: original.categoryId,
      shortDescription: original.shortDescription,
      fullDescription: original.fullDescription,
      thumbnail: original.thumbnail,
      technologies: original.technologies,
      demoUrl: original.demoUrl,
      githubUrl: original.githubUrl,
      startDate: original.startDate,
      completionDate: original.completionDate,
      status: 'draft', // selalu draft
      allowDownload: original.allowDownload,
    },
  })

  await logActivity(session.userId, 'DUPLICATE_PROJECT', `Menduplikat proyek: ${original.title}`)
  return apiResponse({ portfolio: duplicate }, 201)
}
