import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors';
import { LoginInput } from '../validators/authValidator';

export class AuthService {
  public async login(input: LoginInput) {
    const { email, password } = input;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Check if user account is active
    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Contact system admin.');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 4. Generate JWT Token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  public async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return user;
  }
}

export const authService = new AuthService();
