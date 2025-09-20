import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
  }

  // Extract only the necessary user data
  const userFirstName = user.firstName || 'Investor';

  // Mock data for demonstration
  const recentUploads = [
    {
      id: '1',
      fileName: 'portfolio_screenshot_1.png',
      uploadedAt: '2024-01-15T10:30:00Z',
      status: 'completed',
      holdingsCount: 12,
    },
    {
      id: '2', 
      fileName: 'portfolio_screenshot_2.png',
      uploadedAt: '2024-01-14T15:45:00Z',
      status: 'processing',
      holdingsCount: 0,
    },
  ];

  const trendingStocks = [
    { symbol: 'AAPL', change: 2.5, changeType: 'up' },
    { symbol: 'TSLA', change: -1.8, changeType: 'down' },
    { symbol: 'NVDA', change: 4.2, changeType: 'up' },
    { symbol: 'MSFT', change: 1.1, changeType: 'up' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userFirstName}!
          </h1>
          <p className="text-gray-600">
            Ready to analyze your portfolio or explore new investment opportunities?
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/upload"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Upload Portfolio
                </h3>
                <p className="text-sm text-gray-500">
                  Get AI-powered analysis of your holdings
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/search"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MagnifyingGlassIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Search Stocks
                </h3>
                <p className="text-sm text-gray-500">
                  Find quotes and analyze individual stocks
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/popular"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Market Movers
                </h3>
                <p className="text-sm text-gray-500">
                  Track trending stocks and top movers
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Portfolio Uploads
            </h3>
            <div className="space-y-3">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {upload.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(upload.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      upload.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {upload.status}
                    </span>
                    {upload.status === 'completed' && (
                      <span className="ml-2 text-xs text-gray-500">
                        {upload.holdingsCount} holdings
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/upload"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Upload new portfolio →
              </Link>
            </div>
          </div>
        </div>

        {/* Trending Stocks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Trending Stocks
            </h3>
            <div className="space-y-3">
              {trendingStocks.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-sm font-medium text-gray-900">
                        {stock.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center text-sm font-medium ${
                      stock.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.changeType === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(stock.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/popular"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                View all trending →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ClockIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Educational Purposes Only
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                All portfolio reviews and stock insights are for educational purposes only and do not constitute financial advice. 
                Please consult with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
