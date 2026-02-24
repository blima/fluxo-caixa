import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
