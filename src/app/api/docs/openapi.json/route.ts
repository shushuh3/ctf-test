import { NextResponse } from 'next/server';
import { buildSpec } from '@/features/docs/openapi-spec';

// Открытая спецификация — не требует auth, чтобы внешние инструменты могли импортировать.
export async function GET() {
  return NextResponse.json(buildSpec());
}
