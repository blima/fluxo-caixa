import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse, NextRequest } from 'next/server';
import { queryOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fluxo-caixa-jwt-secret-2024';

export function signToken(payload: { sub: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await queryOne<AuthUser>(
    'SELECT id, email, nome FROM users WHERE id = $1 AND ativo = true',
    [payload.sub],
  );
  return user;
}

export function unauthorized() {
  return NextResponse.json(
    { statusCode: 401, message: 'Não autorizado' },
    { status: 401 },
  );
}

export function notFound(message: string) {
  return NextResponse.json(
    { statusCode: 404, message },
    { status: 404 },
  );
}

export function badRequest(message: string) {
  return NextResponse.json(
    { statusCode: 400, message },
    { status: 400 },
  );
}

export function conflict(message: string) {
  return NextResponse.json(
    { statusCode: 409, message },
    { status: 409 },
  );
}
