import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-ems-2025');

    const userId = decoded.userId || decoded.id;
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, name: true, isVerified: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'User not verified' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
