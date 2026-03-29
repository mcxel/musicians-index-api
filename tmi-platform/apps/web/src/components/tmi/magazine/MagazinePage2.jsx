import React from 'react';
import { MagazineLayout } from './MagazineLayout';

const pages = [
  {
    id: 'cover-1',
    type: 'COVER',
    pageNumber: 1,
    title: 'The Musician\'s Index',
    content: React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          color: '#fff',
          fontFamily: 'var(--font-display, Orbitron, sans-serif)',
        },
      },
      React.createElement('h2', null, 'TMI Magazine — Issue Preview'),
    ),
  },
  {
    id: 'article-2',
    type: 'ARTICLE',
    pageNumber: 2,
    title: 'Phase C Artist Spotlight',
    content: React.createElement(
      'div',
      {
        style: {
          padding: '2rem',
          color: '#fff',
        },
      },
      React.createElement('h3', null, 'Artist → Article sequencing ready'),
      React.createElement(
        'p',
        null,
        'This spread is a controlled integration placeholder using the imported magazine layout engine.',
      ),
    ),
  },
];

export default function MagazinePage2() {
  return <MagazineLayout pages={pages} initialPage={0} />;
}
