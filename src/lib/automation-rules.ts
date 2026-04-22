import { differenceInCalendarDays, isSameDay } from 'date-fns';

/**
 * @file automation-rules.ts
 * @description Senior-level implementation of the invoice reminder lifecycle engine.
 */

export interface ReminderDecisionInput {
  status: string;
  followupStartDate: Date | null;
  nextActionAt: Date | null;
  lastSentAt: Date | null;
  currentStage: number;
  lastSentStage: number;
  dueDate: Date | null;
  triggerType: 'AUTO' | 'MANUAL';
}

export interface DecisionResult {
  shouldTrigger: boolean;
  reason?: string;
}

/**
 * Senior Guard Logic: Ensures n8n only receives valid, timely requests.
 * Next.js acts as the Data Custodian, n8n acts as the Decision Orchestrator.
 */
export function shouldTriggerReminder(data: ReminderDecisionInput): DecisionResult {
  const now = new Date();
  
  // 1. Basic Lifecycle Hard Stops
  if (data.status === "PAID" || data.status === "Paid") {
    return { shouldTrigger: false, reason: "Invoice is already marked as PAID." };
  }

  // 2. Duplicate Prevention (Strict 1-per-calendar-day rule)
  if (data.lastSentAt && isSameDay(new Date(data.lastSentAt), now)) {
    return { shouldTrigger: false, reason: "A reminder has already been sent today." };
  }

  // 3. Stage Progression Guard (Prevents skipping or double-sending same stage)
  const expectedNextStage = (data.lastSentStage ?? -1) + 1;
  if (data.currentStage !== expectedNextStage) {
    return { 
      shouldTrigger: false, 
      reason: `Stage mismatch: current stage is ${data.currentStage}, but last sent stage was ${data.lastSentStage}. Expected ${expectedNextStage}.` 
    };
  }

  // 4. Trigger-Specific Logic
  if (data.triggerType === 'AUTO') {
    // 4a. Enrollment Check
    if (data.followupStartDate && now < new Date(data.followupStartDate)) {
       return { 
         shouldTrigger: false, 
         reason: `Too early to start: Enrollment begins on ${new Date(data.followupStartDate).toLocaleDateString()}.` 
       };
    }

    // 4b. Explicit Schedule Check
    if (data.nextActionAt && now < new Date(data.nextActionAt)) {
      return { 
        shouldTrigger: false, 
        reason: "Next scheduled reminder time has not yet been reached." 
      };
    }

    // 4c. Overdue Check (Auto-flow only fires if overdue)
    if (data.dueDate && now <= new Date(data.dueDate)) {
      return { 
        shouldTrigger: false, 
        reason: "Invoice is not yet overdue (Required for automatic flow)." 
      };
    }
  }

  // 5. Manual Override Flow
  // MANUAL triggers bypass timing and overdue rules but still respect PAID/Duplicate rules.
  if (data.triggerType === 'MANUAL') {
    console.log(`[Lifecycle] Manual override granted for invoice.`);
  }

  return { shouldTrigger: true };
}
