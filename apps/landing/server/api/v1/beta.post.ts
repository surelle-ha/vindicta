import { randomBytes } from 'node:crypto'
import { Resend } from 'resend'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name  = (body?.name  ?? '').trim()
  const email = (body?.email ?? '').trim()

  if (!name || !email) {
    throw createError({ statusCode: 400, message: 'Name and email are required.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Please enter a valid email address.' })
  }

  const config = useRuntimeConfig()
  const sql    = await useDb()
  const token  = randomBytes(32).toString('hex')

  await sql`
    INSERT INTO beta_signups (name, email, token)
    VALUES (${name}, ${email}, ${token})
    ON CONFLICT (email) DO UPDATE SET
      name  = EXCLUDED.name,
      token = ${token}
  `

  const downloadLink = `${config.public.siteUrl}/download?token=${token}`

  const resend = new Resend(config.resendApiKey)
  await resend.emails.send({
    from:    config.fromEmail,
    to:      email,
    subject: 'Your Vindicta Beta Access',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#1e1f22;font-family:Inter,system-ui,sans-serif;color:#fff">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#1e1f22">
    <tr>
      <td align="center" style="padding:48px 24px">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;background:#2b2d31;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.25em;color:rgba(139,92,246,0.8)">Vindicta Security</p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:#fff">Beta Access Granted</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.6)">
                Hi ${name}, welcome to the Vindicta open beta.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.6)">
                Use the button below to access your personal download page. This link is unique to you — keep it safe.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:12px;background:#8b5cf6">
                    <a href="${downloadLink}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.03em">
                      Download Vindicta →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:11px;color:rgba(255,255,255,0.3);word-break:break-all">
                Or copy this link: <span style="color:rgba(139,92,246,0.7)">${downloadLink}</span>
              </p>
            </td>
          </tr>

          <!-- What's included -->
          <tr>
            <td style="padding:0 32px 28px">
              <p style="margin:0 0 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.25em;color:rgba(255,255,255,0.25)">What's included</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${[
                  'AI security scanning (Claude, OpenRouter, Ollama)',
                  'Findings tracker and dependency inventory',
                  '30-lesson Vindicta Academy — zero to pentest',
                  '100% local — no cloud, no telemetry',
                ].map(item => `
                <tr>
                  <td style="padding:5px 0">
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);padding-left:14px;position:relative">
                      <span style="color:rgba(139,92,246,0.6)">—</span> ${item}
                    </p>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06)">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.6">
                You're receiving this because you signed up for the Vindicta open beta at vindicta.surelle.xyz.
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })

  return { success: true }
})
