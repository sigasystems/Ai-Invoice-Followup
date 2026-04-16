'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { ActivityItem } from '@/components/shared/activity-item';
import {
   Calendar,
   Filter,
   Download,
   Mail,
   MessageSquare,
   PhoneCall,
   Search,
   TrendingUp,
   RefreshCw,
   Sparkles,
   ArrowRight,
   MailCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchActivities } from '@/lib/api';
import { Activity } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ActivityPage() {
   const [activities, setActivities] = React.useState<Activity[]>([]);
   const [loading, setLoading] = React.useState(true);
   const [refreshing, setRefreshing] = React.useState(false);
   const [error, setError] = React.useState<string | null>(null);

   const [activeTab, setActiveTab] = React.useState<'all' | 'automated' | 'manual' | 'drafts'>('all');
   const [search, setSearch] = React.useState('');

   // Real-time Fetch simulation logic (Poll every 10s or manual refresh)
   const loadData = async (isManual = false) => {
      try {
         if (isManual) setRefreshing(true);
         else setLoading(true);

         const data = await fetchActivities();
         setActivities(data);

         if (isManual) toast.success("Logs synced with database.");
      } catch (err) {
         console.error(err);
         setError('Failed to load activity logs');
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   React.useEffect(() => {
      loadData();

      // Basic polling for "real-time" feel
      const interval = setInterval(() => loadData(), 15000);
      return () => clearInterval(interval);
   }, []);

   // Filtered Activities
   const filteredActivities = React.useMemo(() => {
      let result = [...activities];

      // Tab filtering
      if (activeTab === 'automated') {
         // Based on your backend, 'Draft Created' and 'Email' (sent by system) are automated
         result = result.filter((a) => a.channel === 'Draft Created' || a.status === 'Delivered');
      } else if (activeTab === 'manual') {
         result = result.filter((a) => a.channel === 'SMS' || a.channel === 'WhatsApp'); // Assuming these are manual for now
      } else if (activeTab === 'drafts') {
         result = result.filter((a) => a.channel === 'Draft Created');
      }

      // Search filtering
      if (search.trim()) {
         const q = search.toLowerCase();
         result = result.filter(
            (a) =>
               a.customerName?.toLowerCase().includes(q) ||
               a.channel?.toLowerCase().includes(q) ||
               a.message?.toLowerCase().includes(q)
         );
      }

      return result;
   }, [activities, activeTab, search]);

   // Stats
   const stats = React.useMemo(() => {
      return {
         Email: activities.filter((a) => a.channel === 'Email').length,
         WhatsApp: activities.filter((a) => a.channel === 'WhatsApp').length,
         SMS: activities.filter((a) => a.channel === 'SMS').length,
         Drafts: activities.filter((a) => a.channel === 'Draft Created').length,
      };
   }, [activities]);

   return (
      <DashboardLayout>
         {/* HEADER */}
         <PageHeader
            title="Activity Engine"
            description="Complete real-time audit trail of all manual interactions and automated AI follow-ups."
         >
            <div className="flex items-center gap-3">
               <Button
                  variant="outline"
                  size="sm"
                  className="h-11 rounded-xl px-4 bg-background border-border hover:bg-muted font-bold transition-all"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
               >
                  <RefreshCw className={cn("w-4 h-4 mr-2 text-primary", refreshing && "animate-spin")} />
                  {refreshing ? "Syncing..." : "Sync Logs"}
               </Button>
               <Button variant="outline" size="sm" className="h-11 rounded-xl px-4 border-border font-bold">
                  <Download className="w-4 h-4 mr-2" />
                  Export
               </Button>
            </div>
         </PageHeader>

         {/* STATS OVERVIEW */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <QuickStat label="Automated Drafts" value={stats.Drafts} icon={MailCheck} color="text-orange-500" bgColor="bg-orange-500/10" />
            <QuickStat label="Email Outreach" value={stats.Email} icon={Mail} color="text-blue-500" bgColor="bg-blue-500/10" />
            <QuickStat label="WhatsApp Messages" value={stats.WhatsApp} icon={MessageSquare} color="text-emerald-500" bgColor="bg-emerald-500/10" />
            <QuickStat label="Manual Tasks" value={stats.SMS} icon={PhoneCall} color="text-purple-500" bgColor="bg-purple-500/10" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-3 space-y-6">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full sm:w-auto">
                     <TabsList className="h-12 p-1.5 bg-muted/50 rounded-2xl border border-border">
                        <TabsTrigger value="all" className="rounded-xl h-full px-5 text-[11px] font-black uppercase  data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">All Events</TabsTrigger>
                        <TabsTrigger value="drafts" className="rounded-xl h-full px-5 text-[11px] font-black uppercase  data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Drafts</TabsTrigger>
                        <TabsTrigger value="automated" className="rounded-xl h-full px-5 text-[11px] font-black uppercase  data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">AI Automated</TabsTrigger>
                        <TabsTrigger value="manual" className="rounded-xl h-full px-5 text-[11px] font-black uppercase  data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Manual</TabsTrigger>
                     </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                           placeholder="Search engine logs..."
                           className="pl-11 h-12 bg-card border-border rounded-2xl focus-visible:ring-primary shadow-sm"
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                        />
                     </div>
                  </div>
               </div>

               <Card className="rounded-[40px] border border-border/80 shadow-sm overflow-hidden backdrop-blur-md">
                  <CardContent className="p-0">
                     {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 space-y-6 text-center">
                           <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                           <div>
                              <p className="text-lg font-black text-foreground mb-1 ">Syncing Live Logs</p>
                              <p className="text-sm font-medium text-muted-foreground">Pulling latest records from database engine...</p>
                           </div>
                        </div>
                     ) : filteredActivities.length > 0 ? (
                        <div className="p-10 lg:p-14">
                           <div className="space-y-4">
                              <div className="flex items-center gap-4 mb-12">
                                 <div className="h-px flex-1 bg-border/60" />
                                 <div className="flex items-center gap-2 px-6 py-2 bg-neutral-50 border border-border rounded-full shadow-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black  uppercase text-black">Activity Streams</span>
                                 </div>
                                 <div className="h-px flex-1 bg-border/60" />
                              </div>

                              <div className="space-y-0 relative">
                                 {filteredActivities.map((activity, index) => (
                                    <ActivityItem
                                       key={activity.id}
                                       activity={activity}
                                       isLast={index === filteredActivities.length - 1}
                                    />
                                 ))}
                              </div>
                           </div>

                           <Button
                              variant="ghost"
                              className="w-full mt-16 text-[11px] font-black uppercase text-muted-foreground hover:text-primary py-8 rounded-3xl border border-dashed border-border hover:border-primary/30 transition-all group"
                           >
                              Load Historical Archives
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                           </Button>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center p-32 text-center opacity-60">
                           <div className="h-20 w-20 bg-muted/50 rounded-[32px] flex items-center justify-center mb-6">
                              <Calendar className="h-10 w-10 text-muted-foreground" />
                           </div>
                           <h3 className="text-xl font-bold text-foreground">No Events Recorded</h3>
                           <p className="text-sm text-muted-foreground mt-2 max-w-70">No interactions match your current database filter protocols.</p>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* SIDEBAR ANALYTICS */}
            <div className="space-y-8">
               {/* AI INSIGHT CARD */}
               <Card className="rounded-[32px] border-none shadow-2xl bg-linear-to-br from-indigo-700 to-primary text-white overflow-hidden p-8 relative">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <Sparkles className="h-20 w-20" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase text-white/70 mb-8">AI Efficiency Score</h4>

                  <div className="space-y-8">
                     <div>
                        <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-5xl font-black">94%</span>
                           <TrendingUp className="h-6 w-6 text-emerald-300" />
                        </div>
                        <p className="text-xs font-semibold text-white/80">Response accuracy from pending drafts.</p>
                     </div>

                     <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]" style={{ width: '94%' }} />
                     </div>

                     <div className="pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[11px] font-bold  text-rose-200">Pending Actions</span>
                           <span className="text-sm font-black px-2 py-0.5 rounded-lg bg-white/20">{stats.Drafts}</span>
                        </div>
                        <Button
                           className="w-full bg-white text-primary hover:bg-white/90 font-black text-xs uppercase  py-6 rounded-2xl shadow-xl transition-all"
                           onClick={() => window.location.href = '/invoices'}
                        >
                           Review Drafts
                        </Button>
                     </div>
                  </div>
               </Card>

               {/* SMART TIPS */}
               <Card className="p-8 rounded-[32px] border border-border bg-muted/30">
                  <h4 className="text-xs font-black uppercase  mb-6">Automation Tip</h4>
                  <div className="space-y-4">
                     <div className="flex gap-4 p-4 rounded-2xl bg-white border border-border shadow-xs">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 shrink-0 flex items-center justify-center text-primary">
                           <MailCheck className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-black mb-1 leading-tight">Batch Approval</p>
                           <p className="text-[11px] font-medium text-muted-foreground">Approve multiple drafts at once to save 12s per invoice cycle.</p>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </DashboardLayout>
   );
}

/* ============================= */
/* REUSABLE UI COMPONENTS */
/* ============================= */

function QuickStat({ label, value, icon: Icon, color, bgColor }: any) {
   return (
      <Card className="p-5 rounded-3xl border border-border shadow-xs group hover:shadow-md transition-all">
         <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bgColor)}>
               <Icon className={cn("w-6 h-6", color)} />
            </div>
            <div>
               <h5 className="text-[10px] font-black text-muted-foreground uppercase  mb-0.5">{label}</h5>
               <p className="text-xl font-black tabular-nums">{value}</p>
            </div>
         </div>
      </Card>
   );
}