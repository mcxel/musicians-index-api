'use client';

import React from 'react';

interface StructuredDataProps {
  /** Optional page-specific schema (Article, Profile, etc.) rendered alongside the default Organization/Website schema. */
  data?: object;
}

export default function StructuredData({ data }: StructuredDataProps = {}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Musician's Index",
    "url": "https://themusiciansindex.com",
    "logo": "https://themusiciansindex.com/logo.png",
    "sameAs": [
      "https://twitter.com/MusiciansIndex",
      "https://instagram.com/MusiciansIndex"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Musician's Index",
    "url": "https://themusiciansindex.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://themusiciansindex.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      {data && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      )}
    </>
  );
}