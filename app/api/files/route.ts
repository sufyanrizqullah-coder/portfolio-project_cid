import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const files = await prisma.portfolioFile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      portfolio: { select: { id: true, title: true } },
    },
  })
  return apiResponse({ files })
}
