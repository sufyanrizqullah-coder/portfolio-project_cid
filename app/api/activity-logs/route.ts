import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.activityLog.count(),
  ])

  return apiResponse({ logs, total, page, limit, totalPages: Math.ceil(total / limit) })
}
