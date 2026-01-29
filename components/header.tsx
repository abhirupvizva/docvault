'use client'

import { BookOpen, Plus, User, Shield, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDocuments } from '@/lib/document-context'
import { cn } from '@/lib/utils'

export type TabType = 'materials' | 'users'

interface HeaderProps {
  onUploadClick: () => void
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Header({ onUploadClick, activeTab, onTabChange }: HeaderProps) {
  const { user, isAdmin } = useDocuments()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">StudyVault</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Study Materials</p>
            </div>
          </div>

          {/* Navigation Tabs (Admin Only) */}
          {isAdmin && (
            <nav className="hidden md:flex items-center gap-1 rounded-lg bg-secondary p-1">
              <button
                onClick={() => onTabChange('materials')}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeTab === 'materials'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <FileText className="size-4" />
                Materials
              </button>
              <button
                onClick={() => onTabChange('users')}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeTab === 'users'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="size-4" />
                Users
              </button>
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <Badge
              variant="outline"
              className={
                isAdmin
                  ? 'border-doc-draft/50 bg-doc-draft/10 text-doc-draft'
                  : 'border-muted-foreground/30'
              }
            >
              {isAdmin ? (
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

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.name}</span>
            </div>

            {/* Upload Button (Admin Only) */}
            {isAdmin && activeTab === 'materials' && (
              <Button onClick={onUploadClick} className="gap-2">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav (Admin Only) */}
        {isAdmin && (
          <nav className="flex md:hidden items-center gap-1 pb-3 -mt-1">
            <button
              onClick={() => onTabChange('materials')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === 'materials'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="size-4" />
              Materials
            </button>
            <button
              onClick={() => onTabChange('users')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === 'users'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="size-4" />
              Users
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
