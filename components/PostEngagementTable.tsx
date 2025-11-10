'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/components/ThemeProvider'

interface PostEngagement {
  id: string
  title: string
  comments: number
  likes: number
}

interface PostEngagementTableProps {
  posts: PostEngagement[]
}

export default function PostEngagementTable({ posts }: PostEngagementTableProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (posts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No posts with engagement data</p>
      </div>
    )
  }

  const chartData = posts.slice(0, 5).map(post => ({
    name: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
    Comments: post.comments,
    Likes: post.likes,
  }))

  const textColor = isDark ? '#9CA3AF' : '#6B7280'
  const gridColor = isDark ? '#374151' : '#E5E7EB'

  return (
    <div className="space-y-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              stroke={textColor}
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke={textColor}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${gridColor}`,
                borderRadius: '8px',
                color: isDark ? '#F9FAFB' : '#111827',
              }}
              labelStyle={{
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: '12px',
                color: textColor,
              }}
            />
            <Bar dataKey="Comments" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Likes" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {posts.map((post, index) => (
          <div 
            key={post.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                #{index + 1}
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {post.title}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {post.comments}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {post.likes}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
