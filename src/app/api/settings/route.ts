import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, startOfDay } from 'date-fns';

export async function GET() {
  try {
    let setting = await prisma.globalSetting.findUnique({
      where: { id: 'global_config' },
    });

    if (!setting) {
      setting = await prisma.globalSetting.create({
        data: {
          id: 'global_config',
          followupStartDelayDays: 0,
          escalationLadder: [
            { delayDays: 1, tone: 'Mild', label: 'Day 1 Reminder' },
            { delayDays: 3, tone: 'Neutral', label: 'Day 3 Reminder' },
            { delayDays: 7, tone: 'Firm', label: 'Day 7 Follow-up' },
            { delayDays: 15, tone: 'Urgent', label: 'Day 15 Escalation' },
          ]
        },
      });
    }

    if (!setting.escalationLadder) {
      setting.escalationLadder = [
        { delayDays: 1, tone: 'Mild', label: 'Day 1 Reminder' },
        { delayDays: 3, tone: 'Neutral', label: 'Day 3 Reminder' },
        { delayDays: 7, tone: 'Firm', label: 'Day 7 Follow-up' },
        { delayDays: 15, tone: 'Urgent', label: 'Day 15 Escalation' },
      ];
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Settings GET Error:', error);
    // Return default settings if DB is not ready
    return NextResponse.json({
      id: 'global_config',
      beforeDueReminder: true,
      smartEscalation: true,
      followupStartDelayDays: 0,
      escalationLadder: [
        { delayDays: 1, tone: 'Mild', label: 'Day 1 Reminder' },
        { delayDays: 3, tone: 'Neutral', label: 'Day 3 Reminder' },
        { delayDays: 7, tone: 'Firm', label: 'Day 7 Follow-up' },
        { delayDays: 15, tone: 'Urgent', label: 'Day 15 Escalation' },
      ]
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Remove id and updatedAt from body to prevent Prisma errors
    const { id, updatedAt, ...configData } = body;

    // Get current settings to check for changes
    const currentSetting = await prisma.globalSetting.findUnique({
      where: { id: 'global_config' }
    });

    const setting = await prisma.globalSetting.upsert({
      where: { id: 'global_config' },
      update: configData,
      create: { id: 'global_config', ...configData },
    });

    // ✅ If global delay changed, update all invoices using "Default" (null)
    if (currentSetting && configData.followupStartDelayDays !== undefined && 
        currentSetting.followupStartDelayDays !== configData.followupStartDelayDays) {
      
      const newDelay = configData.followupStartDelayDays;
      
      // Find all invoices that don't have a manual override
      const defaultInvoices = await prisma.invoice.findMany({
        where: { startFollowups: null }
      });

      for (const inv of defaultInvoices) {
        const newStartDate = addDays(startOfDay(inv.issueDate), newDelay);
        
        await prisma.invoice.update({
          where: { id: inv.id },
          data: {
            followupStartDate: newStartDate,
            // Also update nextActionAt if it hasn't started yet
            nextActionAt: inv.currentStage === 0 && !inv.lastSentAt ? newStartDate : undefined
          }
        });
      }
      console.log(`Dynamic Update: Recalculated dates for ${defaultInvoices.length} standard invoices.`);
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
