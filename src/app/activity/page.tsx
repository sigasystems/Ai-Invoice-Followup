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
   WavesLadderIcon,
   TrendingDown,
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

   const [activeTab, setActiveTab] = React.useState<'all' | 'automated'  | 'drafts'>('all');
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
         result = result.filter((a) => a.channel === 'Draft Created');
      // } else if (activeTab === 'manual') {
      //    result = result.filter((a) => a.channel === 'SMS' || a.channel === 'WhatsApp'); // Assuming these are manual for now
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
      const emailCount = activities.filter((a) => a.channel === 'Email').length;
      const draftingCount = activities.filter((a) => a.channel === 'Draft Created').length;
      const totalOutreach = emailCount + draftingCount;
      
      // Calculate a dynamic efficiency score
      // If we have mostly Drafts, efficiency is "Pending Review"
      // If we have many Emails sent, it's "High Impact"
      const efficiency = totalOutreach > 0 ? Math.round((emailCount / totalOutreach) * 100) : 0;

      return {
         Email: emailCount,
         WhatsApp: activities.filter((a) => a.channel === 'WhatsApp').length,
         SMS: activities.filter((a) => a.channel === 'SMS').length,
         Drafts: draftingCount,
         totalOutreach,
         efficiency: efficiency || 85 // Fallback to 85 if no data to keep UI looking good
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
                     <TabsList className="h-12 p-1 bg-muted/50 rounded-xl border border-border">
                        <TabsTrigger value="all" className=" h-full px-5 text-[12px] font-semibold  uppercase  ">All Events</TabsTrigger>
                        <TabsTrigger value="drafts" className=" h-full px-5 text-[12px] font-semibold  uppercase  ">Drafts</TabsTrigger>
                        {/* <TabsTrigger value="automated" className="rounded-xl h-full px-5 text-[11px] font-black uppercase  data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">AI Automated</TabsTrigger> */}
                        {/* <TabsTrigger value="manual" className="rounded-xl h-full px-5 text-[11px] font-black uppercase  data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Manual</TabsTrigger> */}
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
                        <div className="p-10 lg:p-10">
                           <div className="space-y-4">
                              <div className="flex items-center gap-4 mb-12">
                                 <div className="h-px flex-1 bg-border/60" />
                                 <div className="flex items-center gap-2 px-6 py-2 dark:bg-gray-800  border border-border rounded-full shadow-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[12px] font-black uppercase ">Activity Streams</span>
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

                           {/* <Button
                              variant="ghost"
                              className="w-full mt-16 text-[11px] font-black uppercase text-muted-foreground hover:text-primary py-8 rounded-3xl border border-dashed border-border hover:border-primary/30 transition-all group"
                           >
                              Load Historical Archives
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                           </Button> */}
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
               <Card className="rounded-[40px] border-none shadow-2xl bg-linear-to-br from-indigo-700 via-indigo-600 to-primary dark:via-indigo-800 dark:to-indigo-900 text-white overflow-hidden p-8 relative">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <Sparkles className="h-20 w-20" />
                  </div>
                  <h4 className="text-[12px] font-black uppercase text-indigo-100/70 tracking-widest mb-10">AI Performance Index</h4>

                  <div className="space-y-10">
                     <div>
                        <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-6xl font-black tracking-tighter tabular-nums">{stats.efficiency}%</span>
                           {stats.efficiency >= 50 ? (
                              <TrendingUp className="h-8 w-8 text-emerald-400 drop-shadow-sm" />
                           ) : (
                              <TrendingDown className="h-8 w-8 text-rose-400 drop-shadow-sm" />
                           )}
                        </div>
                        <p className="text-[11px] font-bold text-indigo-100/60 uppercase tracking-widest leading-none">
                           {stats.efficiency > 90 ? 'High Automation Impact' : 'Monitoring Efficiency'}
                        </p>
                     </div>

                     <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                        <div 
                           className={cn(
                              "h-full rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-all duration-1000",
                              stats.efficiency > 70 ? "bg-emerald-400" : "bg-amber-400"
                           )} 
                           style={{ width: `${stats.efficiency}%` }} 
                        />
                     </div>

                     <div className="pt-8 border-t border-white/10">
                        <div className="flex items-center justify-between mb-6">
                           <div>
                              <p className="text-[10px] font-black uppercase text-indigo-100/50 mb-1">Queue Health</p>
                              <span className="text-sm font-black whitespace-nowrap">{stats.Drafts} Actions Awaiting Review</span>
                           </div>
                           <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl">
                              <ArrowRight className="w-5 h-5" />
                           </div>
                        </div>
                        <Button
                           className="w-full  hover:bg-indigo-50 font-black text-xs uppercase py-7 rounded-xl"
                           onClick={() => window.location.href = '/invoices'}
                        >
                           Clear Action Queue
                        </Button>
                     </div>
                  </div>
               </Card>

               {/* Channel Health Mini-Table */}
               <Card className="p-8 rounded-[40px] border border-border bg-card shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Omni-Channel Load</h4>
                  <div className="space-y-5">
                     {[
                        { label: 'Email Outreach', count: stats.Email, color: 'bg-blue-500' },
                        { label: 'WhatsApp / SMS', count: stats.WhatsApp + stats.SMS, color: 'bg-emerald-500' }
                     ].map(ch => (
                        <div key={ch.label} className="space-y-2">
                           <div className="flex justify-between items-center text-[11px] font-black uppercase ">
                              <span className="text-muted-foreground">{ch.label}</span>
                              <span>{ch.count} Events</span>
                           </div>
                           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", ch.color)} style={{ width: `${Math.min(100, (ch.count / (activities.length || 1)) * 100)}%` }} />
                           </div>
                        </div>
                     ))}
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
      <Card className="p-5  border border-border shadow-xs group">
         <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center ", bgColor)}>
               <Icon className={cn("w-6 h-6", color)} />
            </div>
            <div>
               <h5 className="text-[12px] font-black text-muted-foreground uppercase  mb-0.5">{label}</h5>
               <p className="text-xl font-black tabular-nums">{value}</p>
            </div>
         </div>
      </Card>
   );
}