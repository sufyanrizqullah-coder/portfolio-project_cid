import { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { logActivity } from '@/lib/activity'
import { apiResponse } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (session) {
    await logActivity(session.userId, 'LOGOUT', `Admin ${session.email} logout`)
  }

  const response = apiResponse({ success: true })
  const headers = new Headers(response.headers)
  headers.append(
    'Set-Cookie',
    `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
  )
  return new Response(response.body, { status: 200, headers })
}
