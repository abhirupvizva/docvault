'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { UserButton } from '@clerk/nextjs'

interface Category {
  _id: string
  name: string
  description?: string
  slug: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories'

      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to save category')
      }

      await fetchCategories()
      setOpen(false)
      resetForm()
      toast.success(editingCategory ? 'Category updated' : 'Category created')
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An error occurred')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete category')

      await fetchCategories()
      toast.success('Category deleted')
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || '' })
    setOpen(true)
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Admin
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <h1 className="text-lg font-semibold text-emerald-500">Categories</h1>
          </div>

          <div className="flex items-center gap-4">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Manage Categories</h2>
            <p className="text-zinc-400 mt-2">Create and organize document categories</p>
          </div>
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {editingCategory ? 'Update category details below.' : 'Create a new category for documents.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-200">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Science, Math"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-200">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500 resize-none"
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-zinc-800 text-zinc-300">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Slug</TableHead>
                  <TableHead className="text-zinc-400">Description</TableHead>
                  <TableHead className="text-zinc-400 w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                      No categories found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category._id} className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-zinc-500 font-mono text-sm">{category.slug}</TableCell>
                      <TableCell className="text-zinc-400 truncate max-w-[300px]">
                        {category.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category._id)}
                            className="h-8 w-8 hover:bg-red-900/20 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
