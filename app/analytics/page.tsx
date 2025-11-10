import { redirect } from 'next/navigation'
import { getAnalytics, getUserRole } from '@/lib/actions/analytics'
import { Card, CardBody, CardHeader } from '@/components/ui'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import AnalyticsKPIs from '@/components/AnalyticsKPIs'
import PostEngagementTable from '@/components/PostEngagementTable'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function AnalyticsPage() {
  const userRole = await getUserRole()
  
  if (!userRole) {
    redirect('/login')
  }

  const analytics = await getAnalytics()

  if (!analytics) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Content and engagement insights</p>
        </div>
        
        <Card>
          <CardBody>
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Unable to load analytics
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Please try again later or contact support if the issue persists.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  const hasData = analytics.totalPosts > 0 || analytics.totalComments > 0 || analytics.totalLikes > 0

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Content and engagement insights</p>
      </div>

      {!hasData ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No data yet
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Start creating posts and engaging with your audience to see analytics here.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <AnalyticsKPIs analytics={analytics} />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Activity Timeline (Last 30 Days)
                </h2>
              </CardHeader>
              <CardBody>
                <AnalyticsCharts 
                  activityTimeline={analytics.activityTimeline}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Top Posts by Engagement
                </h2>
              </CardHeader>
              <CardBody>
                <PostEngagementTable 
                  posts={analytics.postsWithEngagement}
                />
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
