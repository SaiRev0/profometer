import { NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user to check if username is already finalized
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        usernameSetAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is already finalized
    if (user.usernameSetAt) {
      return NextResponse.json({ error: 'Username has already been finalized and cannot be changed' }, { status: 400 });
    }

    // Parse the request body to check if a new username is being set
    let newUsername: string | undefined;
    try {
      const body = await request.json();
      newUsername = body.username;
    } catch {
      // No body provided, use current username
    }

    // If a new username is provided, verify it's available
    if (newUsername && newUsername !== user.username) {
      const existingUser = await db.user.findUnique({
        where: { username: newUsername },
        select: { id: true }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Username is no longer available' }, { status: 409 });
      }

      // Update username and set usernameSetAt
      await db.user.update({
        where: { id: session.user.id },
        data: {
          username: newUsername,
          usernameSetAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        username: newUsername,
        message: 'Username confirmed successfully'
      });
    }

    // Finalize current username
    await db.user.update({
      where: { id: session.user.id },
      data: {
        usernameSetAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      username: user.username,
      message: 'Username confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming username:', error);
    return NextResponse.json({ error: 'Failed to confirm username' }, { status: 500 });
  }
}
