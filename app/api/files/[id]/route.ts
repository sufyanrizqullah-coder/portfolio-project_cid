import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiResponse } from '@/lib/utils'
import { unlink } from 'fs/promises'
import path from 'path'
import { logActivity } from '@/lib/activity'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params

  const file = await prisma.portfolioFile.findUnique({ where: { id } })
  if (!file) return apiError('File tidak ditemukan', 404)

  // Hapus file fisik
  try {
    const filePath = path.join(process.cwd(), 'public', file.fileUrl)
    await unlink(filePath)
  } catch {
    // File mungkin sudah tidak ada, lanjut saja
  }

  await prisma.portfolioFile.delete({ where: { id } })
  await logActivity(session.userId, 'DELETE_FILE', `Menghapus file: ${file.fileName}`)

  return apiResponse({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  const { id } = await params
  const { allowDownload } = await req.json()

  const file = await prisma.portfolioFile.update({
    where: { id },
    data: { allowDownload },
  })

  return apiResponse({ file })
}
