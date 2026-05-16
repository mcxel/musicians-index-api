'use client';

import { SearchConsoleAuthorityEngine } from '@/lib/seo/SearchConsoleAuthorityEngine';
import Link from 'next/link';

export default function AdminSeoErrorsPage() {
  const crawlErrors = SearchConsoleAuthorityEngine.getCrawlErrors(50);
  const errorStats = SearchConsoleAuthorityEngine.getCrawlErrorStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/big-ace/seo" className="text-cyan-400 hover:text-cyan-300">
            ← Back
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-red-400">Crawl Errors</h1>
            <p className="mt-2 text-gray-400">Errors encountered during crawling and indexing</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 p-6">
        {/* Error Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-lg border border-red-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Total Errors</div>
            <div className="mt-2 text-4xl font-bold text-red-400">{errorStats.total}</div>
          </div>

          {Object.entries(errorStats.byType).map(([type, count]) => {
            const colorMap: Record<string, string> = {
              NotFound: 'text-red-400 border-red-500/30',
              ServerError: 'text-orange-400 border-orange-500/30',
              Soft404: 'text-yellow-400 border-yellow-500/30',
              Redirect: 'text-blue-400 border-blue-500/30',
              Other: 'text-gray-400 border-gray-500/30',
            };

            return (
              <div key={type} className={`rounded-lg border bg-gray-800/40 p-6 ${colorMap[type]}`}>
                <div className="text-sm text-gray-400">{type}</div>
                <div className={`mt-2 text-4xl font-bold ${colorMap[type]}`}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Error Timeline */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-cyan-400">Error Timeline</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Oldest Error</span>
              <span className="text-cyan-400">{errorStats.oldestError ? new Date(errorStats.oldestError).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Newest Error</span>
              <span className="text-cyan-400">{errorStats.newestError ? new Date(errorStats.newestError).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Error List */}
        {crawlErrors.length > 0 ? (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400">Recent Errors</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-sm text-gray-400">
                    <th className="pb-3 px-4">URL</th>
                    <th className="pb-3 px-4">Error Type</th>
                    <th className="pb-3 px-4">First Detected</th>
                    <th className="pb-3 px-4">Last Detected</th>
                    <th className="pb-3 px-4">Detected By</th>
                  </tr>
                </thead>
                <tbody>
                  {crawlErrors.map((error, idx) => {
                    const typeColorMap: Record<string, string> = {
                      NotFound: 'text-red-400',
                      ServerError: 'text-orange-400',
                      Soft404: 'text-yellow-400',
                      Redirect: 'text-blue-400',
                      Other: 'text-gray-400',
                    };

                    return (
                      <tr key={idx} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                        <td className="px-4 py-3">
                          <code className="text-xs text-cyan-400 break-all">{error.url}</code>
                        </td>
                        <td className={`px-4 py-3 font-mono text-sm ${typeColorMap[error.errorType]}`}>{error.errorType}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{new Date(error.firstCrawled).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{new Date(error.lastCrawled).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{error.detectedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-green-600 bg-green-900/20 p-6 text-center">
            <div className="text-lg font-bold text-green-400">No Crawl Errors Detected</div>
            <p className="mt-2 text-gray-400">Your site is crawling cleanly.</p>
          </div>
        )}

        {/* Error Resolution Tips */}
        <div className="rounded-lg border border-blue-600 bg-blue-900/20 p-6">
          <h2 className="text-xl font-bold text-blue-400">Error Resolution Guide</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-bold text-blue-400">404 Not Found</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                <li>• Check if URL exists</li>
                <li>• Update links pointing to it</li>
                <li>• Create redirect if moved</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">Server Error (5xx)</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                <li>• Check server health</li>
                <li>• Review error logs</li>
                <li>• Fix backend issues</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">Soft 404</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                <li>• Returns 200 but no content</li>
                <li>• Return proper 404 status</li>
                <li>• Or populate with content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">Redirect Chains</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                <li>• Point directly to final URL</li>
                <li>• Avoid multiple redirects</li>
                <li>• Update internal links</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
