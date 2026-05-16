'use client';

import { ImageSeoEngine } from '@/lib/seo/ImageSeoEngine';
import Link from 'next/link';

export default function AdminSeoImagesPage() {
  const imageHealth = ImageSeoEngine.auditImageSeoHealth();
  const registrySize = ImageSeoEngine.getRegistrySize();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/big-ace/seo" className="text-cyan-400 hover:text-cyan-300">
            ← Back
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">Image SEO</h1>
            <p className="mt-2 text-gray-400">Optimize images for search discovery</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 p-6">
        {/* Health Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-cyan-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Total Images</div>
            <div className="mt-2 text-4xl font-bold text-cyan-400">{imageHealth.totalImages}</div>
            <div className="mt-3 text-xs text-gray-500">Registered for SEO</div>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">With Alt Text</div>
            <div className="mt-2 text-4xl font-bold text-green-400">{imageHealth.imagesWithAlt}</div>
            <div className="mt-3 text-xs text-gray-500">
              {imageHealth.totalImages > 0 ? Math.round((imageHealth.imagesWithAlt / imageHealth.totalImages) * 100) : 0}%
            </div>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">With Captions</div>
            <div className="mt-2 text-4xl font-bold text-yellow-400">{imageHealth.imagesWithCaption}</div>
            <div className="mt-3 text-xs text-gray-500">
              {imageHealth.totalImages > 0 ? Math.round((imageHealth.imagesWithCaption / imageHealth.totalImages) * 100) : 0}%
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Optimization Score</div>
            <div className="mt-2 text-4xl font-bold text-purple-400">{imageHealth.optimizedPercentage}%</div>
            <div className="mt-3 text-xs text-gray-500">Overall image SEO health</div>
          </div>
        </div>

        {/* Overall Health */}
        <div className="rounded-lg border border-cyan-500/30 bg-gray-800/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">Image SEO Health</h2>
              <p className="mt-1 text-gray-400">Overall optimization score</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-cyan-400">{imageHealth.optimizedPercentage}%</div>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
              style={{ width: `${imageHealth.optimizedPercentage}%` }}
            />
          </div>
        </div>

        {/* Optimization Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400">Metadata Coverage</h2>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Alt Text Coverage</span>
                  <span className="text-green-400">
                    {imageHealth.totalImages > 0 ? Math.round((imageHealth.imagesWithAlt / imageHealth.totalImages) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${imageHealth.totalImages > 0 ? (imageHealth.imagesWithAlt / imageHealth.totalImages) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Caption Coverage</span>
                  <span className="text-blue-400">
                    {imageHealth.totalImages > 0 ? Math.round((imageHealth.imagesWithCaption / imageHealth.totalImages) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${imageHealth.totalImages > 0 ? (imageHealth.imagesWithCaption / imageHealth.totalImages) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Structured Data</span>
                  <span className="text-purple-400">
                    {imageHealth.totalImages > 0 ? Math.round((imageHealth.imagesWithStructuredData / imageHealth.totalImages) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{
                      width: `${imageHealth.totalImages > 0 ? (imageHealth.imagesWithStructuredData / imageHealth.totalImages) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-cyan-400">Image Types</h2>
            <div className="mt-4 space-y-2">
              {[
                { type: 'Artist Images', count: 42 },
                { type: 'Event Images', count: 156 },
                { type: 'Article Images', count: 89 },
                { type: 'Billboard Images', count: 34 },
                { type: 'Venue Images', count: 27 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-700/20 px-3 py-2">
                  <span className="text-gray-400">{item.type}</span>
                  <span className="text-cyan-400">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alt Text Best Practices */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-cyan-400">Alt Text Best Practices</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-700/30 p-4">
              <h3 className="font-bold text-green-400">✓ Good Alt Text</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-400">
                <div className="font-mono">"Drake performing live at Madison Square Garden"</div>
                <div className="font-mono">"Neon-lit nightclub dance floor packed with dancers"</div>
                <div className="font-mono">"Hip-hop artist Kendrick Lamar on stage with microphone"</div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-700/30 p-4">
              <h3 className="font-bold text-red-400">✗ Poor Alt Text</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-400">
                <div className="font-mono">"image1.jpg"</div>
                <div className="font-mono">"photo"</div>
                <div className="font-mono">"image"</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {imageHealth.recommendations.length > 0 && (
          <div className="rounded-lg border border-yellow-600 bg-yellow-900/20 p-6">
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

        {/* Image Discovery Guide */}
        <div className="rounded-lg border border-blue-600 bg-blue-900/20 p-6">
          <h2 className="text-xl font-bold text-blue-400">Image Discovery Optimization</h2>
          <div className="mt-4 space-y-3">
            <div>
              <h3 className="font-bold text-blue-400">1. File Names</h3>
              <p className="mt-1 text-sm text-gray-300">Use descriptive, hyphenated filenames: "artist-stage-performance.jpg"</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">2. Alt Attributes</h3>
              <p className="mt-1 text-sm text-gray-300">Include relevant keywords naturally without keyword stuffing</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">3. Captions</h3>
              <p className="mt-1 text-sm text-gray-300">Provide context with image captions for better understanding</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">4. Structured Data</h3>
              <p className="mt-1 text-sm text-gray-300">Add schema.org ImageObject markup with proper metadata</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">5. Image Compression</h3>
              <p className="mt-1 text-sm text-gray-300">Optimize file sizes for faster loading (aim for {"<"}100KB)</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-400">6. Responsive Images</h3>
              <p className="mt-1 text-sm text-gray-300">Use srcset and sizes for different device widths</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
