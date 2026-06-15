"use client";
import { useParams } from 'next/navigation';
import ProfileLobbyRuntime from '@/components/profile/ProfileLobbyRuntime';

export default function FanProfilePage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : "fan";
  const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <ProfileLobbyRuntime
      role="fan"
      displayName={displayName}
      userId={slug}
      bio={`Fan profile for ${displayName} on The Musician's Index.`}
      stats={{ followers: 0, xp: 0 }}
    />
  );
}
