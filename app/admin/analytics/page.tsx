import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { syncCurrentUser, getUserCount } from '@/lib/models/user.model'
import { getDocuments, getDocumentCount } from '@/lib/models/document.model'
import { getStorageStats, getTotalFilesSize } from '@/lib/mongodb'
import {
  BarChart3,
  Home,
  ArrowLeft,
  FileText,
  Users,
  HardDrive,
  TrendingUp,
  Database,
  Folder
} from 'lucide-react'
import Link from 'next/link'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let user = null
  let stats = {
    documentCount: 0,
    enabledDocs: 0,
    disabledDocs: 0,
    userCount: 0,
    storageUsed: 0,
    dbStats: {
      dataSize: 0,
      storageSize: 0,
      totalDocuments: 0,
      gridFSSize: 0
    },
    categoryBreakdown: {} as Record<string, number>
  }

  try {
    user = await syncCurrentUser()

    if (user?.role === 'admin') {
      const [documentCount, enabledDocs, disabledDocs, userCount, storageUsed, dbStats, documents] = await Promise.all([
        getDocumentCount(),
        getDocumentCount('enabled'),
        getDocumentCount('disabled'),
        getUserCount(),
        getTotalFilesSize(),
        getStorageStats(),
        getDocuments({ limit: 1000 })
      ])

      // Calculate category breakdown
      const categoryBreakdown: Record<string, number> = {}
      for (const doc of documents) {
        categoryBreakdown[doc.category] = (categoryBreakdown[doc.category] || 0) + 1
      }

      stats = {
        documentCount,
        enabledDocs,
        disabledDocs,
        userCount,
        storageUsed,
        dbStats,
        categoryBreakdown
      }
    }
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Admin
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <h1 className="text-lg font-semibold">Analytics</h1>
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-emerald-500" />
            Analytics Dashboard
          </h2>
          <p className="text-zinc-400 mt-1">Overview of your document vault statistics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Total Documents"
            value={stats.documentCount.toString()}
            subtitle={`${stats.enabledDocs} enabled, ${stats.disabledDocs} disabled`}
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Registered Users"
            value={stats.userCount.toString()}
            subtitle="Active accounts"
          />
          <StatCard
            icon={<HardDrive className="w-6 h-6" />}
            title="Files Storage"
            value={formatBytes(stats.storageUsed)}
            subtitle="PDF files stored"
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            title="Database Size"
            value={formatBytes(stats.dbStats.dataSize)}
            subtitle={`${stats.dbStats.totalDocuments} total records`}
          />
        </div>

        {/* Category Breakdown */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-emerald-500" />
            Documents by Category
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {Object.keys(stats.categoryBreakdown).length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No documents uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.categoryBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => {
                    const percentage = (count / stats.documentCount) * 100
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{category}</span>
                          <span className="text-zinc-500">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </section>

        {/* Storage Details */}
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Storage Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 text-sm">GridFS Files</p>
              <p className="text-2xl font-bold mt-1">{formatBytes(stats.dbStats.gridFSSize)}</p>
              <p className="text-zinc-500 text-sm mt-1">Stored in chunks</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 text-sm">Database Storage</p>
              <p className="text-2xl font-bold mt-1">{formatBytes(stats.dbStats.storageSize)}</p>
              <p className="text-zinc-500 text-sm mt-1">On disk allocation</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 text-sm">Avg File Size</p>
              <p className="text-2xl font-bold mt-1">
                {stats.documentCount > 0
                  ? formatBytes(stats.storageUsed / stats.documentCount)
                  : '—'}
              </p>
              <p className="text-zinc-500 text-sm mt-1">Per document</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500">
          {icon}
        </div>
        <span className="font-medium text-zinc-300">{title}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
    </div>
  )
}
