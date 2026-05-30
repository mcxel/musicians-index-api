export function subscriptionActivatedHtml(name: string, plan: string, nextBillDate: string): string {
  return `<!DOCTYPE html><html><body style="background:#060410;color:#fff;font-family:sans-serif;padding:40px;">
    <h2 style="color:#AA2DFF;">⚡ Subscription Active</h2>
    <p>Hey ${name},</p>
    <p>Your <strong>TMI ${plan}</strong> subscription is now active.</p>
    <p>Next billing date: <strong>${nextBillDate}</strong></p>
    <p>Enjoy unlimited access to exclusive content, backstage passes, and more.</p>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;">The Musician's Index · tmi.live</p>
  </body></html>`;
}
