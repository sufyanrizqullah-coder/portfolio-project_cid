import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, getSessionFromRequest } from '@/lib/auth'
import { apiError, apiResponse, slugify } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSessionFromRequest(req)
  const isAdmin = session?.role === 'admin'

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      category: true,
      files: true,
    },
  })

  if (!portfolio) return apiError('Proyek tidak ditemukan', 404)
  if (!isAdmin && portfolio.status !== 'published') return apiError('Proyek tidak ditemukan', 404)

  return apiResponse({ portfolio })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params

  try {
    const body = await req.json()
    const {
      title, categoryId, shortDescription, fullDescription,
      thumbnail, technologies, extraCategories, demoUrl, githubUrl,
      startDate, completionDate, status, allowDownload,
    } = body

    const existing = await prisma.portfolio.findUnique({ where: { id } })
    if (!existing) return apiError('Proyek tidak ditemukan', 404)

    let slug = existing.slug
    if (title && title !== existing.title) {
      slug = slugify(title)
      const duplicate = await prisma.portfolio.findFirst({
        where: { slug, NOT: { id } },
      })
      if (duplicate) slug = `${slug}-${Date.now()}`
    }

    const oldStatus = existing.status
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        title: title || existing.title,
        slug,
        categoryId: categoryId || existing.categoryId,
        shortDescription: shortDescription || existing.shortDescription,
        fullDescription: fullDescription ?? existing.fullDescription,
        thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
        technologies: technologies ? JSON.stringify(technologies) : existing.technologies,
        extraCategories: extraCategories !== undefined ? JSON.stringify(extraCategories) : existing.extraCategories,
        demoUrl: demoUrl !== undefined ? demoUrl : existing.demoUrl,
        githubUrl: githubUrl !== undefined ? githubUrl : existing.githubUrl,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        completionDate: completionDate ? new Date(completionDate) : existing.completionDate,
        status: status || existing.status,
        allowDownload: allowDownload !== undefined ? allowDownload : existing.allowDownload,
      },
      include: { category: true },
    })

    const action = status && status !== oldStatus ? 'CHANGE_STATUS' : 'UPDATE_PROJECT'
    await logActivity(session.userId, action, `Mengupdate proyek: ${portfolio.title}`)

    return apiResponse({ portfolio })
  } catch (err) {
    console.error(err)
    return apiError('Gagal mengupdate proyek', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params

  const portfolio = await prisma.portfolio.findUnique({ where: { id } })
  if (!portfolio) return apiError('Proyek tidak ditemukan', 404)

  await prisma.portfolio.delete({ where: { id } })
  await logActivity(session.userId, 'DELETE_PROJECT', `Menghapus proyek: ${portfolio.title}`)

  return apiResponse({ success: true })
}
