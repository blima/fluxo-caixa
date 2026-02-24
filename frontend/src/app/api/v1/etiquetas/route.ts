import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const rows = await query('SELECT * FROM etiquetas WHERE ativo = true ORDER BY nome ASC');
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { nome, descricao, cor, padrao } = await request.json();

    if (padrao) {
      await query('UPDATE etiquetas SET padrao = false WHERE padrao = true AND ativo = true');
    }

    const row = await queryOne(
      'INSERT INTO etiquetas (nome, descricao, cor, padrao) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao || null, cor || '#3B82F6', padrao || false],
    );
    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
