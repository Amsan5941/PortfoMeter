import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRightIcon, ChartBarIcon, DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">PortfoMeter</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Portfolio
            <span className="text-indigo-600"> Review</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your portfolio screenshot and get instant AI-powered insights. 
            Search stocks, track market movers, and make informed investment decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center">
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center"
              >
                Go to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </SignedIn>
            <Link
              href="/search"
              className="border border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center"
            >
              Search Stocks
              <MagnifyingGlassIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Educational Purposes Only:</strong> All portfolio reviews and stock insights are for educational purposes only and do not constitute financial advice. Please consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to analyze your portfolio
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools to understand your investments and discover new opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Portfolio Upload & Review
              </h3>
              <p className="text-gray-600">
                Upload a screenshot of your portfolio and get AI-powered analysis with insights on diversification, risk, and performance.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Stock Search & Quotes
              </h3>
              <p className="text-gray-600">
                Search for any stock symbol or company name to get real-time quotes, charts, and detailed financial information.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Market Insights
              </h3>
              <p className="text-gray-600">
                Track top market movers, trending stocks, and discover what other investors are searching for.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to analyze your portfolio?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of investors who use PortfoMeter to make better investment decisions.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-white hover:bg-gray-50 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold">
                Start Your Free Analysis
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-gray-50 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">PortfoMeter</h3>
            <p className="text-gray-400 mb-4">
              AI-powered portfolio analysis and stock insights
            </p>
            <div className="text-sm text-gray-500">
              <p>© 2024 PortfoMeter. All rights reserved.</p>
              <p className="mt-2">
                This service is for educational purposes only and does not provide financial advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}