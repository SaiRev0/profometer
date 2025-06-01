import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const professors = await db.professor.findMany({
      where: { departmentCode: code.toUpperCase() },
      include: { department: true }
    });

    return NextResponse.json(professors);
  } catch (error) {
    console.error('Error fetching department professors:', error);
    return NextResponse.json({ error: 'Failed to fetch department professors' }, { status: 500 });
  }
}
