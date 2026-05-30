import type { EmailRole } from "../EmailEngine";

const ROLE_LINES: Record<EmailRole, { heading: string; body: string; cta: string }> = {
  FAN:        { heading: "The stage is yours.",           body: "Watch live shows, tip your favourite artists, vote in battles, and earn PunPoints every day.",                        cta: "Enter the Fan Hub"        },
  ARTIST:     { heading: "Your audience is waiting.",     body: "Upload tracks, go live, sell beats and merch, and climb the TMI Billboard.",                                          cta: "Open Artist Dashboard"    },
  PERFORMER:  { heading: "Time to perform.",              body: "Schedule shows, stream live, accept bookings, and turn every performance into revenue.",                              cta: "Open Performer Studio"    },
  SPONSOR:    { heading: "Reach music's next wave.",      body: "Place sponsor slots on live rooms, billboard walls, and magazine pages — and track every impression.",               cta: "Open Sponsor Hub"         },
  ADVERTISER: { heading: "Your brand, centre stage.",     body: "Run targeted ads across live events, fan dashboards, and the TMI Magazine.",                                         cta: "Open Advertiser Hub"      },
  VENUE:      { heading: "Book the world's talent.",      body: "List your venue, set your calendar, and let performers discover you through the TMI booking network.",               cta: "Open Venue Hub"           },
  PROMOTER:   { heading: "Promote what matters.",         body: "Create events, build campaigns, sell tickets, and reach TMI's global audience of music fans.",                       cta: "Open Promoter Hub"        },
  ADMIN:      { heading: "Full platform access granted.", body: "You have admin access to the TMI Overseer Deck — platform health, revenue, users, and all bots are at your command.", cta: "Open Admin Dashboard"    },
};

const BASE = "https://themusiciansindex.com";

export function welcomeEmailHtml(name: string, role: EmailRole, loginUrl: string): string {
  const r = ROLE_LINES[role] ?? ROLE_LINES.FAN;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to TMI</title></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Inter',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050510;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo bar -->
        <tr><td style="padding:0 0 28px;">
          <div style="font-size:13px;font-weight:900;letter-spacing:0.3em;color:#00FFFF;text-transform:uppercase;">THE MUSICIAN'S INDEX</div>
          <div style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);margin-top:3px;">THEMUSICIANSINDEX.COM</div>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background:linear-gradient(135deg,#0a0520 0%,#050510 100%);border:1px solid rgba(0,255,255,0.12);border-radius:14px;padding:40px 36px;">
          <div style="font-size:11px;letter-spacing:0.25em;color:#FF2DAA;font-weight:900;text-transform:uppercase;margin-bottom:12px;">${role}</div>
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;line-height:1.15;">${r.heading}</h1>
          <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.65;">Hi ${name}, ${r.body}</p>
          <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:#FF2DAA;color:#fff;font-weight:900;font-size:13px;letter-spacing:0.1em;text-decoration:none;border-radius:8px;text-transform:uppercase;">${r.cta} →</a>
        </td></tr>

        <!-- Feature pills -->
        <tr><td style="padding:28px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${[["🎙️","Go Live","Stream instantly"], ["💵","Earn","Tips, subs & beats"], ["🏆","Compete","Battles & cyphers"]].map(([icon, title, desc]) => `
              <td width="33%" style="padding:4px;">
                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 12px;text-align:center;">
                  <div style="font-size:22px;margin-bottom:6px;">${icon}</div>
                  <div style="font-size:11px;font-weight:800;color:#fff;margin-bottom:3px;">${title}</div>
                  <div style="font-size:10px;color:rgba(255,255,255,0.35);">${desc}</div>
                </div>
              </td>`).join("")}
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;text-align:center;">
          <div style="font-size:11px;color:rgba(255,255,255,0.2);line-height:1.8;">
            The Musician's Index · BernoutGlobal LLC<br>
            <a href="${BASE}/unsubscribe" style="color:rgba(255,255,255,0.2);">Unsubscribe</a> ·
            <a href="${BASE}/privacy" style="color:rgba(255,255,255,0.2);">Privacy Policy</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailText(name: string, role: EmailRole, loginUrl: string): string {
  const r = ROLE_LINES[role] ?? ROLE_LINES.FAN;
  return `Welcome to The Musician's Index, ${name}!

${r.heading}

${r.body}

Log in here: ${loginUrl}

The Musician's Index — BernoutGlobal LLC
Unsubscribe: https://themusiciansindex.com/unsubscribe
`;
}
