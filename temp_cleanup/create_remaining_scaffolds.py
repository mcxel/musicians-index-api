import os
import json

# ── Phase 6: Missing API Modules ─────────────────────────────────────────────
api_modules_base = 'tmi-platform/apps/api/src/modules'

api_modules = [
    ('avatar',     'Avatar',     'Manages avatar identity, presence, and evolution.'),
    ('rooms',      'Rooms',      'Manages room creation, joining, and state.'),
    ('sponsors',   'Sponsors',   'Manages sponsor campaigns and placements.'),
    ('analytics',  'Analytics',  'Tracks platform events and metrics.'),
    ('media',      'Media',      'Manages media uploads and processing.'),
    ('bots',       'Bots',       'Manages bot tasks and automation scheduling.'),
    ('booking',    'Booking',    'Manages artist booking requests and confirmations.'),
    ('moderation', 'Moderation', 'Manages content moderation and abuse reports.'),
]

service_template = """import {{ Injectable }} from '@nestjs/common';

/**
 * {label}Service
 * SCAFFOLD: {desc}
 * Wire to Prisma and business logic in Copilot wiring phase.
 */
@Injectable()
export class {label}Service {{
  // SCAFFOLD: Add service methods here
}}
"""

controller_template = """import {{ Controller, Get }} from '@nestjs/common';
import {{ {label}Service }} from './{slug}.service';

/**
 * {label}Controller
 * SCAFFOLD: {desc}
 */
@Controller('{slug}')
export class {label}Controller {{
  constructor(private readonly {slug}Service: {label}Service) {{}}

  @Get('health')
  health() {{
    return {{ status: 'ok', module: '{slug}' }};
  }}
}}
"""

module_template = """import {{ Module }} from '@nestjs/common';
import {{ {label}Controller }} from './{slug}.controller';
import {{ {label}Service }} from './{slug}.service';

@Module({{
  controllers: [{label}Controller],
  providers: [{label}Service],
  exports: [{label}Service],
}})
export class {label}Module {{}}
"""

for (slug, label, desc) in api_modules:
    module_dir = os.path.join(api_modules_base, slug)
    os.makedirs(module_dir, exist_ok=True)

    with open(os.path.join(module_dir, f'{slug}.service.ts'), 'w', encoding='utf-8') as f:
        f.write(service_template.format(label=label, desc=desc, slug=slug))

    with open(os.path.join(module_dir, f'{slug}.controller.ts'), 'w', encoding='utf-8') as f:
        f.write(controller_template.format(label=label, desc=desc, slug=slug))

    with open(os.path.join(module_dir, f'{slug}.module.ts'), 'w', encoding='utf-8') as f:
        f.write(module_template.format(label=label, desc=desc, slug=slug))

    print(f'CREATED API MODULE: {slug}/ (service + controller + module)')

# ── Phase 7: Missing Room Pages ───────────────────────────────────────────────
rooms_base = 'tmi-platform/apps/web/src/app/rooms'

new_rooms = [
    ('green-room',       'GreenRoomPage',       'Green Room',         'Relax and prepare in the green room before your performance.'),
    ('host-control',     'HostControlPage',     'Host Control Room',  'Manage your show from the host control room.'),
    ('interview-booth',  'InterviewBoothPage',  'Interview Booth',    'One-on-one interview sessions with artists and guests.'),
    ('listening-session','ListeningSessionPage','Listening Session',  'An intimate listening session for new music and unreleased tracks.'),
    ('award-ceremony',   'AwardCeremonyPage',   'Award Ceremony',     'Celebrate the best in music at the award ceremony.'),
    ('fan-meetup',       'FanMeetupPage',       'Fan Meetup',         'Meet your favorite artists and connect with other fans.'),
    ('vip-lounge',       'VIPLoungePage',       'VIP Lounge',         'Exclusive lounge for VIP members and top supporters.'),
    ('radio-station',    'RadioStationPage',    'Radio Station',      'Tune in to live radio broadcasts and music stations.'),
]

page_template = """export default function {fn}() {{
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-4">{title}</h1>
      <p className="text-gray-400">{desc}</p>
    </main>
  );
}}
"""

for (slug, fn, title, desc) in new_rooms:
    room_dir = os.path.join(rooms_base, slug)
    os.makedirs(room_dir, exist_ok=True)
    path = os.path.join(room_dir, 'page.tsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page_template.format(fn=fn, title=title, desc=desc))
    print(f'CREATED ROOM PAGE: {path}')

# ── Phase 8: Missing Core Pages ───────────────────────────────────────────────
core_pages = [
    ('settings',   'SettingsPage',   'Settings',   'Manage your account settings and preferences.'),
    ('bookmarks',  'BookmarksPage',  'Bookmarks',  'Your saved artists, articles, and rooms.'),
    ('trending',   'TrendingPage',   'Trending',   'Discover what is trending on The Musicians Index right now.'),
    ('stations',   'StationsPage',   'Stations',   'Browse and tune in to music stations on The Musicians Index.'),
]

web_app_base = 'tmi-platform/apps/web/src/app'

for (slug, fn, title, desc) in core_pages:
    page_dir = os.path.join(web_app_base, slug)
    os.makedirs(page_dir, exist_ok=True)
    path = os.path.join(page_dir, 'page.tsx')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page_template.format(fn=fn, title=title, desc=desc))
    print(f'CREATED CORE PAGE: {path}')

