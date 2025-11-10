export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-gray-600">
          Welcome to your dashboard. This is a placeholder page that will be populated with content once authentication is implemented.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Quick Stats</h2>
          <p className="text-gray-600 text-sm">
            Analytics and metrics will be displayed here.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Recent Activity</h2>
          <p className="text-gray-600 text-sm">
            Recent user activity will be displayed here.
          </p>
        </div>
      </div>
    </div>
  )
}
