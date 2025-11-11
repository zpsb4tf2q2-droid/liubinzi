'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Card, CardBody } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface PostFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    title: string
    content: string
    status: 'draft' | 'published'
  }
  onSubmit: (title: string, content: string, status: 'draft' | 'published') => Promise<{ success: boolean; postId?: string; error?: string }>
  onDelete?: () => Promise<{ success: boolean; error?: string }>
}

export default function PostForm({ mode, initialData, onSubmit, onDelete }: PostFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less'
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required'
    } else if (content.length > 10000) {
      newErrors.content = 'Content must be 10,000 characters or less'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validate()) {
      return
    }

    startTransition(async () => {
      const result = await onSubmit(title, content, status)
      
      if (result.success) {
        setLastSaved(new Date())
        showToast(
          'success',
          mode === 'create' 
            ? `Post ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
            : `Post updated successfully!`
        )
        
        if (mode === 'create' && result.postId) {
          router.push(`/dashboard`)
        } else if (mode === 'edit') {
          router.refresh()
        }
      } else {
        showToast('error', result.error || 'An error occurred')
      }
    })
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    const result = await onDelete()
    
    if (result.success) {
      showToast('success', 'Post deleted successfully!')
      router.push('/dashboard')
    } else {
      showToast('error', result.error || 'Failed to delete post')
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardBody>
        <form className="space-y-6">
          <Input
            label="Title"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) {
                setErrors({ ...errors, title: undefined })
              }
            }}
            error={errors.title}
            required
            disabled={isPending || isDeleting}
            maxLength={200}
          />

          <Textarea
            label="Content"
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (errors.content) {
                setErrors({ ...errors, content: undefined })
              }
            }}
            error={errors.content}
            required
            disabled={isPending || isDeleting}
            rows={12}
            maxLength={10000}
            helperText={`${content.length} / 10,000 characters`}
          />

          {lastSaved && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isPending || isDeleting}
              variant="secondary"
              className="flex-1 sm:flex-initial"
            >
              {isPending ? 'Saving...' : 'Save as Draft'}
            </Button>
            
            <Button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isPending || isDeleting}
              className="flex-1 sm:flex-initial"
            >
              {isPending ? 'Publishing...' : 'Publish'}
            </Button>

            <div className="flex-1 sm:flex-initial sm:ml-auto flex gap-3">
              <Button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={isPending || isDeleting}
                variant="ghost"
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>

              {mode === 'edit' && onDelete && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending || isDeleting}
                  variant="danger"
                  className="flex-1 sm:flex-initial"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
