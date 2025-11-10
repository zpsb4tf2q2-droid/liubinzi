'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/components/ThemeProvider'

interface ActivityTimelineItem {
  date: string
  posts: number
  comments: number
  likes: number
}

interface AnalyticsChartsProps {
  activityTimeline: ActivityTimelineItem[]
}

export default function AnalyticsCharts({ activityTimeline }: AnalyticsChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const chartData = activityTimeline.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Posts: item.posts,
    Comments: item.comments,
    Likes: item.likes,
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No activity data available</p>
      </div>
    )
  }

  const textColor = isDark ? '#9CA3AF' : '#6B7280'
  const gridColor = isDark ? '#374151' : '#E5E7EB'

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            stroke={textColor}
            style={{ fontSize: '12px' }}
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
          <Line 
            type="monotone" 
            dataKey="Posts" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="Comments" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            dot={{ fill: '#8B5CF6', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="Likes" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={{ fill: '#EF4444', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
