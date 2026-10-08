import bcrypt from "bcryptjs";
import { prisma } from "@campusoj/db";
import { Role } from "@campusoj/shared";
import type { RegisterInput, LoginInput } from "@campusoj/shared";
import { signToken, tokenExpiresAt } from "../lib/jwt.js";
import { AppError } from "../lib/AppError.js";

const BCRYPT_ROUNDS = 10;

// Roles that cannot be self-assigned at registration
const FORBIDDEN_SELF_ASSIGN_ROLES: string[] = [Role.ADMIN, Role.SUPER_ADMIN];

export async function registerUser(input: RegisterInput & { role?: string }) {
  const { email, password, fullName, college, role: requestedRole } = input;

  // Guard: prevent self-escalation to privileged roles
  if (requestedRole && FORBIDDEN_SELF_ASSIGN_ROLES.includes(requestedRole)) {
    throw new AppError("Cannot self-assign that role", 403);
  }

  const role =
    requestedRole === Role.FACULTY ? Role.FACULTY : Role.STUDENT;

  // Duplicate e-mail check (unique constraint would also catch this, but
  // throwing a DB error is less user-friendly)
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create User + Profile atomically with explicit connection wait and transaction timeout
  const user = await prisma.$transaction(
    async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
        },
      });

      await tx.profile.create({
        data: {
          userId: created.id,
          fullName,
          college: college ?? null,
        },
      });

      return created;
    },
    {
      maxWait: 10000, // 10s wait for connection
      timeout: 15000, // 15s transaction window
    }
  );

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
    expiresAt: tokenExpiresAt(),
  };
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  // Use a timing-safe comparison even on "not found" to prevent user enumeration
  const dummyHash = "$2b$10$dummyhashfortimingsafety00000000000000000000000000000";
  const passwordHash = user?.passwordHash ?? dummyHash;
  const match = await bcrypt.compare(password, passwordHash);

  if (!user || !match) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile
        ? {
            fullName: user.profile.fullName,
            college: user.profile.college,
            avatarUrl: user.profile.avatarUrl,
            bio: user.profile.bio,
          }
        : null,
    },
    token,
    expiresAt: tokenExpiresAt(),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) throw new AppError("User not found", 404);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile
      ? {
          fullName: user.profile.fullName,
          college: user.profile.college,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
        }
      : null,
  };
}

export const register = registerUser;

