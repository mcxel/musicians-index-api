export function tipReceiptHtml(fromName: string, toArtist: string, amountCents: number): string {
  const amount = (amountCents / 100).toFixed(2);
  return `<!DOCTYPE html><html><body style="background:#060410;color:#fff;font-family:sans-serif;padding:40px;">
    <h2 style="color:#FFD700;">💰 Tip Sent — Thank You!</h2>
    <p>Hey ${fromName},</p>
    <p>Your <strong>$${amount}</strong> tip to <strong>${toArtist}</strong> has been sent successfully.</p>
    <p>Your support means everything to independent artists on TMI.</p>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;">The Musician's Index · tmi.live</p>
  </body></html>`;
}
