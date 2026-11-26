import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const settings = await prisma.siteSettings.findMany()
  const result: Record<string, string> = {}
  settings.forEach((s) => { result[s.key] = s.value })

  return apiResponse({ settings: result })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const body = await req.json()

  for (const [key, value] of Object.entries(body)) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  }

  await logActivity(session.userId, 'UPDATE_SETTINGS', 'Mengupdate pengaturan website')
  return apiResponse({ success: true })
}
