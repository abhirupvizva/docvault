'use client'

import { useState, useMemo } from 'react'
import { Search, Shield, User, Clock, Calendar, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDocuments } from '@/lib/document-context'

function formatDateTime(date: Date | null): string {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getTimeSince(date: Date | null): string {
  if (!date) return 'Never logged in'
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 5) return 'Online now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDateTime(date)
}

export function UserList() {
  const { users } = useDocuments()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === 'admin').length
    const students = total - admins
    const activeToday = users.filter((u) => {
      if (!u.lastLogin) return false
      const today = new Date()
      return u.lastLogin.toDateString() === today.toDateString()
    }).length
    return { total, admins, students, activeToday }
  }, [users])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="text-2xl font-semibold">{stats.students}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-semibold">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Today</p>
            <p className="text-2xl font-semibold">{stats.activeToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        {searchQuery.trim() && ' found'}
      </p>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.map((u) => {
          const isOnline = u.lastLogin && getTimeSince(u.lastLogin) === 'Online now'
          return (
            <Card key={u.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <span className="text-lg font-medium text-muted-foreground">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-doc-published" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-foreground">{u.name}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="size-3.5" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          u.role === 'admin'
                            ? 'border-doc-draft/50 bg-doc-draft/10 text-doc-draft shrink-0'
                            : 'border-muted-foreground/30 shrink-0'
                        }
                      >
                        {u.role === 'admin' ? (
                          <>
                            <Shield className="size-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="size-3 mr-1" />
                            Student
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Last login: {getTimeSince(u.lastLogin)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        Joined: {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  )
}
