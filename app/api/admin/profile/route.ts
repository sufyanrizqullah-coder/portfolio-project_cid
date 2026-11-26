import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { name, email } = await req.json()

  if (!name?.trim()) return apiError('Nama wajib diisi')
  if (!email?.trim()) return apiError('Email wajib diisi')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return apiError('Format email tidak valid')

  // Cek email tidak dipakai akun lain
  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: session.userId } }
  })
  if (existing) return apiError('Email sudah digunakan akun lain')

  await prisma.user.update({
    where: { id: session.userId },
    data: { name: name.trim(), email: email.trim() },
  })

  await logActivity(session.userId, 'UPDATE_PROFILE', `Profil diperbarui: ${name}`)

  return apiResponse({ success: true })
}
