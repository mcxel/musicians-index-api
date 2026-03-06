"use client";

import { useState } from 'react';
import type { UserPublic, ArtistPublic } from '@tmi/contracts';

type Props = {
  users: UserPublic[];
  artists: ArtistPublic[];
};

export function UserManagement({ users, artists }: Props) {
  // State for Add Music Link form
  const [linkArtistId, setLinkArtistId] = useState<string>(artists[0]?.id || '');
  const [platform, setPlatform] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [linkMessage, setLinkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for Create Artist form
  const [createUserId, setCreateUserId] = useState<string>(users[0]?.id || '');
  const [artistName, setArtistName] = useState<string>('');
  const [artistBio, setArtistBio] = useState<string>('');
  const [artistMessage, setArtistMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkMessage(null);

    const response = await fetch('/api/music-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId: linkArtistId, platform, url }),
    });
    const result = await response.json();
    if (response.ok) {
      setLinkMessage({ type: 'success', text: 'Successfully added music link!' });
      setPlatform('');
      setUrl('');
    } else {
      setLinkMessage({ type: 'error', text: `Failed to add link: ${result.message}` });
    }
  };

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtistMessage(null);

    const response = await fetch('/api/artists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: createUserId, name: artistName, bio: artistBio }),
    });
    const result = await response.json();
    if (response.ok) {
      setArtistMessage({ type: 'success', text: `Successfully created artist profile for ${artistName}!` });
      setArtistName('');
      setArtistBio('');
      // Ideally, we would refresh the page or update state here to reflect the new artist
    } else {
      setArtistMessage({ type: 'error', text: `Failed to create artist: ${result.message}` });
    }
  };


  return (
    <div className="space-y-12">
      {/* Section 1: Create Artist Profile */}
      <div>
        <h2 className="text-2xl font-semibold text-purple-300 mb-4">Create Artist Profile</h2>
        <form onSubmit={handleArtistSubmit} className="bg-white/5 p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-300 mb-1">User Account</label>
            <select
              id="user-select"
              value={createUserId}
              onChange={(e) => setCreateUserId(e.target.value)}
              className="w-full bg-white/10 p-2 rounded-md border border-purple-400/30"
            >
              {users.filter(u => u.role === 'USER').map((user) => (
                <option key={user.id} value={user.id}>{user.name || user.email}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="artist-name" className="block text-sm font-medium text-gray-300 mb-1">Artist Name</label>
            <input
              type="text"
              id="artist-name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="The artist's public name"
              className="w-full bg-white/10 p-2 rounded-md border border-purple-400/30"
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="artist-bio" className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
            <textarea
              id="artist-bio"
              value={artistBio}
              onChange={(e) => setArtistBio(e.target.value)}
              rows={3}
              placeholder="A short biography for the artist"
              className="w-full bg-white/10 p-2 rounded-md border border-purple-400/30"
            />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-white font-semibold">
              Create Artist
            </button>
          </div>
        </form>
        {artistMessage && (
          <div className={`mt-4 text-sm ${artistMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {artistMessage.text}
          </div>
        )}
      </div>

      {/* Section 2: Add Music Link */}
      <div>
        <h2 className="text-2xl font-semibold text-purple-300 mb-4">Add Music Link</h2>
        <form onSubmit={handleLinkSubmit} className="bg-white/5 p-6 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">Artist</label>
            <select
              id="artist"
              value={linkArtistId}
              onChange={(e) => setLinkArtistId(e.target.value)}
              className="w-full bg-white/10 p-2 rounded-md border border-purple-400/30"
            >
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
            <input
              type="text"
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g., Spotify"
              className="w-full bg-white/10 p-2 rounded-md border border-purple-400/30"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="w-full bg-white/10 p-2 rounded-md border border-purple-400/30"
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-full text-white font-semibold"
            >
              Add Link
            </button>
          </div>
        </form>
        {linkMessage && (
          <div className={`mt-4 text-sm ${linkMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {linkMessage.text}
          </div>
        )}
      </div>

      {/* Section 3: User List */}
      <div>
        <h2 className="text-2xl font-semibold text-purple-300 mb-4">User Management</h2>
        <div className="bg-white/5 p-4 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-purple-400/20">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/10">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'ADMIN' ? 'bg-red-500' : user.role === 'STAFF' ? 'bg-blue-500' : user.role === 'ARTIST' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-2">{new Date(user.emailVerified || '').toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
