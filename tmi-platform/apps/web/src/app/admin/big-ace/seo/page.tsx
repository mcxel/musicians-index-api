'use client';

import { SearchConsoleAuthorityEngine } from '@/lib/seo/SearchConsoleAuthorityEngine';
import { ImageSeoEngine } from '@/lib/seo/ImageSeoEngine';
import { RobotsAuthorityEngine } from '@/lib/seo/RobotsAuthorityEngine';

export default function AdminSeoPage() {
  const healthReport = SearchConsoleAuthorityEngine.getCompleteHealthReport();
  const imageHealth = ImageSeoEngine.auditImageSeoHealth();
  const robotsRules = RobotsAuthorityEngine.getRulesSummary();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 p-6">
        <h1 className="text-4xl font-bold text-cyan-400">Search Console Observatory</h1>
        <p className="mt-2 text-gray-400">Monitor search performance, indexing health, and SEO authority</p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <nav className="flex gap-4 text-sm">
          <a href="/admin/seo" className="border-b-2 border-cyan-400 px-3 py-2 text-cyan-400">
            Overview
          </a>
          <a href="/admin/seo/indexing" className="px-3 py-2 text-gray-400 hover:text-cyan-400">
            Indexing
          </a>
          <a href="/admin/seo/errors" className="px-3 py-2 text-gray-400 hover:text-cyan-400">
            Crawl Errors
          </a>
          <a href="/admin/seo/schema" className="px-3 py-2 text-gray-400 hover:text-cyan-400">
            Schema
          </a>
          <a href="/admin/seo/images" className="px-3 py-2 text-gray-400 hover:text-cyan-400">
            Images
          </a>
        </nav>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-4">
        <div className="rounded-lg border border-cyan-500/30 bg-gray-800/40 p-6 backdrop-blur-sm">
          <div className="text-sm text-gray-400">Overall Health Score</div>
          <div className="mt-2 text-4xl font-bold text-cyan-400">{healthReport.healthScore}/100</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
              style={{ width: `${healthReport.healthScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-fuchsia-500/30 bg-gray-800/40 p-6 backdrop-blur-sm">
          <div className="text-sm text-gray-400">Pages Indexed</div>
          <div className="mt-2 text-4xl font-bold text-fuchsia-400">{healthReport.indexing.totalIndexed}</div>
          <div className="mt-2 text-xs text-gray-500">
            {healthReport.indexing.coverageDetails.valid} valid • {healthReport.indexing.coverageDetails.errors} errors
          </div>
        </div>

        <div className="rounded-lg border border-yellow-500/30 bg-gray-800/40 p-6 backdrop-blur-sm">
          <div className="text-sm text-gray-400">Crawl Errors</div>
          <div className="mt-2 text-4xl font-bold text-yellow-400">{healthReport.crawlErrors.total}</div>
          <div className="mt-2 text-xs text-gray-500">Last crawled: {new Date(healthReport.indexing.lastCrawl).toLocaleDateString()}</div>
        </div>

        <div className="rounded-lg border border-purple-500/30 bg-gray-800/40 p-6 backdrop-blur-sm">
          <div className="text-sm text-gray-400">Schema Types</div>
          <div className="mt-2 text-4xl font-bold text-purple-400">{Object.keys(healthReport.schema.schemaTypes).length}</div>
          <div className="mt-2 text-xs text-gray-500">{Object.values(healthReport.schema.schemaTypes).reduce((a: number, b: number) => a + b, 0)} total items</div>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        {/* Indexing Status */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-cyan-400">Indexing Status</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valid Pages</span>
              <span className="text-lg font-bold text-green-400">{healthReport.indexing.coverageDetails.valid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Excluded</span>
              <span className="text-lg font-bold text-yellow-400">{healthReport.indexing.coverageDetails.excluded}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Errors</span>
              <span className="text-lg font-bold text-red-400">{healthReport.indexing.coverageDetails.errors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pending</span>
              <span className="text-lg font-bold text-blue-400">{healthReport.indexing.coverageDetails.pending}</span>
            </div>
          </div>
        </div>

        {/* Search Performance */}
        {healthReport.searchPerformance.current && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400">Search Performance</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Queries</span>
                <span className="text-lg font-bold text-cyan-400">{healthReport.searchPerformance.current.queries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Impressions</span>
                <span className="text-lg font-bold text-cyan-400">{healthReport.searchPerformance.current.impressions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Clicks</span>
                <span className="text-lg font-bold text-cyan-400">{healthReport.searchPerformance.current.clicks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avg Position</span>
                <span className="text-lg font-bold text-cyan-400">{healthReport.searchPerformance.current.averagePosition.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">CTR</span>
                <span className="text-lg font-bold text-cyan-400">{healthReport.searchPerformance.current.ctr.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crawler Rules */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-fuchsia-400">Crawler Permissions</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-sm text-gray-400">Allowed Routes</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {robotsRules.allowed.map((route) => (
                  <div key={route} className="rounded bg-green-900/20 px-2 py-1 text-xs text-green-400">
                    {route}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Blocked Routes</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {robotsRules.blocked.map((route) => (
                  <div key={route} className="rounded bg-red-900/20 px-2 py-1 text-xs text-red-400">
                    {route}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image SEO */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-cyan-400">Image SEO Health</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Images</span>
              <span className="text-lg font-bold text-cyan-400">{imageHealth.totalImages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">With Alt Text</span>
              <span className="text-lg font-bold text-green-400">{imageHealth.imagesWithAlt}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">With Captions</span>
              <span className="text-lg font-bold text-green-400">{imageHealth.imagesWithCaption}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Optimization Score</span>
              <span className="text-lg font-bold text-cyan-400">{imageHealth.optimizedPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {healthReport.schema.errorTypes.length > 0 && (
        <div className="m-6 rounded-lg border border-yellow-600 bg-yellow-900/20 p-6">
          <h2 className="text-xl font-bold text-yellow-400">Recommendations</h2>
          <div className="mt-4 space-y-2">
            {imageHealth.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
