"use client";
import Link from 'next/link';
const pages = [
  { href: '/', label: 'Home 1' },
  { href: '/home/2', label: 'Home 2' },
  { href: '/home/3', label: 'Home 3' },
];
export default function PageSwitcher() {
  return (
    <nav style={{ margin: 10 }}>
      {pages.map((page) => (
        <Link key={page.href} href={page.href} style={{ marginRight: 12 }}>
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
