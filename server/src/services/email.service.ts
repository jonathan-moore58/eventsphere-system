export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`\n📧 [EMAIL SERVICE - MOCK]`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body: ${body.substring(0, 100)}...`);
  console.log(`   Status: ✅ Sent (mocked)\n`);
  
  return { success: true, messageId: `mock_${Date.now()}` };
}
