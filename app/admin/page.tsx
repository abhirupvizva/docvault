import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { syncCurrentUser, getUserCount } from '@/lib/models/user.model'
import { getDocumentCount } from '@/lib/models/document.model'
import { getTotalFilesSize } from '@/lib/mongodb'
import { FileText, Users, HardDrive, BarChart3, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

export default async function AdminDashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let user = null
  let dbError = null
  let documentCount = 0
  let userCount = 0
  let storageUsed = 0

  try {
    // This will create the user in MongoDB if they don't exist
    user = await syncCurrentUser()
    documentCount = await getDocumentCount()
    userCount = await getUserCount()
    storageUsed = await getTotalFilesSize()
  } catch (error) {
    console.error('Failed to sync user to MongoDB:', error)
    dbError = error instanceof Error ? error.message : 'Database connection failed'
  }

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header with UserButton */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <h1 className="text-lg font-semibold text-emerald-500">Admin</h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-zinc-400 hidden sm:block">
                {user.firstName || user.email}
              </span>
            )}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard: "bg-zinc-900 border-zinc-800",
                  userButtonPopoverActionButton: "hover:bg-zinc-800",
                  userButtonPopoverActionButtonText: "text-zinc-200",
                  userButtonPopoverFooter: "hidden"
                }
              }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-zinc-400 mt-2">Manage documents and users</p>
        </div>

        {dbError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              ⚠️ Database connection issue: {dbError}
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              Make sure MongoDB is running on localhost:27017
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            icon={<FileText className="w-6 h-6" />}
            title="Documents"
            value={documentCount.toString()}
            label="Total uploads"
          />
          <DashboardCard
            icon={<Users className="w-6 h-6" />}
            title="Users"
            value={userCount.toString()}
            label="Registered users"
          />
          <DashboardCard
            icon={<HardDrive className="w-6 h-6" />}
            title="Storage"
            value={formatBytes(storageUsed)}
            label="Files stored"
          />
          <DashboardCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Analytics"
            value="View"
            label="Usage statistics"
          />
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton label="Manage Documents" href="/admin/documents" />
            <ActionButton label="Manage Users" href="/admin/users" />
            <ActionButton label="View Analytics" href="/admin/analytics" />
          </div>
        </section>
      </div>
    </div>
  )
}

function DashboardCard({
  icon,
  title,
  value,
  label
}: {
  icon: React.ReactNode
  title: string
  value: string
  label: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500">
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-zinc-500 mt-1">{label}</p>
    </div>
  )
}

function ActionButton({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="block p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors text-center font-medium"
    >
      {label}
    </Link>
  )
}
