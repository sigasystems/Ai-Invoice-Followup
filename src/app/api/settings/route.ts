import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let setting = await prisma.globalSetting.findUnique({
      where: { id: 'global_config' },
    });

    if (!setting) {
      setting = await prisma.globalSetting.create({
        data: { 
          id: 'global_config',
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

    const setting = await prisma.globalSetting.upsert({
      where: { id: 'global_config' },
      update: configData,
      create: { id: 'global_config', ...configData },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
