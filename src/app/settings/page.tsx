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
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const addLadderStep = () => {
    const newStep = { delayDays: 1, tone: 'Neutral', label: 'New Reminder' };
    setSettings((prev: any) => ({
      ...prev,
      escalationLadder: [...(prev.escalationLadder || []), newStep]
    }));
  };

  const removeLadderStep = (index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      escalationLadder: prev.escalationLadder.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateLadderStep = (index: number, field: string, value: any) => {
    const newLadder = [...settings.escalationLadder];
    newLadder[index] = { ...newLadder[index], [field]: value };
    updateField('escalationLadder', newLadder);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-40 gap-4">
          <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase text-muted-foreground">Initializing Preferences</p>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'ladder', label: 'Protocol Ladder', icon: Zap },
    { id: 'channels', label: 'Communication', icon: Globe },
    { id: 'n8n', label: 'Automation Sync', icon: BrainCircuit },
    { id: 'security', label: 'Security & PII', icon: Lock },
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
          className="rounded-xl h-11 px-6 font-black text-[10px] uppercase  shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Synchronizing...' : 'Save Configuration'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">

        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-1">
          <p className="px-4 text-[10px] font-black text-muted-foreground uppercase mb-4">Configuration</p>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted font-bold"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="text-xs  uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 animate-in fade-in slide-in-from-right-4 duration-500">

          {activeTab === 'ladder' && (
            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border border-border shadow-2xl shadow-neutral-500/5 overflow-hidden bg-card">
                <CardHeader className="p-10 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold">Escalation Protocol</CardTitle>
                      <CardDescription className="text-sm font-medium text-muted-foreground">Design the sequence of autonomous reminders and tone transitions.</CardDescription>
                    </div>
                    <Button onClick={addLadderStep} variant="outline" className="rounded-xl h-10 px-4 font-black text-[10px] uppercase  border-primary/20 text-primary hover:bg-primary/5">
                      <Plus className="w-4 h-4 mr-2" /> New Stage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-8 space-y-4">
                  {settings?.escalationLadder && settings.escalationLadder.map((step: any, index: number) => (
                    <div key={index} className="group relative flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-300">
                      <div className="flex flex-col gap-2 flex-1 w-full">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase ">Protocol Identifier</Label>
                        <Input
                          value={step.label}
                          onChange={(e) => updateLadderStep(index, 'label', e.target.value)}
                          className="bg-background border-none shadow-sm rounded-xl h-11 font-bold focus:ring-primary h-11"
                          placeholder="e.g. Day 1 Courtesy"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-28">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase ">Delay (Days)</Label>
                        <Input
                          type="number"
                          value={step.delayDays ?? 0}
                          onChange={(e) => updateLadderStep(index, 'delayDays', parseInt(e.target.value) || 0)}
                          className="bg-background border-none shadow-sm rounded-xl h-11 font-black focus:ring-primary text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-40">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase ">Communication Tone</Label>
                        <Select
                          value={step.tone}
                          onValueChange={(val) => updateLadderStep(index, 'tone', val)}
                        >
                          <SelectTrigger className="bg-background border-none shadow-sm rounded-xl h-11 font-bold focus:ring-primary transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-border shadow-2xl p-2">
                            {['Gentle', 'Neutral', 'Firm', 'Urgent', 'Legal', 'Manager Escalation'].map(t => (
                              <SelectItem key={t} value={t} className="rounded-xl font-bold text-xs py-2 px-3">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {step.tone === 'Manager Escalation' && (
                        <div className="flex flex-col gap-2 flex-1 w-full animate-in zoom-in-95 duration-200">
                          <Label className="text-[10px] font-black text-rose-500 uppercase ">Escalation Contact</Label>
                          <Input
                            value={step.escalationContact || ''}
                            onChange={(e) => updateLadderStep(index, 'escalationContact', e.target.value)}
                            className="bg-rose-500/5 border border-rose-500/10 shadow-sm rounded-xl h-11 font-bold focus:ring-rose-500"
                            placeholder="e.g. Finance VP / Legal"
                          />
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
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-border/50">
                    {[
                      { id: 'createDraftsOnly', label: 'Human Review', sub: 'Queue as Gmail drafts', icon: ShieldCheck, color: 'text-emerald-500' },
                      { id: 'smartEscalation', label: 'Smart Direct', sub: 'Auto-detect owner mail', icon: BrainCircuit, color: 'text-indigo-500' },
                      { id: 'beforeDueReminder', label: 'Early Alerts', sub: 'Courtesy pre-due ping', icon: Bell, color: 'text-amber-500' }
                    ].map((opt) => (
                      <div key={opt.id} className="p-5 rounded-[2rem] border border-border bg-card hover:border-primary/20 transition-all group flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center bg-muted group-hover:bg-primary/5 transition-colors", opt.color)}>
                            <opt.icon className="h-5 w-5" />
                          </div>
                          <Checkbox
                            checked={settings?.[opt.id] || false}
                            onCheckedChange={(val) => updateField(opt.id, val)}
                            className="h-6 w-6 rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-foreground ">{opt.label}</p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1">{opt.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'n8n' && (
            <Card className="rounded-[2.5rem] border border-border shadow-2xl shadow-neutral-500/5 bg-card animate-in fade-in slide-in-from-bottom-2">
              <CardHeader className="p-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black ">Automation Engine</CardTitle>
                    <CardDescription className="text-sm font-medium">Bridge your financial data with autonomous collection workflows via n8n.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Ingestion Webhook (Read)</Label>
                  <Input
                    value={settings?.readWebhook || ''}
                    onChange={(e) => updateField('readWebhook', e.target.value)}
                    className="rounded-[1.25rem] h-12 bg-muted border-none font-mono text-xs focus:ring-primary px-6"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Dispatch Webhook (Execution)</Label>
                  <Input
                    value={settings?.writeWebhook || ''}
                    onChange={(e) => updateField('writeWebhook', e.target.value)}
                    className="rounded-[1.25rem] h-12 bg-muted border-none font-mono text-xs focus:ring-primary px-6"
                    placeholder="https://n8n.instance.com/webhook/..."
                  />

                  {settings?.writeWebhook?.includes('/webhook-test/') && (
                    <div className="mt-4 p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                      <Zap className="h-5 w-5 text-amber-600 mt-1" />
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase  text-amber-700">Environment Mismatch</p>
                        <p className="text-[11px] font-medium text-amber-800/80 leading-relaxed">
                          Detected a test webhook. Production automation requires a permanent, active workflow URL.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-amber-100 border-amber-200 text-amber-800 font-black text-[9px] uppercase  rounded-xl"
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

                <div className="p-6 rounded-3xl bg-muted/40 border border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase  text-foreground">Continuous Data Sync</p>
                    <p className="text-[10px] font-medium text-muted-foreground italic">Automated activity heartbeat with n8n servers.</p>
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
            <div className="h-96 w-full rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 bg-muted/20">
              <Settings2 className="h-10 w-10 text-muted-foreground opacity-20" />
              <p className="text-[10px] font-black uppercase text-muted-foreground">Advanced module coming soon</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
