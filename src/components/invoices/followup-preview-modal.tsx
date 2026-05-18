"use client"

import * as React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface FollowupPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: any
  onSuccess: (data: any) => void
}

export function FollowupPreviewModal({ isOpen, onClose, invoice, onSuccess }: FollowupPreviewModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    try {
      const res = await axios.post("/api/followup/manual", {
        invoiceId: invoice?.id,
      })
      toast.success(`Webhook triggered! Sent to n8n (Tone: ${res.data.tone})`)
      onSuccess(res.data)
      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to trigger webhook")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Trigger n8n Webhook
          </DialogTitle>
          <DialogDescription>
            This will immediately send the invoice data payload to your n8n workflow. The AI content generation will happen dynamically on their side.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Invoice</span>
              <span className="text-sm font-bold text-foreground">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Customer</span>
              <span className="text-sm font-bold text-foreground">{invoice?.customer?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Expected Tone</span>
              <Badge variant="outline" className="capitalize bg-background">{invoice?.expectedTone?.toLowerCase() || 'Neutral'}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending to n8n...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Trigger Webhook</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