# ── Phase 9: Missing Bot Configs ──────────────────────────────────────────────
bots_base = 'data/bots'
os.makedirs(bots_base, exist_ok=True)

bots = [
    {
        'id': 'avatar-behavior-bot',
        'name': 'Avatar Behavior Bot',
        'description': 'Monitors avatar behavior states and triggers corrective actions when avatars get stuck or behave incorrectly.',
        'triggers': ['avatar-stuck', 'pose-timeout', 'zone-mismatch'],
        'actions': ['reset-avatar-pose', 'reassign-zone', 'reload-behavior-preset'],
        'priority': 'medium',
        'schedule': 'continuous',
        'enabled': True,
    },
    {
        'id': 'onboarding-recovery-bot',
        'name': 'Onboarding Recovery Bot',
        'description': 'Detects incomplete onboarding flows and sends recovery prompts to users who dropped off.',
        'triggers': ['onboarding-incomplete', 'profile-missing', 'role-not-selected'],
        'actions': ['send-recovery-email', 'flag-incomplete-profile', 'trigger-onboarding-resume'],
        'priority': 'high',
        'schedule': 'every-6-hours',
        'enabled': True,
    },
    {
        'id': 'recommendation-bot',
        'name': 'Recommendation Bot',
        'description': 'Generates personalized artist, room, and content recommendations for each user.',
        'triggers': ['user-login', 'profile-updated', 'activity-recorded'],
        'actions': ['compute-recommendations', 'update-feed', 'notify-user'],
        'priority': 'medium',
        'schedule': 'every-hour',
        'enabled': True,
    },
    {
        'id': 'search-indexing-bot',
        'name': 'Search Indexing Bot',
        'description': 'Keeps the search index up to date with new artists, articles, rooms, and events.',
        'triggers': ['content-published', 'profile-updated', 'room-created'],
        'actions': ['index-content', 'update-search-index', 'invalidate-cache'],
        'priority': 'high',
        'schedule': 'every-15-minutes',
        'enabled': True,
    },
    {
        'id': 'renewal-bot',
        'name': 'Renewal Bot',
        'description': 'Monitors subscription and sponsor contract renewals and sends reminders.',
        'triggers': ['subscription-expiring', 'contract-expiring', 'payment-failed'],
        'actions': ['send-renewal-reminder', 'flag-expiring-account', 'notify-admin'],
        'priority': 'high',
        'schedule': 'daily',
        'enabled': True,
    },
    {
        'id': 'sponsor-outreach-bot',
        'name': 'Sponsor Outreach Bot',
        'description': 'Identifies potential sponsors and advertisers and queues outreach campaigns.',
        'triggers': ['new-artist-milestone', 'high-traffic-room', 'contest-winner'],
        'actions': ['queue-outreach', 'generate-sponsor-pitch', 'notify-sales-team'],
        'priority': 'low',
        'schedule': 'weekly',
        'enabled': True,
    },
    {
        'id': 'moderation-sentinel-bot',
        'name': 'Moderation Sentinel Bot',
        'description': 'Continuously monitors content, chat, and user behavior for policy violations.',
        'triggers': ['content-flagged', 'chat-violation', 'abuse-report'],
        'actions': ['flag-content', 'mute-user', 'escalate-to-moderator', 'auto-remove-content'],
        'priority': 'critical',
        'schedule': 'continuous',
        'enabled': True,
    },
    {
        'id': 'booking-assistant-bot',
        'name': 'Booking Assistant Bot',
        'description': 'Assists with booking requests, availability checks, and confirmation workflows.',
        'triggers': ['booking-request', 'booking-pending-timeout', 'booking-confirmed'],
        'actions': ['check-availability', 'send-booking-confirmation', 'notify-artist', 'update-calendar'],
        'priority': 'high',
        'schedule': 'continuous',
        'enabled': True,
    },
]

for bot in bots:
    path = os.path.join(bots_base, f"{bot['id']}.json")
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(bot, f, indent=2)
    print(f"CREATED BOT CONFIG: {path}")

print('\nAll remaining scaffolds created successfully.')
print(f'  API modules: {len(api_modules)}')
print(f'  Room pages:  {len(new_rooms)}')
print(f'  Core pages:  {len(core_pages)}')
print(f'  Bot configs: {len(bots)}')
