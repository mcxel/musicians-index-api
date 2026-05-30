export function paymentFailedHtml(name: string, updateUrl: string): string {
  return `<!DOCTYPE html><html><body style="background:#060410;color:#fff;font-family:sans-serif;padding:40px;">
    <h2 style="color:#ef4444;">⚠ Payment Failed</h2>
    <p>Hey ${name},</p>
    <p>We couldn't process your recent TMI payment. This may affect access to premium features.</p>
    <p><a href="${updateUrl}" style="color:#AA2DFF;">Update your payment method →</a></p>
    <p>If you believe this is an error, contact support at support@tmi.live</p>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;">The Musician's Index · tmi.live</p>
  </body></html>`;
}
