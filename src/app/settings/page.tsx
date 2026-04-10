'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Clock,
  Settings,
  User,
  CreditCard,
  Target,
  BrainCircuit,
  Save
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
  const [tone, setTone] = React.useState('Auto');
  
  const handleSave = () => {
    toast.success('Settings updated successfully!');
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Settings" 
        description="Configure your automation rules and communication tone."
      >
        <Button onClick={handleSave} className="rounded-xl h-10 px-6 font-semibold shadow-md flex items-center gap-2">
           <Save className="w-4 h-4" />
           Save Changes
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Navigation Tabs */}
         <div className="lg:col-span-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-primary bg-primary/5 font-semibold transition-all">
               <Zap className="h-4 w-4 mr-3" />
               Automation Rules
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100 transition-all">
               <ShieldCheck className="h-4 w-4 mr-3" />
               Channels & Methods
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100 transition-all">
               <ShieldCheck className="h-4 w-4 mr-3" />
               Privacy & Compliance
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100 transition-all">
               <BrainCircuit className="h-4 w-4 mr-3" />
               n8n Integration
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-xl h-11 px-4 text-muted-foreground font-medium hover:bg-neutral-100 transition-all">
               <CreditCard className="h-4 w-4 mr-3" />
               Billing & Plans
            </Button>
         </div>

         {/* Content Area */}
         <div className="lg:col-span-3 space-y-8">
            <Card className="rounded-3xl border border-neutral-100 shadow-sm overflow-hidden bg-white">
               <CardHeader className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                     <BrainCircuit className="w-6 h-6 text-primary" />
                     <CardTitle className="text-xl font-bold">Follow-up AI Rules</CardTitle>
                  </div>
                  <CardDescription className="text-sm font-medium">Define when and how PayPilot should intervene.</CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-4 space-y-8">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 group transition-all">
                        <div className="space-y-1">
                           <Label className="text-base font-semibold group-hover:text-primary transition-colors">Before due reminder</Label>
                           <p className="text-xs text-muted-foreground font-normal">Send a friendly nudge 2 days before due date.</p>
                        </div>
                        <Checkbox className="h-5 w-5 rounded-md border-neutral-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" defaultChecked />
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                           <Clock className="w-4 h-4 text-primary" />
                           <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Post-Due Sequence</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex items-center gap-3 px-4 py-3 border border-neutral-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                              <Checkbox id="day1" defaultChecked />
                              <Label htmlFor="day1" className="text-sm font-semibold flex-1">Day 1 Reminder</Label>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-lg bg-neutral-50">Mild</span>
                           </div>
                           <div className="flex items-center gap-3 px-4 py-3 border border-neutral-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                              <Checkbox id="day3" defaultChecked />
                              <Label htmlFor="day3" className="text-sm font-semibold flex-1">Day 3 Reminder</Label>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 rounded-lg bg-neutral-50">Neutral</span>
                           </div>
                           <div className="flex items-center gap-3 px-4 py-3 border border-neutral-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                              <Checkbox id="day7" defaultChecked />
                              <Label htmlFor="day7" className="text-sm font-semibold flex-1">Day 7 Follow-up</Label>
                              <span className="text-[10px] uppercase font-bold text-indigo-600 px-2 py-0.5 rounded-lg bg-indigo-50">Firm</span>
                           </div>
                           <div className="flex items-center gap-3 px-4 py-3 border border-neutral-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                              <Checkbox id="day15" defaultChecked />
                              <Label htmlFor="day15" className="text-sm font-semibold flex-1">Day 15 Escalation</Label>
                              <span className="text-[10px] uppercase font-bold text-rose-600 px-2 py-0.5 rounded-lg bg-rose-50">Urgent</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 transition-all">
                        <div className="space-y-1">
                           <Label className="text-base font-bold text-neutral-900 flex items-center gap-2">
                             Smart Escalation
                             <div className="h-5 w-10 bg-gradient-to-r from-primary to-indigo-500 rounded-full flex items-center justify-center text-[8px] text-white uppercase font-black">Pro</div>
                           </Label>
                           <p className="text-xs text-muted-foreground font-normal italic"> Automatically switch to owner's contact for persistent overdue cases.</p>
                        </div>
                        <Checkbox defaultChecked />
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Privacy and GDPR Section */}
               <Card className="rounded-3xl border border-neutral-100 shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-6">
                     <div className="flex items-center gap-3 mb-1">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <CardTitle className="text-lg font-bold">Privacy & GDPR Compliance</CardTitle>
                     </div>
                     <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manage data retention and customer consent.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                     <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50/50 border border-neutral-100">
                        <div className="space-y-0.5">
                           <Label className="text-sm font-semibold">Consent Verification</Label>
                           <p className="text-[11px] text-muted-foreground">Require customer opt-in before sending WhatsApp messages.</p>
                        </div>
                        <Checkbox defaultChecked />
                     </div>
                     <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50/50 border border-neutral-100">
                        <div className="space-y-0.5">
                           <Label className="text-sm font-semibold">Automatic Data Deletion</Label>
                           <p className="text-[11px] text-muted-foreground">Wipe invoice data 3 years after payment completion.</p>
                        </div>
                        <Checkbox defaultChecked />
                     </div>
                     <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                        <p className="text-[11px] text-rose-700 font-medium">⚠️ Important: This feature is mandatory under GDPR for customers in the European Union. Ensure your privacy policy is linked accurately.</p>
                     </div>
                  </CardContent>
               </Card>

               {/* n8n Integration Section */}
               <Card className="rounded-3xl border border-neutral-100 shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-6">
                     <div className="flex items-center gap-3 mb-1">
                        <BrainCircuit className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg font-bold">n8n Automation Flow</CardTitle>
                     </div>
                     <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connect your dashboard to the n8n flow you created.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                     <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Fetch Data (Read Webhook)</Label>
                           <Input 
                             defaultValue="https://n8n.your-site.com/webhook/read-sheet" 
                             className="rounded-xl h-12 bg-neutral-50 border-none font-mono text-xs focus:ring-primary shadow-sm" 
                           />
                           <p className="text-[10px] text-muted-foreground px-1">This webhook should return the JSON array from your Google Sheet.</p>
                        </div>
                        <div className="space-y-2 border-t border-neutral-50 pt-4">
                           <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Write Actions (Reminder Webhook)</Label>
                           <Input 
                             defaultValue="https://n8n.your-site.com/webhook/send-reminder" 
                             className="rounded-xl h-12 bg-neutral-50 border-none font-mono text-xs focus:ring-primary shadow-sm" 
                           />
                           <p className="text-[10px] text-muted-foreground px-1">Triggered when you send reminders from the dashboard.</p>
                        </div>
                     </div>
                     <div className="flex items-center justify-between py-2 border-b border-neutral-50">
                        <div className="flex items-center gap-3">
                           <Zap className="w-4 h-4 text-muted-foreground" />
                           <span className="text-sm font-semibold">Sync Dashboard Activity</span>
                        </div>
                        <Checkbox defaultChecked />
                     </div>
                     <div className="flex items-center justify-between py-2 border-b border-neutral-50">
                        <div className="flex items-center gap-3">
                           <Save className="w-4 h-4 text-muted-foreground" />
                           <span className="text-sm font-semibold">Log AI Sentiment to Customers</span>
                        </div>
                        <Checkbox defaultChecked />
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
