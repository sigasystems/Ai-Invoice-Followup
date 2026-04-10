"use client"

import * as React from "react"
import { CheckCircle2, Clock, Calendar } from "lucide-react"
import { PaymentPlan } from "@/types"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface PaymentPlanCardProps {
  plan: PaymentPlan
  className?: string
}

export function PaymentPlanCard({ plan, className }: PaymentPlanCardProps) {
  return (
    <div className={cn("p-5 border border-neutral-100 rounded-3xl bg-neutral-50/30 space-y-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-neutral-900">Active Payment Plan</span>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
          {plan.progress}% Collected
        </span>
      </div>

      <Progress value={plan.progress} className="h-2 bg-neutral-100" />

      <div className="space-y-3 pt-2">
        {plan.installments.map((inst, index) => (
          <div key={inst.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                inst.status === 'Paid' ? "bg-emerald-100 text-emerald-600" : "bg-neutral-100 text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                {inst.status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-900 leading-none mb-1">
                  Installment {index + 1} ({inst.percentage}%)
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Due: {new Date(inst.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
            <span className={cn(
              "text-xs font-bold",
              inst.status === 'Paid' ? "text-emerald-600" : "text-neutral-900"
            )}>
              ₹{inst.amount.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
