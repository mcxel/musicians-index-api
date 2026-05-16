'use client';

import { SearchConsoleAuthorityEngine } from '@/lib/seo/SearchConsoleAuthorityEngine';
import Link from 'next/link';

export default function AdminSeoIndexingPage() {
  const indexingStatus = SearchConsoleAuthorityEngine.getIndexingStatus();
  const healthScore = SearchConsoleAuthorityEngine.getIndexingHealth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/big-ace/seo" className="text-cyan-400 hover:text-cyan-300">
            ← Back
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">Indexing Status</h1>
            <p className="mt-2 text-gray-400">Monitor how Google crawls and indexes your pages</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 p-6">
        {/* Coverage Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-green-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Valid & Indexed</div>
            <div className="mt-2 text-4xl font-bold text-green-400">{indexingStatus.coverageDetails.valid}</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full bg-green-500" />
            </div>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Excluded</div>
            <div className="mt-2 text-4xl font-bold text-yellow-400">{indexingStatus.coverageDetails.excluded}</div>
            <div className="mt-3 text-xs text-gray-500">Not counted in index</div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Errors</div>
            <div className="mt-2 text-4xl font-bold text-red-400">{indexingStatus.coverageDetails.errors}</div>
            <div className="mt-3 text-xs text-gray-500">Needs fixing</div>
          </div>

          <div className="rounded-lg border border-blue-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Pending</div>
            <div className="mt-2 text-4xl font-bold text-blue-400">{indexingStatus.coverageDetails.pending}</div>
            <div className="mt-3 text-xs text-gray-500">Awaiting crawl</div>
          </div>
        </div>

        {/* Health Score */}
        <div className="rounded-lg border border-cyan-500/30 bg-gray-800/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">Indexing Health</h2>
              <p className="mt-1 text-gray-400">Percentage of pages successfully indexed</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-cyan-400">{healthScore}%</div>
              <div className="mt-2 text-sm text-gray-400">Last crawl: {new Date(indexingStatus.lastCrawl).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${healthScore}%` }} />
          </div>
        </div>

        {/* Coverage Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400">Coverage Status</h2>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Valid</span>
                  <span className="text-green-400">
                    {((indexingStatus.coverageDetails.valid /
                      (indexingStatus.coverageDetails.valid + indexingStatus.coverageDetails.errors)) *
                      100).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${
                        (indexingStatus.coverageDetails.valid /
                          (indexingStatus.coverageDetails.valid + indexingStatus.coverageDetails.errors)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Errors</span>
                  <span className="text-red-400">
                    {((indexingStatus.coverageDetails.errors /
                      (indexingStatus.coverageDetails.valid + indexingStatus.coverageDetails.errors)) *
                      100).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${
                        (indexingStatus.coverageDetails.errors /
                          (indexingStatus.coverageDetails.valid + indexingStatus.coverageDetails.errors)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400">Status Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Coverage Status</span>
                <span className="rounded-full bg-green-900/30 px-3 py-1 text-sm text-green-400">{indexingStatus.coverageStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Indexed</span>
                <span className="font-bold text-cyan-400">{indexingStatus.totalIndexed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-sm text-gray-400">{new Date(indexingStatus.lastCrawl).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indexing Routes */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-cyan-400">High Priority Routes</h2>
          <div className="mt-4 space-y-2">
            {[
              { route: '/', priority: 'Critical', status: 'Indexed' },
              { route: '/events', priority: 'Critical', status: 'Indexed' },
              { route: '/artists', priority: 'High', status: 'Indexed' },
              { route: '/global', priority: 'High', status: 'Indexed' },
              { route: '/magazine', priority: 'Medium', status: 'Indexed' },
              { route: '/billboards', priority: 'Medium', status: 'Indexed' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-700/30 px-4 py-3">
                <div>
                  <div className="font-mono text-cyan-400">{item.route}</div>
                  <div className="text-xs text-gray-500">Priority: {item.priority}</div>
                </div>
                <div className="rounded-full bg-green-900/30 px-3 py-1 text-sm text-green-400">{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="rounded-lg border border-blue-600 bg-blue-900/20 p-6">
          <h2 className="text-xl font-bold text-blue-400">Optimization Tips</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-gray-300">Ensure all public routes are included in sitemap.xml</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-gray-300">Fix any crawl errors reported in Google Search Console</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-gray-300">Keep robots.txt updated with proper permissions</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-gray-300">Monitor crawl budget to prioritize important pages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
