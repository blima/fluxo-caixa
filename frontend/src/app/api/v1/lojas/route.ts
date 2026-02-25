import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, badRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const incluirInativas = searchParams.get('incluir_inativas') === 'true';

  const conditions = incluirInativas ? [] : ['ativo = true'];
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await query(`SELECT * FROM lojas ${where} ORDER BY matriz DESC, nome ASC`);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const { nome, matriz, ativo } = body;

  if (!nome || nome.trim().length < 2) {
    return badRequest('Nome deve ter pelo menos 2 caracteres');
  }

  // Se marcando como matriz, desmarcar outras
  if (matriz) {
    await query('UPDATE lojas SET matriz = false WHERE matriz = true');
  }

  const row = await queryOne(
    `INSERT INTO lojas (nome, matriz, ativo) VALUES ($1, $2, $3) RETURNING *`,
    [nome.trim(), matriz ?? false, ativo ?? true],
  );
  return NextResponse.json(row, { status: 201 });
}
