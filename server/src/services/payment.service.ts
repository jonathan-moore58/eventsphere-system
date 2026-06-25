export async function processPayment(amount: number, cardDetails: any) {
  // Simulate 1 second processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success
  const success = true;
  
  if (success) {
    return {
      success: true,
      transactionId: `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      message: 'Payment processed successfully'
    };
  } else {
    throw new Error('Payment declined. Please try again.');
  }
}
