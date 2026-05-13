import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Get Global Ladder from Settings
    let settings = await prisma.globalSetting.findUnique({ where: { id: 'global_config' } });
    
    let ladder = (settings?.escalationLadder as any[]) || [];
    
    // If settings are completely empty, set a smart default so the system isn't broken
    if (ladder.length === 0) {
      console.log("Settings empty, using dynamic fallback...");
      const smartDefault = [
        { delayDays: 1, tone: 'Neutral', label: '1st Reminder' },
        { delayDays: 2, tone: 'Firm', label: '2nd Reminder' },
        { delayDays: 5, tone: 'Urgent', label: 'Final Notice' }
      ];
      ladder = smartDefault;
    }

    const ladderSequence = ladder.map((l: any) => (l.delayDays ?? l)).join(', ');

    console.log("Dynamic Fix: Updating all invoices to match current settings:", ladderSequence);

    // 2. Update ALL invoices to match the current Global Ladder
    const result = await prisma.invoice.updateMany({
      data: { ladderSequence: ladderSequence } as any
    });

    return NextResponse.json({ 
      success: true, 
      message: `Dynamic Sync: Applied '${ladderSequence}' to ${result.count} invoices.`,
      current_ladder: ladderSequence
    });
  } catch (error: any) {
    console.error('Data Fix Error:', error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
