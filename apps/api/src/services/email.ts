interface BetaInviteOptions {
  name: string
  email: string
  downloadUrl: string
  apiKey: string
}

export async function sendBetaInviteEmail(opts: BetaInviteOptions): Promise<void> {
  const { name, email, downloadUrl, apiKey } = opts

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Vindicta <noreply@vindicta.surelle.xyz>',
      to: email,
      subject: 'Your Vindicta Beta Access is Ready',
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td style="background:#12121a;border:1px solid #1f1f2e;border-radius:16px;padding:40px 36px;">
              <p style="margin:0 0 24px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#6366f1;">VINDICTA BETA</p>
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.2;">Welcome, ${name}!</h1>
              <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.55);">
                Your beta access to Vindicta is ready. Click the button below to go to your personal download page.
                This link is unique to your account — please do not share it.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#6366f1;border-radius:10px;">
                    <a href="${downloadUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                      Download Vindicta →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;">
                If you did not request beta access, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Email delivery failed: ${text}`)
  }
}
