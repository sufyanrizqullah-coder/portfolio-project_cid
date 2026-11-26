import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const [total, published, draft, archived, categories, recentProjects, recentLogs] =
    await Promise.all([
      prisma.portfolio.count(),
      prisma.portfolio.count({ where: { status: 'published' } }),
      prisma.portfolio.count({ where: { status: 'draft' } }),
      prisma.portfolio.count({ where: { status: 'archived' } }),
      prisma.category.count(),
      prisma.portfolio.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ])

  return apiResponse({
    stats: { total, published, draft, archived, categories },
    recentProjects,
    recentLogs,
  })
}
