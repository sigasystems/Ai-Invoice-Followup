'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import {
  ShieldCheck,
  Zap,
  Clock,
  CreditCard,
  BrainCircuit,
  Save,
  Loader2,
  Plus,
  Trash2,
  Settings2,
  Globe,
  Bell,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('ladder');

  React.useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    // Validation: Check for duplicate delay days
    const days = settings?.escalationLadder?.map((s: any) => s.delayDays) || [];
    const duplicateDay = days.find((day : any , index : any) => days.indexOf(day) !== index);
    
    if (duplicateDay !== undefined) {
      toast.error(`Validation Error: Multiple stages set for Day ${duplicateDay}. Protocols must have unique delays.`);
      return;
    }

    // Validation: Check for empty labels
    if (settings?.escalationLadder?.some((s: any) => !s.label?.trim())) {
      toast.error('Validation Error: All protocol stages must have a label.');
      return;
    }

    setSaving(true);
    try {
      // Sanitize manager emails (remove duplicates and empty spaces)
      const sanitizedEmails = Array.from(new Set(
        (settings.managerEmails || '').split(',')
          .map((e: string) => e.trim())
          .filter((e: string) => e)
      )).join(', ');

      const payload = { ...settings, managerEmails: sanitizedEmails };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      
      // Update local state with sanitized emails
      setSettings(payload);
      toast.success('Settings synchronized successfully!');
    } catch (err) {
      toast.error('Network Error: Failed to synchronize preferences.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const addLadderStep = () => {
    const existingDays = settings?.escalationLadder?.map((s: any) => s.delayDays) || [];
    let nextDay = 1;
    while (existingDays.includes(nextDay)) {
      nextDay++;
    }
    
    const newStep = { delayDays: nextDay, tone: 'Neutral', label: `Day ${nextDay} Reminder` };
    setSettings((prev: any) => ({
      ...prev,
      escalationLadder: [...(prev.escalationLadder || []), newStep].sort((a, b) => a.delayDays - b.delayDays)
    }));
  };

  const removeLadderStep = (index: number) => {
    const step = settings?.escalationLadder?.[index];
    const stepLabel = step?.label || `Day ${step?.delayDays || index} Stage`;

    if (window.confirm(`Are you sure you want to remove the "${stepLabel}" protocol? This won't be saved until you click 'Save Configuration'.`)) {
      setSettings((prev: any) => ({
        ...prev,
        escalationLadder: prev.escalationLadder.filter((_: any, i: number) => i !== index)
      }));
      toast.success('Stage removed from protocol ladder.');
    }
  };

  const updateLadderStep = (index: number, field: string, value: any) => {
    if (field === 'delayDays') {
      const isDuplicate = settings.escalationLadder.some((s: any, i: number) => i !== index && s.delayDays === value);
      if (isDuplicate) {
        toast.error(`A protocol for Day ${value} already exists. Please choose a unique delay.`);
        return;
      }
    }
    const newLadder = [...settings.escalationLadder];
    
    // Clear escalationContact if tone is changed away from Manager Escalation
    if (field === 'tone' && value !== 'Manager Escalation') {
      newLadder[index] = { ...newLadder[index], [field]: value, escalationContact: undefined };
    } else {
      newLadder[index] = { ...newLadder[index], [field]: value };
    }
    
    // Auto-sort if delay changed
    if (field === 'delayDays') {
      newLadder.sort((a, b) => a.delayDays - b.delayDays);
    }
    
    updateField('escalationLadder', newLadder);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-40 gap-4">
          <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <p className="text-[12px] font-bold text-muted-foreground/60 tracking-wider">Initializing preferences</p>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'ladder', label: 'Protocol Ladder', icon: Zap },
    // { id: 'channels', label: 'Communication', icon: Globe },
    { id: 'n8n', label: 'Automation Sync', icon: BrainCircuit },
    // { id: 'security', label: 'Security & PII', icon: Lock },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="System Preferences"
        description="Global configuration for autonomous collection logic and gateway integrations."
      >
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg h-11 px-6 font-bold text-[12px] shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Synchronizing...' : 'Save configuration'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">

        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-1">
          <p className="px-4 text-[12px] font-bold text-muted-foreground/60 tracking-wider mb-4">Configuration</p>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted font-bold"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 animate-in fade-in slide-in-from-right-4 duration-500">

          {activeTab === 'ladder' && (
            <div className="space-y-8">
              <Card className="rounded-lg border border-border shadow-2xl shadow-neutral-500/5 overflow-hidden bg-card">
                <CardHeader className="p-10 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-semibold">Escalation Protocol</CardTitle>
                      <CardDescription className="text-sm font-medium text-muted-foreground">Design the sequence of autonomous reminders and tone transitions.</CardDescription>
                    </div>
                    <Button onClick={addLadderStep} variant="outline" className="rounded-lg h-10 px-4 font-bold text-[12px] border-primary/20 text-primary hover:bg-primary/5">
                      <Plus className="w-4 h-4 mr-2" /> New stage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-8 space-y-4">
                  {settings?.escalationLadder && settings.escalationLadder.map((step: any, index: number) => {
                    const isDuplicate = settings.escalationLadder.some((s: any, i: number) => i !== index && s.delayDays === step.delayDays);
                    
                    return (
                      <div key={index} className={cn(
                        "group relative flex flex-col sm:flex-row items-center gap-6 p-6 rounded-lg bg-muted/30 border transition-all duration-300",
                        isDuplicate ? "border-rose-500/50 bg-rose-500/5" : "border-border/50 hover:border-primary/20"
                      )}>
                        <div className="flex flex-col gap-2 flex-1 w-full">
                          <Label className="text-[12px] font-bold text-muted-foreground/60 tracking-wider">Protocol Identifier</Label>
                          <Input
                            value={step.label}
                            onChange={(e) => updateLadderStep(index, 'label', e.target.value)}
                            className="bg-background border-border shadow-sm rounded-lg h-11 font-bold text-neutral-900 dark:text-neutral-100 focus:ring-primary"
                            placeholder="e.g. Day 1 Courtesy"
                          />
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-28">
                          <Label className={cn("text-[11px] font-bold tracking-wider", isDuplicate ? "text-rose-500" : "text-muted-foreground/60")}>
                            Delay (days) {isDuplicate && "⚠️"}
                          </Label>
                          <Input
                            type="number"
                            value={step.delayDays ?? 0}
                            onChange={(e) => updateLadderStep(index, 'delayDays', parseInt(e.target.value) || 0)}
                            className={cn(
                              "bg-background border-none shadow-sm rounded-xl h-11 font-semibold focus:ring-primary text-center",
                              isDuplicate && "text-rose-600 ring-2 ring-rose-500/20"
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-40">
                          <Label className="text-[12px] font-bold text-muted-foreground/60 tracking-wider">Communication Tone</Label>
                          <Select
                            value={step.tone}
                            onValueChange={(val) => updateLadderStep(index, 'tone', val)}
                          >
                            <SelectTrigger className="bg-background border-border shadow-sm rounded-lg h-11 font-bold text-neutral-900 dark:text-neutral-100 focus:ring-primary transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border shadow-2xl p-2">
                              {['Gentle', 'Neutral', 'Firm', 'Urgent', 'Legal', 'Manager Escalation'].map(t => (
                                <SelectItem key={t} value={t} className="rounded-xl font-semibold text-xs py-2 px-3">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                          {step.tone === 'Manager Escalation' && (
                            <div className="flex flex-col gap-2 flex-1 w-full animate-in zoom-in-95 duration-200">
                              <Label className="text-[11px] font-bold text-rose-500 tracking-wider">Escalation contact</Label>
                              <Select
                                value={step.escalationContact || ''}
                                onValueChange={(val) => updateLadderStep(index, 'escalationContact', val)}
                              >
                                <SelectTrigger className="bg-rose-500/5 border border-rose-500/10 shadow-sm rounded-xl h-11 font-semibold focus:ring-rose-500">
                                  <SelectValue placeholder="Select Manager" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border shadow-2xl p-2">
                                  {settings?.managerEmails?.split(',').map((email: string) => {
                                    const cleanEmail = email.trim();
                                    if (!cleanEmail) return null;
                                    return (
                                      <SelectItem key={cleanEmail} value={cleanEmail} className="rounded-xl font-semibold text-xs py-2 px-3">
                                        {cleanEmail}
                                      </SelectItem>
                                    );
                                  })}
                                  <SelectItem value="custom" className="rounded-xl font-semibold text-xs py-2 px-3 text-muted-foreground italic">
                                    Add more in Directory
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        
                        <div className="sm:pt-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl h-11 w-11"
                            onClick={() => removeLadderStep(index)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10 pt-10 border-t border-border/50">
                    {[
                      { id: 'createDraftsOnly', label: 'Human Review', sub: 'Queue as Gmail drafts', icon: ShieldCheck, color: 'text-emerald-500' },
                      { id: 'smartEscalation', label: 'Smart Direct', sub: 'Auto-detect owner mail', icon: BrainCircuit, color: 'text-indigo-500' },
                      { id: 'beforeDueReminder', label: 'Early Alerts', sub: 'Courtesy pre-due ping', icon: Bell, color: 'text-amber-500' }
                    ].map((opt: any) => (
                      <div key={opt.id} className="p-5 rounded-lg border border-border bg-card hover:border-primary/20 transition-all group flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-muted group-hover:bg-primary/5 transition-colors", opt.color)}>
                            <opt.icon className="h-5 w-5" />
                          </div>
                          <Checkbox
                            checked={settings?.[opt.id] || false}
                            onCheckedChange={(val) => updateField(opt.id, val)}
                            className="h-6 w-6 rounded-md"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{opt.label}</p>
                          <p className="text-[12px] font-medium text-muted-foreground mt-1">{opt.sub}</p>
                        </div>
                      </div>
                    ))}

                    {/* Global Follow-up Delay */}
                    <div className="p-5 rounded-lg border border-border bg-card hover:border-primary/20 transition-all group flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-muted group-hover:bg-primary/5 transition-colors text-blue-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={settings?.followupStartDelayDays || 0}
                            onChange={(e) => updateField('followupStartDelayDays', parseInt(e.target.value) || 0)}
                            className="w-16 h-10 rounded-xl text-center font-bold text-lg border-border bg-card focus:ring-2 focus:ring-primary/20 shadow-sm"
                            min={0}
                            placeholder="0"
                          />
                          <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">Days</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Global start delay</p>
                        <p className="text-[12px] font-medium text-muted-foreground mt-1">Wait X days after issue before follow-ups begin.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manager Emails Directory */}
              <Card className=" border border-border shadow-2xl shadow-neutral-500/5 overflow-hidden bg-card">
                <CardHeader className="p-10 pb-0">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Manager Directory</CardTitle>
                      <CardDescription className="text-sm font-medium">Authorized emails for high-priority escalation protocols.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-6 space-y-6">
                   <div className="space-y-3">
                    <Label className="text-[12px] font-bold text-muted-foreground/60 tracking-wider ml-1">Verified manager recipients</Label>
                    <Input
                      value={settings?.managerEmails || ''}
                      onChange={(e) => updateField('managerEmails', e.target.value)}
                      placeholder="manager1@company.com, manager2@company.com"
                      className="rounded-lg h-14 bg-muted/50 border-border font-bold focus:ring-primary px-6"
                    />
                    <p className="text-[11px] text-muted-foreground italic ml-1">Separate multiple emails with commas. These will appear in the escalation dropdown above.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'n8n' && (
            <Card className=" border border-border shadow-2xl shadow-neutral-500/5 bg-card animate-in fade-in slide-in-from-bottom-2">
              <CardHeader className="p-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold ">Automation Engine</CardTitle>
                    <CardDescription className="text-sm font-medium">Bridge your financial data with autonomous collection workflows via n8n.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[12px] font-semibold text-muted-foreground uppercase ml-1">Ingestion Webhook (Read)</Label>
                  <Input
                    value={settings?.readWebhook || ''}
                    onChange={(e) => updateField('readWebhook', e.target.value)}
                    className="rounded-lg h-12 bg-muted border-none font-mono text-xs focus:ring-primary px-6"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[12px] font-semibold text-muted-foreground uppercase ml-1">Dispatch Webhook (Execution)</Label>
                  <Input
                    value={settings?.writeWebhook || ''}
                    onChange={(e) => updateField('writeWebhook', e.target.value)}
                    className="rounded-lg h-12 bg-muted border-none font-mono text-xs focus:ring-primary px-6"
                    placeholder="https://n8n.instance.com/webhook/..."
                  />

                  {settings?.writeWebhook?.includes('/webhook-test/') && (
                    <div className="mt-4 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                      <Zap className="h-5 w-5 text-amber-600 mt-1" />
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-amber-700">Environment mismatch</p>
                        <p className="text-[11px] font-medium text-amber-800/80 leading-relaxed">
                          Detected a test webhook. Production automation requires a permanent, active workflow URL.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-amber-100 border-amber-200 text-amber-800 font-semibold text-[9px] uppercase  rounded-xl"
                          onClick={() => {
                            const prodUrl = settings.writeWebhook.replace('/webhook-test/', '/webhook/');
                            updateField('writeWebhook', prodUrl);
                            toast.info('Switched to suggested production URL format.');
                          }}
                        >
                          Migrate to Production URL
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Continuous data sync</p>
                    <p className="text-[12px] font-medium text-muted-foreground italic">Automated activity heartbeat with n8n servers.</p>
                  </div>
                  <Checkbox
                    checked={settings?.syncActivity || false}
                    onCheckedChange={(val) => updateField('syncActivity', val)}
                    className="h-6 w-6 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Placeholder for other tabs to keep UI consistent */}
          {['channels', 'security'].includes(activeTab) && (
            <div className="h-96 w-full  border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 bg-muted/20">
              <Settings2 className="h-10 w-10 text-muted-foreground opacity-20" />
              <p className="text-[12px] font-semibold uppercase text-muted-foreground">Advanced module coming soon</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
