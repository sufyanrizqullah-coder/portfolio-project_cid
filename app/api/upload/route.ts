import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { apiError, apiResponse } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/zip', 'application/x-zip-compressed']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return apiError('Akses ditolak', 403)

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const portfolioId = formData.get('portfolioId') as string | null
    const allowDownload = formData.get('allowDownload') === 'true'

    if (!file) return apiError('File tidak ditemukan')
    if (!ALLOWED_TYPES.includes(file.type)) return apiError('Tipe file tidak diizinkan')
    if (file.size > MAX_SIZE) return apiError('Ukuran file maksimal 10MB')

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${safeName}`

    // Kalau ada portfolioId, simpan ke tabel portfolio_files
    if (portfolioId) {
      const portfolioFile = await prisma.portfolioFile.create({
        data: {
          portfolioId,
          fileName: file.name,
          fileUrl,
          fileType: file.type,
          fileSize: file.size,
          allowDownload,
        },
      })
      await logActivity(session.userId, 'UPLOAD_FILE', `Upload file: ${file.name}`)
      return apiResponse({ file: portfolioFile, url: fileUrl }, 201)
    }

    await logActivity(session.userId, 'UPLOAD_FILE', `Upload file: ${file.name}`)
    return apiResponse({ url: fileUrl, fileName: file.name, fileType: file.type, fileSize: file.size }, 201)
  } catch (err) {
    console.error('Upload error:', err)
    return apiError('Gagal mengupload file', 500)
  }
}
