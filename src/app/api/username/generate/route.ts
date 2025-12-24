import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { generatePreviewUsername } from '@/lib/username-generator';

export async function GET() {
  try {
    let username: string;
    let isAvailable = false;
    let attempts = 0;

    // Generate until we find an available username
    while (!isAvailable && attempts < 10) {
      username = generatePreviewUsername();

      const existingUser = await db.user.findUnique({
        where: { username },
        select: { id: true }
      });

      if (!existingUser) {
        isAvailable = true;
      }
      attempts++;
    }

    return NextResponse.json({
      username: username!,
      available: isAvailable
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate username' }, { status: 500 });
  }
}
