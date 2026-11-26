import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { ids, action } = await req.json()

  if (!ids?.length) return apiError('Tidak ada proyek yang dipilih')
  if (!['publish', 'archive', 'draft', 'delete'].includes(action)) return apiError('Aksi tidak valid')

  if (action === 'delete') {
    await prisma.portfolio.deleteMany({ where: { id: { in: ids } } })
    await logActivity(session.userId, 'BATCH_DELETE', `Menghapus ${ids.length} proyek sekaligus`)
  } else {
    const statusMap: Record<string, string> = { publish: 'published', archive: 'archived', draft: 'draft' }
    await prisma.portfolio.updateMany({ where: { id: { in: ids } }, data: { status: statusMap[action] } })
    await logActivity(session.userId, 'BATCH_UPDATE', `Mengubah ${ids.length} proyek menjadi ${statusMap[action]}`)
  }

  return apiResponse({ success: true, affected: ids.length })
}
