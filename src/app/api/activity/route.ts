import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const olderThanDays = searchParams.get('olderThan');

    if (!olderThanDays) {
      return NextResponse.json({ error: 'Missing olderThan parameter' }, { status: 400 });
    }

    const days = parseInt(olderThanDays);
    if (isNaN(days)) {
      return NextResponse.json({ error: 'Invalid olderThan parameter' }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await prisma.activity.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleted.count} activities older than ${days} days.`,
      count: deleted.count 
    });
  } catch (error) {
    console.error('Delete Activity Error:', error);
    return NextResponse.json({ error: 'Failed to delete activities' }, { status: 500 });
  }
}
