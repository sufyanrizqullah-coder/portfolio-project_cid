import { prisma } from './prisma'

export async function logActivity(
  userId: string,
  action: string,
  description: string
) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, description },
    })
  } catch {
    // jangan crash kalau log gagal
  }
}
