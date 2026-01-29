'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import {
  Users,
  Shield,
  ShieldOff,
  Home,
  ArrowLeft,
  Loader2,
  Mail,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  _id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  role: 'admin' | 'user'
  createdAt: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function AdminUsersPage() {
  const { isLoaded } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      fetchUsers()
    }
  }, [isLoaded, fetchUsers])

  const handleToggleRole = async (clerkId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    if (newRole === 'admin' && !confirm('Make this user an admin?')) return
    if (newRole === 'user' && !confirm('Remove admin privileges from this user?')) return

    try {
      const res = await fetch(`/api/users/${clerkId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
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
            <h1 className="text-lg font-semibold">Users</h1>
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <p className="text-zinc-400 mt-1">{users.length} registered users</p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Users className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No users yet</h3>
            <p className="text-zinc-500">Users will appear here when they sign up</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">User</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 hidden md:table-cell">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400 hidden lg:table-cell">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Role</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt={user.firstName || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-zinc-500 md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-zinc-500/10 text-zinc-400'
                        }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleToggleRole(user.clerkId, user.role)}
                          className={`p-2 rounded-lg transition-colors ${user.role === 'admin'
                              ? 'text-amber-500 hover:bg-amber-500/10'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        >
                          {user.role === 'admin' ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
