import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { sendEmail } from './email.service';

export function generateOTP(): string {
  return "123456"; // Fixed for demo
}

export async function register(data: any) {
  const { name, email, password, role } = data;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
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

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) throw new Error('Invalid credentials');

  return generateAuthResponse(user);
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
