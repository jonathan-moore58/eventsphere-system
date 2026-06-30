import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { sendEmail } from './email.service';

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(data: any) {
  const { name, email, password, role } = data;
  
  if (role === 'ADMIN') {
    throw new Error('SYS.ERR // UNAUTHORIZED ROLE ESCALATION');
  }
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const otpCode = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role || 'ATTENDEE',
      otpCode,
      otpExpiry,
    }
  });

  if (role === 'ORGANIZER') {
    await prisma.organizer.create({ data: { userId: user.id } });
  } else if (role === 'ATTENDEE') {
    await prisma.attendee.create({ data: { userId: user.id } });
  }

  await sendEmail(email, 'Verify your account', `Your OTP is: ${otpCode}`);

  return { message: 'Registration successful. OTP sent to email.', userId: user.id };
}

export async function verifyOTP(email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  if (user.isVerified) throw new Error('User already verified');
  if (user.otpCode !== otp) throw new Error('Invalid OTP');
  if (user.otpExpiry && user.otpExpiry < new Date()) throw new Error('OTP expired');

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otpCode: null,
      otpExpiry: null
    }
  });

  return generateAuthResponse(updatedUser);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  if (!user.isVerified) throw new Error('Please verify your account first');

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error('Account locked. Try again after 15 minutes.');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    if (attempts >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          failedLoginAttempts: attempts,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
        }
      });
      throw new Error('Account locked for 15 minutes.');
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts }
    });
    throw new Error('Invalid credentials');
  }

  const otpCode = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, otpCode, otpExpiry }
  });

  await sendEmail(email, 'Your Login OTP', `Your login OTP is: ${otpCode}`);

  const tempToken = jwt.sign(
    { userId: user.id, email: user.email, isTemp: true }, 
    process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-ems-2025', 
    { expiresIn: '15m' }
  );

  return { requiresOtp: true, tempToken };
}

export async function loginVerifyOTP(tempToken: string, otp: string) {
  try {
    const payload: any = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-ems-2025');
    if (!payload.isTemp) throw new Error('Invalid token type');

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new Error('User not found');
    if (user.otpCode !== otp) throw new Error('Invalid OTP');
    if (user.otpExpiry && user.otpExpiry < new Date()) throw new Error('OTP expired');

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null }
    });

    return generateAuthResponse(user);
  } catch (error) {
    throw new Error('Invalid or expired OTP session');
  }
}

function generateAuthResponse(user: any) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-ems-2025', {
    expiresIn: '24h'
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return same message to prevent email enumeration
    return { message: 'If that email exists, a reset link was sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${token}`;
  await sendEmail(email, 'Password Reset Request', `You requested a password reset.\n\nClick the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`);
  
  return { message: 'If that email exists, a reset link was sent.' };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });

  if (!user) throw new Error('Invalid or expired reset token');

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  });

  return { message: 'Password reset successful' };
}
