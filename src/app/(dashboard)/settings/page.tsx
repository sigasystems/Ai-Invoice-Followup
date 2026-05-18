"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, GripVertical } from "lucide-react"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSettingsStore } from "@/store/use-settings-store"
import { useEffect, useState } from "react"

function SortableStep({ step }: { step: any }) {
  const { updateStep, deleteStep } = useSettingsStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-lg border p-4 bg-card shadow-sm transition-all"
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-end">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delay (Days)</Label>
          <Input
            type="number"
            value={step.delayDays}
            onChange={(e) => updateStep(step.id, { delayDays: parseInt(e.target.value) })}
            className="h-9 font-bold"
          />
        </div>
        <div className="md:col-span-3 space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Communication Tone</Label>
          <Select
            value={step.tone}
            onValueChange={(val: any) => updateStep(step.id, { tone: val })}
          >
            <SelectTrigger className="h-9 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEUTRAL">Neutral</SelectItem>
              <SelectItem value="POLITE">Polite</SelectItem>
              <SelectItem value="FIRM">Firm</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="ESCALATION">Escalation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {step.tone === 'ESCALATION' && (
          <div className="md:col-span-4 space-y-2 animate-in slide-in-from-left-2 duration-200">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Escalation Email</Label>
            <Input
              type="email"
              placeholder="manager@company.com"
              value={step.escalationEmail || ''}
              onChange={(e) => updateStep(step.id, { escalationEmail: e.target.value })}
              className="h-9 border-orange-200 focus-visible:ring-orange-500"
            />
          </div>
        )}

        <div className={`flex items-center gap-2 pb-2.5 ${step.tone === 'ESCALATION' ? 'md:col-span-2' : 'md:col-span-5'}`}>
          <Switch
            checked={step.enabled}
            onCheckedChange={(val) => updateStep(step.id, { enabled: val })}
          />
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Enabled</Label>
        </div>

        <div className="md:col-span-1 flex items-center justify-end pb-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => deleteStep(step.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const {
    ladderSteps,
    n8nWebhookUrl,
    followupStartAfterDays,
    fetchSettings,
    addStep,
    reorderSteps,
    updateN8nUrl,
    updateFollowupStartAfterDays
  } = useSettingsStore()

  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    setWebhookUrl(n8nWebhookUrl)
  }, [n8nWebhookUrl])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderSteps(active.id as string, over.id as string)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Settings</h2>
          <p className="text-muted-foreground">Manage your automation preferences and escalation ladder.</p>
        </div>
      </div>

      <Tabs defaultValue="ladder" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="ladder">Escalation Ladder</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          {/* <TabsTrigger value="ai">AI Settings</TabsTrigger> */}
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="ladder" className="space-y-4">
          <Card className="border-muted-foreground/10 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Escalation Ladder</CardTitle>
                  <CardDescription>Define how the tone and frequency change as an invoice becomes more overdue.</CardDescription>
                </div>
                <Button size="sm" onClick={addStep} className="bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="mr-2 h-4 w-4" /> Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={ladderSteps.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {ladderSteps.map((step) => (
                      <SortableStep key={step.id} step={step} />
                    ))}
                    {ladderSteps.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                        No steps defined yet. Click "Add Step" to begin.
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card className="border-muted-foreground/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">External Integrations</CardTitle>
              <CardDescription>Connect PayPilot AI to your automation workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="n8n-url" className="text-sm font-semibold">n8n Workflow URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="n8n-url"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button onClick={() => updateN8nUrl(webhookUrl)}>Save URL</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This URL will receive a POST request whenever an AI followup is triggered.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card className="border-muted-foreground/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Automation Rules</CardTitle>
              <CardDescription>Global settings for automated followups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Enable Automated Followups</Label>
                  <p className="text-sm text-muted-foreground">Automatically trigger reminders based on the escalation ladder.</p>
                </div>
                {/* <Switch defaultChecked /> */}
              </div>
              {/* <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Skip Weekends</Label>
                  <p className="text-sm text-muted-foreground">Do not send reminders on Saturdays and Sundays.</p>
                </div>
                <Switch defaultChecked />
              </div> */}
              <div className="space-y-3 pt-6 border-t">
                <Label htmlFor="default-followup-start-days" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Default Follow-up Delay (Days)
                </Label>
                <div className="flex max-w-xs items-center gap-3">
                  <Input
                    id="default-followup-start-days"
                    type="number"
                    min="0"
                    value={followupStartAfterDays}
                    onChange={(e) => updateFollowupStartAfterDays(parseInt(e.target.value) || 0)}
                    className="font-bold h-10 w-24 text-center text-lg"
                  />
                  <span className="text-sm font-semibold text-muted-foreground">days after due date</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Newly created invoices will default to this follow-up start delay.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card className="border-muted-foreground/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">AI Configuration</CardTitle>
              <CardDescription>Configure how AI generates reminder content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Approval Mode</Label>
                <Select defaultValue="AUTO_SEND">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO_SEND">Auto-Send (Fully Automated)</SelectItem>
                    <SelectItem value="MANUAL_APPROVAL">Manual Approval Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">AI Model</Label>
                <Select defaultValue="gpt-4o">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (Premium)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
