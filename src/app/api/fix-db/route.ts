import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Running manual database update...');
    
    // Add the column using raw SQL (Safe for shared DBs)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "ladderSequence" TEXT;
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database column "ladderSequence" added successfully.' 
    });
  } catch (error: any) {
    console.error('Database fix error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
