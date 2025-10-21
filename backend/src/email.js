import dotenv from 'dotenv';

dotenv.config();

export async function sendEmail({ to, subject, text, html }) {
  const provider = process.env.EMAIL_PROVIDER;
  if (provider === 'sendgrid') {
    const apiKey = process.env.EMAIL_API_KEY;
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@maxmarketing.example' },
          subject,
          content: [{ type: 'text/plain', value: text || '' }].concat(html ? [{ type: 'text/html', value: html }] : [])
        })
      });
      if (!res.ok) throw new Error(`Email provider error ${res.status}`);
    } catch (e) {
      console.error('sendEmail error', e);
    }
  } else {
    console.log(`[email] to=${to} subject=${subject}`);
  }
}
