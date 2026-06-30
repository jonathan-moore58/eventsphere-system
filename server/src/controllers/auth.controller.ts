import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as authService from '../services/auth.service';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
// Validation middleware arrays
export const registerValidation = [
  body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export async function register(req: Request, res: Response) {
  try {
    // Run validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
    }

    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function loginVerifyOTP(req: Request, res: Response) {
  try {
    const { tempToken, otp } = req.body;
    const result = await authService.loginVerifyOTP(tempToken, otp);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function me(req: Request, res: Response) {
  res.json({ user: (req as any).user });
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isVerified: true }
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

export async function googleLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID');
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google token' });

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      // Create new user via Google
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || 'Google User',
          passwordHash,
          isVerified: true, // Google emails are pre-verified
          role: 'ATTENDEE', // Default role
          attendee: { create: {} }
        }
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
