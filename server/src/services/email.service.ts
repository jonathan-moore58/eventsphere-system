import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, body: string) {
  // Fallback to mock if API key is not configured
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n📧 [EMAIL SERVICE - MOCK]`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body.substring(0, 100)}...`);
    console.log(`   Status: ✅ Sent (mocked)\n`);
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      // Resend requires using their onboarding email unless a custom domain is verified.
      // This will only send to the email address registered with Resend.
      from: 'EventSphere <onboarding@resend.dev>',
      to,
      subject,
      html: `
        <div style="font-family: 'Courier New', monospace; background: #09090b; color: #fafafa; padding: 32px; border: 2px solid #eab308;">
          <div style="border-bottom: 2px solid #27272a; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="color: #eab308; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 4px;">
              EventSphere
            </h1>
            <p style="color: #a1a1aa; font-size: 10px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">
              // SECURE_TRANSMISSION
            </p>
          </div>
          <h2 style="color: #fafafa; font-size: 16px; text-transform: uppercase; letter-spacing: 2px;">
            ${subject}
          </h2>
          <div style="background: #18181b; border: 1px solid #27272a; padding: 24px; margin: 16px 0;">
            <p style="color: #fafafa; font-size: 14px; line-height: 1.6; white-space: pre-line;">
              ${body}
            </p>
          </div>
          <div style="border-top: 2px solid #27272a; padding-top: 16px; margin-top: 24px;">
            <p style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
              This is an automated transmission from EventSphere EMS.
              Do not reply to this message.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error(`❌ [EMAIL FAILED] To: ${to} | Error:`, error);
      return { success: false, messageId: null };
    }

    console.log(`📧 [EMAIL SENT] To: ${to} | Subject: ${subject} | ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error(`❌ [EMAIL CATCH ERROR] To: ${to} | Error:`, error);
    return { success: false, messageId: null };
  }
}
