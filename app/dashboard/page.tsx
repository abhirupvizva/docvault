import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { syncCurrentUser } from '@/lib/models/user.model'
import { getDocumentCount } from '@/lib/models/document.model'
import { FileText, Download, Star, Clock, Home } from 'lucide-react'
import Link from 'next/link'
import { DocumentBrowser } from '@/components/document-browser'

export default async function UserDashboard() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let user = null
  let dbError = null
  let documentCount = 0

  try {
    // This will create the user in MongoDB if they don't exist
    user = await syncCurrentUser()
    documentCount = await getDocumentCount('enabled')
  } catch (error) {
    console.error('Failed to sync user to MongoDB:', error)
    dbError = error instanceof Error ? error.message : 'Database connection failed'
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
            <h1 className="text-lg font-semibold">Dashboard</h1>
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
          <h2 className="text-3xl font-bold">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}
          </h2>
          <p className="text-zinc-400 mt-2">Access your study materials</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardCard
            icon={<FileText className="w-6 h-6" />}
            title="Documents"
            value={documentCount.toString()}
            label="Available"
          />
          <DashboardCard
            icon={<Download className="w-6 h-6" />}
            title="Downloads"
            value="—"
            label="This month"
          />
          <DashboardCard
            icon={<Star className="w-6 h-6" />}
            title="Favorites"
            value="—"
            label="Coming soon"
          />
          <DashboardCard
            icon={<Clock className="w-6 h-6" />}
            title="Recent"
            value="—"
            label="Coming soon"
          />
        </div>

        {/* Document Browser */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Available Documents</h2>
          <DocumentBrowser />
        </section>

        {user?.role === 'admin' && (
          <section className="mt-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Go to Admin Dashboard →
            </Link>
          </section>
        )}
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
