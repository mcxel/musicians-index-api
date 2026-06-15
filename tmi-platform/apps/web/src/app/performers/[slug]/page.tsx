"use client";
import { useParams } from 'next/navigation';
import ProfileLobbyRuntime from '@/components/profile/ProfileLobbyRuntime';

export default function PerformerProfilePage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : "performer";
  const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <ProfileLobbyRuntime
      role="performer"
      displayName={displayName}
      userId={slug}
      bio={`Performer profile for ${displayName} on The Musician's Index.`}
      stats={{ followers: 0, xp: 0 }}
    />
  );
}
