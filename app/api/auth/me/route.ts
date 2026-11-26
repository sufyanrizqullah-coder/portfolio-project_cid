import { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return apiError('Tidak terautentikasi', 401)

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true, lastLogin: true },
  })
  if (!user) return apiError('User tidak ditemukan', 404)

  return apiResponse({ user })
}
