import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { createServerClient } from '@/lib/supabase';

interface UploadRow {
  id: string;
  file_name: string;
  created_at: string;
  ocr_status: string;
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/');
  }

  const userFirstName = user.firstName || 'Investor';

  // Fetch real uploads from Supabase (falls back to empty array if not configured)
  let recentUploads: UploadRow[] = [];
  try {
    const serverClient = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = serverClient as any;
    const { data: userData } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (userData) {
      const { data: uploads } = await db
        .from('uploads')
        .select('id, file_name, created_at, ocr_status')
        .eq('user_id', (userData as { id: string }).id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (uploads) recentUploads = uploads as UploadRow[];
    }
  } catch {
    // Supabase not configured or query failed — show empty state gracefully
  }

  const trendingStocks = [
    { symbol: 'NVDA',  change:  8.45, changeType: 'up'   as const },
    { symbol: 'TSLA',  change:  5.87, changeType: 'up'   as const },
    { symbol: 'AAPL',  change: -3.45, changeType: 'down' as const },
    { symbol: 'MSFT',  change: -2.89, changeType: 'down' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {userFirstName}!
          </h1>
          <p className="text-gray-600">
            Ready to analyze your portfolio or explore new investment opportunities?
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            href: '/dashboard/upload',
            Icon: DocumentTextIcon,
            title: 'Upload Portfolio',
            desc: 'Get AI-powered analysis of your holdings',
          },
          {
            href: '/dashboard/search',
            Icon: MagnifyingGlassIcon,
            title: 'Search Stocks',
            desc: 'Find quotes and analyse individual stocks',
          },
          {
            href: '/dashboard/popular',
            Icon: ChartBarIcon,
            title: 'Market Movers',
            desc: 'Track trending stocks and top movers',
          },
        ].map(({ href, Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5 sm:p-6 flex items-center gap-4">
              <Icon className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent uploads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Portfolio Uploads
            </h3>
            {recentUploads.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No uploads yet.</p>
                <Link
                  href="/dashboard/upload"
                  className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Upload your first portfolio →
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentUploads.map((upload) => (
                    <Link
                      key={upload.id}
                      href={
                        upload.ocr_status === 'completed'
                          ? `/dashboard/portfolio/${upload.id}`
                          : '#'
                      }
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                            {upload.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(upload.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          upload.ocr_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : upload.ocr_status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {upload.ocr_status}
                      </span>
                    </Link>
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
              </>
            )}
          </div>
        </div>

        {/* Trending stocks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Trending Stocks
            </h3>
            <div className="space-y-3">
              {trendingStocks.map((stock) => (
                <Link
                  key={stock.symbol}
                  href="/dashboard/search"
                  onClick={undefined}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{stock.symbol}</span>
                  <span
                    className={`inline-flex items-center text-sm font-medium ${
                      stock.changeType === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.changeType === 'up' ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stock.change)}%
                  </span>
                </Link>
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <ClockIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Educational Purposes Only</h3>
          <p className="mt-1 text-sm text-yellow-700">
            All portfolio reviews and stock insights are for educational purposes only and do not
            constitute financial advice. Please consult with a qualified financial advisor before
            making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
