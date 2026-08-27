import { resolveRoleEntry, getRoleEntryProfile, LIVE_PARTICIPANT_ROLES } from '@/lib/live/RoleEntryMap';

describe('resolveRoleEntry', () => {
  const roomId = 'room-antoine-1234567890';
  const liveSessionId = 'room-antoine-1234567890';

  test('every role resolves into the SAME roomId + liveSessionId for one live session', () => {
    for (const role of LIVE_PARTICIPANT_ROLES) {
      const entry = resolveRoleEntry(role, roomId, liveSessionId, false);
      expect(entry.roomId).toBe(roomId);
      expect(entry.liveSessionId).toBe(liveSessionId);
    }
  });

  test('roles differ only by entryZone/spawnAnchor/presenceMode/capabilities/hudPolicy, never by room', () => {
    const fan = resolveRoleEntry('fan', roomId, liveSessionId, false);
    const performer = resolveRoleEntry('performer', roomId, liveSessionId, false);
    expect(fan.roomId).toBe(performer.roomId);
    expect(fan.liveSessionId).toBe(performer.liveSessionId);
    expect(fan.entryZone).not.toBe(performer.entryZone);
    expect(fan.hudPolicy).not.toBe(performer.hudPolicy);
  });

  test('fan public resolves correctly', () => {
    const entry = resolveRoleEntry('fan', roomId, liveSessionId, false);
    expect(entry).toMatchObject({
      role: 'fan',
      isPrivate: false,
      roomId,
      liveSessionId,
      entryZone: 'fan-lobby',
      presenceMode: 'avatar',
    });
  });

  test('performer private resolves correctly', () => {
    const entry = resolveRoleEntry('performer', roomId, liveSessionId, true);
    expect(entry).toMatchObject({
      role: 'performer',
      isPrivate: true,
      roomId,
      liveSessionId,
      entryZone: 'rehearsal',
      presenceMode: 'video',
    });
  });

  test('host, dj, moderator, writer, system_host, and qa_bot all resolve without falling back to fan/performer', () => {
    const extendedRoles: Array<typeof LIVE_PARTICIPANT_ROLES[number]> = [
      'host',
      'dj',
      'moderator',
      'writer',
      'system_host',
      'qa_bot',
    ];
    for (const role of extendedRoles) {
      const entry = resolveRoleEntry(role, roomId, liveSessionId, false);
      expect(entry.role).toBe(role);
      expect(entry.entryZone).not.toBe('fan-lobby');
      expect(entry.entryZone).not.toBe('stage');
    }
  });

  test('getRoleEntryProfile never invents a roomId — profile has no room fields', () => {
    const profile = getRoleEntryProfile('dj', false);
    expect(profile).not.toHaveProperty('roomId');
    expect(profile).not.toHaveProperty('liveSessionId');
    expect(profile.entryZone).toBe('dj-booth');
  });
});
