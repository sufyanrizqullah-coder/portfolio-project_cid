import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { currentPassword, newPassword } = await req.json()

  if (!newPassword || newPassword.length < 8) {
    return apiError('Password baru minimal 8 karakter')
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return apiError('User tidak ditemukan', 404)

  // Jika bukan password pertama kali, verifikasi password lama
  if (!user.mustChangePassword) {
    if (!currentPassword) return apiError('Password lama wajib diisi')
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return apiError('Password lama salah', 401)
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, mustChangePassword: false },
  })

  await logActivity(session.userId, 'CHANGE_PASSWORD', 'Admin mengganti password')

  return apiResponse({ success: true, message: 'Password berhasil diubah' })
}
