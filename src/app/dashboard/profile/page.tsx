'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  UserIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { formatDateTime } from '@/lib/utils';

interface UploadRecord {
  id: string;
  file_name: string;
  created_at: string;
  ocr_status: string;
  file_size: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'uploads' | 'settings'>('profile');
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);

  // Load uploads when the "Uploads" tab is opened
  useEffect(() => {
    if (activeTab === 'uploads' && uploads.length === 0) {
      fetchUploads();
    }
  }, [activeTab]);

  const fetchUploads = async () => {
    setUploadsLoading(true);
    try {
      const res = await fetch('/api/user/uploads');
      const json = await res.json();
      if (json.success) setUploads(json.data);
    } catch {
      // ignore — empty state shown
    } finally {
      setUploadsLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const tabs = [
    { id: 'profile'  as const, label: 'Profile',  Icon: UserIcon           },
    { id: 'uploads'  as const, label: 'Uploads',  Icon: DocumentTextIcon   },
    { id: 'settings' as const, label: 'Settings', Icon: Cog6ToothIcon      },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile &amp; Settings</h1>
        <p className="text-gray-600">Manage your account and view your portfolio history.</p>
      </div>

      {/* Tab card */}
      <div className="bg-white shadow rounded-lg">
        {/* Tab nav */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.Icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-5">
          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>

              {!isLoaded ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                  Loading account info…
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.firstName ?? ''}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.lastName ?? ''}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm cursor-default"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={user?.primaryEmailAddress?.emailAddress ?? ''}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm cursor-default"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Managed by your authentication provider (Clerk).
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.id ?? ''}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-400 text-xs font-mono cursor-default"
                    />
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                To update your name or email, use the account portal via the avatar menu in the
                top navigation bar.
              </p>
            </div>
          )}

          {/* ── Uploads tab ── */}
          {activeTab === 'uploads' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Portfolio Uploads</h3>

              {uploadsLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                  Loading uploads…
                </div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-10">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No uploads yet.</p>
                  <a
                    href="/dashboard/upload"
                    className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Upload your first portfolio →
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                            {upload.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(upload.created_at)} · {formatSize(upload.file_size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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
                        <button
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete upload"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings tab ── */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy &amp; Data</h3>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Auto-delete uploaded images',
                      desc: 'Automatically delete portfolio screenshots after 30 days',
                      defaultChecked: true,
                    },
                    {
                      label: 'Email notifications',
                      desc: 'Receive updates about your portfolio analysis',
                      defaultChecked: true,
                    },
                    {
                      label: 'Search history tracking',
                      desc: 'Allow your searches to contribute to trending stocks data',
                      defaultChecked: true,
                    },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={setting.defaultChecked}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">Delete all uploads</p>
                      <p className="text-sm text-red-600">
                        Permanently delete all uploaded portfolio screenshots
                      </p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                      Delete All
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">Delete account</p>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
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
