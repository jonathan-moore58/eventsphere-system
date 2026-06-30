import nodemailer from 'nodemailer';

async function testEmail() {
  console.log("Starting test email script...");
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'eventsphere.ems@gmail.com',
      pass: 'joqepwxtbhngtnsw',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"EventSphere EMS" <eventsphere.ems@gmail.com>',
      to: 'eventsphere.ems@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log("Email sent! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

testEmail();
