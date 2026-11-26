import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiError, apiResponse } from '@/lib/utils'
import { logActivity } from '@/lib/activity'

// Rate limiting sederhana pakai Map in-memory
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || record.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (record.count >= 10) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

  if (!checkRateLimit(ip)) {
    return apiError('Terlalu banyak percobaan login. Coba lagi dalam 15 menit.', 429)
  }

  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return apiError('Email dan password wajib diisi')
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.status !== 'active') {
      return apiError('Email atau password salah', 401)
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return apiError('Email atau password salah', 401)
    }

    if (user.role !== 'admin') {
      return apiError('Akses ditolak', 403)
    }

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    await logActivity(user.id, 'LOGIN', `Admin ${user.email} login`)

    const response = apiResponse({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    })

    // Set cookie HttpOnly
    const headers = new Headers(response.headers)
    headers.append(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
    )

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (err) {
    console.error('Login error:', err)
    return apiError('Terjadi kesalahan server', 500)
  }
}
