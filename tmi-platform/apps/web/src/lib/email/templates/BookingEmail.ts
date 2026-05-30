import type { BookingEmailDetails } from "../EmailEngine";

export function bookingConfirmedHtml(name: string, d: BookingEmailDetails): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Booking Confirmed</title></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Inter',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="padding:0 0 24px;">
        <div style="font-size:13px;font-weight:900;letter-spacing:0.3em;color:#00FFFF;">THE MUSICIAN'S INDEX</div>
      </td></tr>
      <tr><td style="background:rgba(0,255,136,0.04);border:1px solid rgba(0,255,136,0.15);border-radius:14px;padding:40px 36px;">
        <div style="font-size:44px;margin-bottom:16px;">🎤</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;">Booking confirmed, ${name}!</h1>
        <p style="margin:0 0 28px;color:rgba(255,255,255,0.5);font-size:14px;">Here are your show details:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:10px;overflow:hidden;">
          ${[
            ["Show", d.showTitle],
            ["Artist", d.artistName],
            ["Venue", d.venueName],
            ["Date", d.showDate],
            ["Time", d.showTime],
            ...(d.fee ? [["Fee", d.fee]] : []),
          ].map(([label, value], i) => `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:12px 16px;font-size:11px;color:rgba(255,255,255,0.4);font-weight:700;width:30%;">${label}</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#fff;">${value}</td>
          </tr>`).join("")}
        </table>
        ${d.ticketUrl ? `<div style="margin-top:24px;text-align:center;">
          <a href="${d.ticketUrl}" style="display:inline-block;padding:12px 28px;background:#00FF88;color:#050510;font-weight:900;font-size:12px;letter-spacing:0.1em;text-decoration:none;border-radius:8px;">VIEW TICKET →</a>
        </div>` : ""}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
