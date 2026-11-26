'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfirmModal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { formatFileSize, formatDate } from '@/lib/utils'
import { Upload, Trash2, Files, FileText, Image as ImageIcon, Download, Eye } from 'lucide-react'
import Image from 'next/image'

interface FileItem {
  id: string; fileName: string; fileUrl: string; fileType: string; fileSize: number
  allowDownload: boolean; createdAt: string; portfolio: { id: string; title: string }
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(() => {
    setLoading(true)
    fetch('/api/files').then(r => r.json())
      .then(d => setFiles(d.files || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('File berhasil diupload')
      fetchFiles()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload gagal')
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const res = await fetch(`/api/files/${deleteId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('File dihapus'); fetchFiles() }
    else toast.error('Gagal menghapus file')
    setDeleting(false); setDeleteId(null)
  }

  const toggleDownload = async (file: FileItem) => {
    await fetch(`/api/files/${file.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowDownload: !file.allowDownload }),
    })
    fetchFiles()
  }

  const isImage = (type: string) => type.startsWith('image/')
  const totalSize = files.reduce((s, f) => s + f.fileSize, 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">File Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{files.length} file · {formatFileSize(totalSize)} total</p>
        </div>
        <div>
          <input ref={fileRef} type="file" onChange={handleUpload} className="hidden"/>
          <Button icon={<Upload className="w-4 h-4"/>} loading={uploading} onClick={() => fileRef.current?.click()}>
            Upload File
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"/></div>
      ) : files.length === 0 ? (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-12 text-center">
          <Files className="w-12 h-12 text-gray-700 mx-auto mb-3"/>
          <p className="text-gray-500">Belum ada file yang diupload</p>
        </div>
      ) : (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3.5 uppercase tracking-wider">File</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3.5 uppercase tracking-wider hidden md:table-cell">Proyek</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3.5 uppercase tracking-wider hidden lg:table-cell">Ukuran</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3.5 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3.5 uppercase tracking-wider">Download</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3.5 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                <AnimatePresence>
                  {files.map((file, i) => (
                    <motion.tr key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.03 }}
                      className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {isImage(file.fileType) ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                              <Image src={file.fileUrl} alt={file.fileName} fill className="object-cover" sizes="40px"/>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#1c1c28] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-gray-500"/>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-200 max-w-[180px] truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-600">{file.fileType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-400 max-w-[150px] truncate block">{file.portfolio?.title || '-'}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-gray-400">{formatFileSize(file.fileSize)}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-gray-500">{formatDate(file.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleDownload(file)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all ${file.allowDownload ? 'bg-green-600/15 border-green-500/20 text-green-400' : 'border-[#2a2a3a] text-gray-500 hover:border-[#3a3a50]'}`}>
                          {file.allowDownload ? 'Ya' : 'Tidak'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                            <Eye className="w-3.5 h-3.5"/>
                          </a>
                          <button onClick={() => setDeleteId(file.id)}
                            className="p-1.5 rounded-lg hover:bg-red-600/20 text-gray-500 hover:text-red-400 transition-all">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus File" message="File akan dihapus permanen. Lanjutkan?" loading={deleting}/>
    </div>
  )
}
