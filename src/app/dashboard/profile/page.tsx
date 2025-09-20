'use client';

import { useState } from 'react';
import { UserIcon, DocumentTextIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '@/lib/utils';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'uploads' | 'settings'>('profile');

  // Mock data for demonstration
  const mockUploads = [
    {
      id: '1',
      fileName: 'portfolio_screenshot_1.png',
      uploadedAt: '2024-01-15T10:30:00Z',
      status: 'completed',
      holdingsCount: 12,
      fileSize: 2.4,
    },
    {
      id: '2',
      fileName: 'portfolio_screenshot_2.png',
      uploadedAt: '2024-01-14T15:45:00Z',
      status: 'processing',
      holdingsCount: 0,
      fileSize: 1.8,
    },
    {
      id: '3',
      fileName: 'portfolio_screenshot_3.png',
      uploadedAt: '2024-01-13T09:20:00Z',
      status: 'completed',
      holdingsCount: 8,
      fileSize: 3.1,
    },
  ];

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB} MB`;
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and view your portfolio uploads.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'uploads'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Uploads
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Settings
              </div>
            </button>
          </nav>
        </div>

        <div className="px-6 py-5">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue="Doe"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue="john.doe@example.com"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email address is managed by your authentication provider.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Portfolio Uploads
                </h3>
                <div className="space-y-3">
                  {mockUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {upload.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(upload.uploadedAt)} • {formatFileSize(upload.fileSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          upload.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : upload.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {upload.status}
                        </span>
                        {upload.status === 'completed' && (
                          <span className="text-xs text-gray-500">
                            {upload.holdingsCount} holdings
                          </span>
                        )}
                        <button className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {mockUploads.length === 0 && (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No uploads yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Upload your first portfolio screenshot to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Privacy & Data Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Auto-delete uploaded images
                      </p>
                      <p className="text-sm text-gray-500">
                        Automatically delete uploaded portfolio screenshots after 30 days
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Email notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Receive email updates about your portfolio analysis
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Search history tracking
                      </p>
                      <p className="text-sm text-gray-500">
                        Allow your searches to contribute to trending stocks data
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md">
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Delete all uploads
                      </p>
                      <p className="text-sm text-red-700">
                        Permanently delete all your uploaded portfolio screenshots
                      </p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm">
                      Delete All
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Delete account
                      </p>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
