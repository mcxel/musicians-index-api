export function showReminderHtml(fanName: string, artistName: string, showTime: string, showUrl: string): string {
  return `<!DOCTYPE html><html><body style="background:#060410;color:#fff;font-family:sans-serif;padding:40px;">
    <h2 style="color:#00FFFF;">🎤 Going Live in 15 Minutes!</h2>
    <p>Hey ${fanName},</p>
    <p><strong>${artistName}</strong> is about to go live at <strong>${showTime}</strong>.</p>
    <p><a href="${showUrl}" style="display:inline-block;background:#AA2DFF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:800;">Join the Stream →</a></p>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;">The Musician's Index · tmi.live</p>
  </body></html>`;
}
