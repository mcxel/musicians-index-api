'use client';

import { SearchConsoleAuthorityEngine } from '@/lib/seo/SearchConsoleAuthorityEngine';
import Link from 'next/link';

export default function AdminSeoSchemaPage() {
  const schemaHealth = SearchConsoleAuthorityEngine.getSchemaHealth();
  const schemaCoverage = SearchConsoleAuthorityEngine.getSchemaCoverage();
  const healthPercentage = SearchConsoleAuthorityEngine.getSchemaHealthPercentage();

  const requiredSchemaTypes = ['MusicGroup', 'Event', 'Article', 'Venue', 'Ticket', 'Organization'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/big-ace/seo" className="text-cyan-400 hover:text-cyan-300">
            ← Back
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">Structured Data (Schema.org)</h1>
            <p className="mt-2 text-gray-400">Monitor and manage rich snippets and schema validation</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 p-6">
        {/* Health Score */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-cyan-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Schema Health</div>
            <div className="mt-2 text-4xl font-bold text-cyan-400">{healthPercentage}%</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${healthPercentage}%` }} />
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Schema Types Implemented</div>
            <div className="mt-2 text-4xl font-bold text-purple-400">{Object.keys(schemaCoverage).length}</div>
            <div className="mt-3 text-xs text-gray-500">of {requiredSchemaTypes.length} required</div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-gray-800/40 p-6">
            <div className="text-sm text-gray-400">Validation Errors</div>
            <div className="mt-2 text-4xl font-bold text-red-400">{schemaHealth.validationErrors}</div>
            <div className="mt-3 text-xs text-gray-500">Found and reported</div>
          </div>
        </div>

        {/* Required Schema Types */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="text-xl font-bold text-cyan-400">Required Schema Types</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {requiredSchemaTypes.map((schemaType) => {
              const count = schemaCoverage[schemaType] || 0;
              const isImplemented = count > 0;

              return (
                <div
                  key={schemaType}
                  className={`rounded-lg border p-4 ${
                    isImplemented ? 'border-green-500/30 bg-green-900/10' : 'border-gray-600/30 bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-300">{schemaType}</div>
                      <div className={`mt-1 text-sm ${isImplemented ? 'text-green-400' : 'text-gray-500'}`}>
                        {isImplemented ? `${count} items` : 'Not implemented'}
                      </div>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${isImplemented ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* MusicGroup */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-bold text-fuchsia-400">MusicGroup Schema</h3>
            <p className="mt-2 text-sm text-gray-400">For artists and performers</p>
            <div className="mt-4 rounded bg-gray-900 p-3 font-mono text-xs text-gray-400">
              {`{
  "@type": "MusicGroup",
  "name": "Artist Name",
  "url": "https://...",
  "image": "https://...",
  "genre": "Hip-Hop"
}`}
            </div>
            <div className={`mt-3 inline-block rounded px-2 py-1 text-xs ${
              schemaCoverage['MusicGroup'] ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {schemaCoverage['MusicGroup'] ? '✓ Implemented' : 'Not implemented'}
            </div>
          </div>

          {/* Event */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-bold text-cyan-400">Event Schema</h3>
            <p className="mt-2 text-sm text-gray-400">For battles and performances</p>
            <div className="mt-4 rounded bg-gray-900 p-3 font-mono text-xs text-gray-400">
              {`{
  "@type": "Event",
  "name": "Event Name",
  "startDate": "2024-01-01",
  "location": "@type: Place",
  "eventStatus": "EventScheduled"
}`}
            </div>
            <div className={`mt-3 inline-block rounded px-2 py-1 text-xs ${
              schemaCoverage['Event'] ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {schemaCoverage['Event'] ? '✓ Implemented' : 'Not implemented'}
            </div>
          </div>

          {/* Article */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-bold text-yellow-400">Article Schema</h3>
            <p className="mt-2 text-sm text-gray-400">For news and editorial</p>
            <div className="mt-4 rounded bg-gray-900 p-3 font-mono text-xs text-gray-400">
              {`{
  "@type": "NewsArticle",
  "headline": "Title",
  "datePublished": "2024-01-01",
  "author": "Author Name",
  "image": "https://..."
}`}
            </div>
            <div className={`mt-3 inline-block rounded px-2 py-1 text-xs ${
              schemaCoverage['Article'] ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {schemaCoverage['Article'] ? '✓ Implemented' : 'Not implemented'}
            </div>
          </div>

          {/* Venue */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-bold text-purple-400">Venue Schema</h3>
            <p className="mt-2 text-sm text-gray-400">For rooms and locations</p>
            <div className="mt-4 rounded bg-gray-900 p-3 font-mono text-xs text-gray-400">
              {`{
  "@type": "Venue",
  "name": "Venue Name",
  "address": "Address",
  "telephone": "Phone",
  "sameAs": "https://..."
}`}
            </div>
            <div className={`mt-3 inline-block rounded px-2 py-1 text-xs ${
              schemaCoverage['Venue'] ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {schemaCoverage['Venue'] ? '✓ Implemented' : 'Not implemented'}
            </div>
          </div>

          {/* Ticket */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-bold text-blue-400">Ticket Schema</h3>
            <p className="mt-2 text-sm text-gray-400">For ticket sales</p>
            <div className="mt-4 rounded bg-gray-900 p-3 font-mono text-xs text-gray-400">
              {`{
  "@type": "Ticket",
  "ticketToken": "ticket-id",
  "ticketedEvent": "Event object",
  "priceCurrency": "USD",
  "price": "15.00"
}`}
            </div>
            <div className={`mt-3 inline-block rounded px-2 py-1 text-xs ${
              schemaCoverage['Ticket'] ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {schemaCoverage['Ticket'] ? '✓ Implemented' : 'Not implemented'}
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="font-bold text-cyan-400">Organization Schema</h3>
            <p className="mt-2 text-sm text-gray-400">For brand and site metadata</p>
            <div className="mt-4 rounded bg-gray-900 p-3 font-mono text-xs text-gray-400">
              {`{
  "@type": "Organization",
  "name": "TMI",
  "logo": "https://...",
  "sameAs": ["twitter", "instagram"],
  "contactPoint": {}
}`}
            </div>
            <div className={`mt-3 inline-block rounded px-2 py-1 text-xs ${
              schemaCoverage['Organization'] ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}>
              {schemaCoverage['Organization'] ? '✓ Implemented' : 'Not implemented'}
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {schemaHealth.errorTypes.length > 0 && (
          <div className="rounded-lg border border-red-600 bg-red-900/20 p-6">
            <h2 className="text-xl font-bold text-red-400">Validation Errors</h2>
            <div className="mt-4 space-y-2">
              {schemaHealth.errorTypes.map((errorType, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-gray-300">{errorType}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Practices */}
        <div className="rounded-lg border border-green-600 bg-green-900/20 p-6">
          <h2 className="text-xl font-bold text-green-400">Schema Best Practices</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400" />
              <span className="text-gray-300">Use JSON-LD format for all structured data</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400" />
              <span className="text-gray-300">Include required properties for each schema type</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400" />
              <span className="text-gray-300">Test with Google Rich Results Test tool</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400" />
              <span className="text-gray-300">Keep schema up-to-date with content changes</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400" />
              <span className="text-gray-300">Validate regularly with schema.org validator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
