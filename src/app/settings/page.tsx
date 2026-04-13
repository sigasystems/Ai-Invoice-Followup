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
  MessageSquare
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

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

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
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Settings" 
        description="Configure your automation rules and collection escalation ladder."
      >
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-xl h-10 px-6 font-semibold shadow-md flex items-center gap-2"
        >
           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-primary bg-primary/5 font-semibold">
               <Zap className="h-4 w-4 mr-3" />
               Escalation Ladder
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100">
               <ShieldCheck className="h-4 w-4 mr-3" />
               Channels & Methods
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100">
               <BrainCircuit className="h-4 w-4 mr-3" />
               n8n Integration
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100">
               <CreditCard className="h-4 w-4 mr-3" />
               Billing & Plans
            </Button>
         </div>

         <div className="lg:col-span-3 space-y-8">
            <Card className="rounded-3xl border border-border shadow-sm overflow-hidden bg-card">
               <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap className="w-6 h-6 text-primary" />
                       <div>
                         <CardTitle className="text-xl font-bold">Custom Escalation Ladder</CardTitle>
                         <CardDescription className="text-sm font-medium">Define exactly when and with what tone reminders are sent.</CardDescription>
                       </div>
                    </div>
                    <Button onClick={addLadderStep} variant="outline" size="sm" className="rounded-xl h-9">
                      <Plus className="w-4 h-4 mr-2" /> Add Step
                    </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-8 pt-4 space-y-6">
                  {settings?.escalationLadder && settings.escalationLadder.map((step: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-muted border border-border group">
                      <div className="flex-1 space-y-2 w-full">
                        <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Step {index + 1} Label
                        </Label>
                        <Input 
                          value={step.label} 
                          onChange={(e) => updateLadderStep(index, 'label', e.target.value)}
                          placeholder="e.g. Day 1 Reminder"
                          className="rounded-xl h-10 bg-background border-border" 
                        />
                      </div>
                      <div className="w-full sm:w-24 space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Days Post</Label>
                        <Input 
                          type="number"
                          value={step.delayDays ?? 0} 
                          onChange={(e) => updateLadderStep(index, 'delayDays', parseInt(e.target.value) || 0)}
                          className="rounded-xl h-10 bg-background border-border" 
                        />
                      </div>
                      <div className="w-full sm:w-32 space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Tone</Label>
                        <Select 
                          value={step.tone} 
                          onValueChange={(val) => updateLadderStep(index, 'tone', val)}
                        >
                          <SelectTrigger className="rounded-xl h-10 bg-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Mild">Mild</SelectItem>
                            <SelectItem value="Neutral">Neutral</SelectItem>
                            <SelectItem value="Firm">Firm</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:pt-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          onClick={() => removeLadderStep(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {(!settings?.escalationLadder || settings.escalationLadder.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-neutral-100 rounded-3xl">
                      <p className="text-sm text-muted-foreground">No escalation steps defined. Click "Add Step" to start.</p>
                    </div>
                  )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/[0.05] border border-primary/20">
                       <div className="space-y-1">
                          <Label className="text-sm font-bold text-neutral-900">Smart Escalation</Label>
                          <p className="text-[10px] text-muted-foreground font-normal italic">Auto-switch to owner contact.</p>
                       </div>
                       <Checkbox 
                         checked={settings?.smartEscalation || false} 
                         onCheckedChange={(val) => updateField('smartEscalation', val)}
                       />
                     </div>
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                       <div className="space-y-1">
                          <Label className="text-sm font-bold text-neutral-900">Pre-Due Alerts</Label>
                          <p className="text-[10px] text-muted-foreground font-normal italic">Send courtesy reminder 2 days before.</p>
                       </div>
                       <Checkbox 
                         checked={settings?.beforeDueReminder || false} 
                         onCheckedChange={(val) => updateField('beforeDueReminder', val)}
                       />
                     </div>
                   </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="rounded-3xl border border-border shadow-sm overflow-hidden bg-card">
                  <CardHeader className="p-6 pb-2">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <CardTitle className="text-lg font-bold">Compliance</CardTitle>
                     </div>
                  </CardHeader>
                   <CardContent className="p-6 pt-4 space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                         <div className="space-y-0.5">
                            <span className="text-sm font-semibold block">Consent Verification</span>
                            <span className="text-[10px] text-muted-foreground">Verify manual consent for all contacts</span>
                         </div>
                         <Checkbox 
                           checked={settings?.consentVerified || false} 
                           onCheckedChange={(val) => updateField('consentVerified', val)}
                         />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                         <div className="space-y-0.5">
                            <span className="text-sm font-semibold block">Data Deletion Policy</span>
                            <span className="text-[10px] text-muted-foreground">Auto-purge PII after 90 days of inactivity</span>
                         </div>
                         <Checkbox 
                           checked={settings?.dataDeletion || false} 
                           onCheckedChange={(val) => updateField('dataDeletion', val)}
                         />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                         <div className="space-y-0.5">
                            <span className="text-sm font-semibold block">Sentiment Logs</span>
                            <span className="text-[10px] text-muted-foreground">Store AI analysis of customer replies</span>
                         </div>
                         <Checkbox 
                           checked={settings?.logSentiment || false} 
                           onCheckedChange={(val) => updateField('logSentiment', val)}
                         />
                      </div>
                   </CardContent>
               </Card>

               <Card className="rounded-3xl border border-border shadow-sm overflow-hidden bg-card">
                  <CardHeader className="p-6 pb-2">
                     <div className="flex items-center gap-3">
                        <BrainCircuit className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg font-bold">n8n Config</CardTitle>
                     </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-4 space-y-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Read Webhook</Label>
                        <Input 
                          value={settings?.readWebhook || ''} 
                          onChange={(e) => updateField('readWebhook', e.target.value)}
                          className="rounded-xl h-10 bg-muted border-none font-mono text-[10px]" 
                        />
                     </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold text-muted-foreground uppercase">Write Webhook</Label>
                         <Input 
                           value={settings?.writeWebhook || ''} 
                           onChange={(e) => updateField('writeWebhook', e.target.value)}
                           className="rounded-xl h-10 bg-neutral-50 border-none font-mono text-[10px]" 
                         />
                      </div>
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                         <div className="space-y-0.5">
                            <span className="text-xs font-bold">Background Sync</span>
                            <span className="text-[9px] text-muted-foreground block">Keep activities in sync with n8n</span>
                         </div>
                         <Checkbox 
                           checked={settings?.syncActivity || false} 
                           onCheckedChange={(val) => updateField('syncActivity', val)}
                         />
                      </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
