export async function sendSMS(to: string, message: string) {
  console.log(`\n📱 [SMS SERVICE - MOCK]`);
  console.log(`   To: ${to}`);
  console.log(`   Message: ${message}`);
  console.log(`   Status: ✅ Sent (mocked)\n`);
  return { success: true };
}
