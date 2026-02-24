import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    if (secret !== 'migrate-2026') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const senha_hash = await hashPassword('blm@blm');

    const user = await queryOne(
      `UPDATE users SET email = $1, senha_hash = $2, updated_at = NOW()
       WHERE email = $3 RETURNING id, nome, email`,
      ['blim.mar@gmail.com', senha_hash, 'admin@fluxo.com'],
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
