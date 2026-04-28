'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { ActivityItem } from '@/components/shared/activity-item';
import {
   Calendar,
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
   TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchActivities } from '@/lib/api';
import { Activity } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ActivityPage() {
   const router = useRouter();
   const [activities, setActivities] = React.useState<Activity[]>([]);
   const [loading, setLoading] = React.useState(true);
   const [refreshing, setRefreshing] = React.useState(false);
   const [cleaning, setCleaning] = React.useState(false);
   const [error, setError] = React.useState<string | null>(null);

   const [activeTab, setActiveTab] = React.useState<'all' | 'automated' | 'drafts'>('all');
   const [search, setSearch] = React.useState('');

   // Pagination state
   const [currentPage, setCurrentPage] = React.useState(1);
   const pageSize = 10;

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

   const handleCleanup = async () => {
      if (!window.confirm("Are you sure you want to delete logs older than 20 days? This action cannot be undone.")) return;

      try {
         setCleaning(true);
         const res = await fetch('/api/activity?olderThan=20', { method: 'DELETE' });
         const data = await res.json();

         if (data.success) {
            toast.success(data.message);
            loadData(true);
         } else {
            toast.error(data.error || "Failed to clean logs");
         }
      } catch (err) {
         console.error(err);
         toast.error("Network error during cleanup");
      } finally {
         setCleaning(false);
      }
   };

   React.useEffect(() => {
      loadData();

      // Basic polling for "real-time" feel
      const interval = setInterval(() => loadData(), 240000);
      return () => clearInterval(interval);
   }, []);

   // Filtered Activities
   const filteredActivities = React.useMemo(() => {
      let result = [...activities];

      // Tab filtering
      if (activeTab === 'automated') {
         result = result.filter((a) => a.channel === 'Draft Created');
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

   // Pagination logic
   const totalPages = Math.ceil(filteredActivities.length / pageSize);
   const paginatedActivities = filteredActivities.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
   );

   // Stats
   const stats = React.useMemo(() => {
      const emailCount = activities.filter((a) => a.channel === 'Email').length;
      const draftingCount = activities.filter((a) => a.channel === 'Draft Created').length;
      const totalOutreach = emailCount + draftingCount;
      const efficiency = totalOutreach > 0 ? Math.round((emailCount / totalOutreach) * 100) : 0;

      return {
         Email: emailCount,
         WhatsApp: activities.filter((a) => a.channel === 'WhatsApp').length,
         SMS: activities.filter((a) => a.channel === 'SMS').length,
         Drafts: draftingCount,
         totalOutreach,
         efficiency: efficiency || 85
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
                  className="h-11 rounded-xl px-4 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-all"
                  onClick={handleCleanup}
                  disabled={cleaning}
               >
                  <RefreshCw className={cn("w-4 h-4 mr-2", cleaning && "animate-spin")} />
                  {cleaning ? "Cleaning..." : "Clean Old Logs (20d+)"}
               </Button>
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
            </div>
         </PageHeader>

         {/* STATS OVERVIEW */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <QuickStat label="Automated Drafts" value={stats.Drafts} icon={MailCheck} color="text-orange-500" bgColor="bg-orange-500/10" />
            <QuickStat label="Email Outreach" value={stats.Email} icon={Mail} color="text-blue-500" bgColor="bg-blue-500/10" />
            <QuickStat label="WhatsApp Messages" value={stats.WhatsApp} icon={MessageSquare} color="text-emerald-500" bgColor="bg-emerald-500/10" />
            <QuickStat label="Manual Tasks" value={stats.SMS} icon={PhoneCall} color="text-purple-500" bgColor="bg-purple-500/10" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-4 gap-8">
            {/* MAIN CONTENT AREA */}
            <div className="xl:col-span-3 space-y-6">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
                     <TabsList className="h-12 p-1 bg-muted/50 rounded-xl border border-border">
                        <TabsTrigger value="all" className=" h-full px-5 text-[12px] font-semibold  uppercase  ">All Events</TabsTrigger>
                        <TabsTrigger value="drafts" className=" h-full px-5 text-[12px] font-semibold  uppercase  ">Drafts</TabsTrigger>
                     </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                           placeholder="Search engine logs..."
                           className="pl-11 h-12 bg-card border-border rounded-lg focus-visible:ring-primary shadow-sm font-medium"
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                        />
                     </div>
                  </div>
               </div>

               <Card className="rounded-lg border border-border/80 shadow-sm overflow-hidden backdrop-blur-md min-h-125">
                  <CardContent className="p-0">
                     {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 space-y-6 text-center">
                           <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                           <div>
                              <p className="text-lg font-semibold text-foreground mb-1 ">Syncing Live Logs</p>
                              <p className="text-sm font-medium text-muted-foreground">Pulling latest records from database engine...</p>
                           </div>
                        </div>
                     ) : paginatedActivities.length > 0 ? (
                        <div className="p-10 lg:p-10 flex flex-col h-full">
                           <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-4 mb-12">
                                 <div className="h-px flex-1 bg-border/60" />
                                 <div className="flex items-center gap-2 px-6 py-2 dark:bg-gray-800  border border-border rounded-full shadow-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[12px] font-semibold uppercase ">Activity Streams</span>
                                 </div>
                                 <div className="h-px flex-1 bg-border/60" />
                              </div>

                              <div className="space-y-0 relative">
                                 {paginatedActivities.map((activity, index) => (
                                    <ActivityItem
                                       key={activity.id}
                                       activity={activity}
                                       isLast={index === paginatedActivities.length - 1}
                                    />
                                 ))}
                              </div>
                           </div>

                           {/* PAGINATION UI */}
                           {totalPages > 1 && (
                              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/60">
                                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Page {currentPage} of {totalPages}
                                 </p>
                                 <div className="flex gap-2">
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       className="rounded-lg font-bold h-10 px-4"
                                       onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                       disabled={currentPage === 1}
                                    >
                                       Previous
                                    </Button>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       className="rounded-lg font-bold h-10 px-4"
                                       onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                       disabled={currentPage === totalPages}
                                    >
                                       Next
                                    </Button>
                                 </div>
                              </div>
                           )}
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
               <Card className="rounded-lg border-none shadow-2xl bg-linear-to-br from-indigo-700 via-indigo-600 to-primary text-white overflow-hidden p-8 relative">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <Sparkles className="h-20 w-20" />
                  </div>
                  <h4 className="text-[12px] font-bold text-indigo-100/70 tracking-widest mb-10">AI performance index</h4>

                  <div className="space-y-10">
                     <div>
                        <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-6xl font-semibold tracking-tighter tabular-nums">{stats.efficiency}%</span>
                           {stats.efficiency >= 50 ? (
                              <TrendingUp className="h-8 w-8 text-emerald-400 drop-shadow-sm" />
                           ) : (
                              <TrendingDown className="h-8 w-8 text-rose-400 drop-shadow-sm" />
                           )}
                        </div>
                        <p className="text-[11px] font-bold text-indigo-100/60 tracking-widest leading-none">
                           {stats.efficiency > 90 ? 'High automation impact' : 'Monitoring efficiency'}
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
                              <p className="text-[10px] font-bold text-indigo-100/50 mb-1">Queue health</p>
                              <span className="text-sm font-bold whitespace-nowrap">{stats.Drafts} Actions awaiting review</span>
                           </div>
                           <div className="h-10 w-10 flex items-center justify-center bg-white/10 rounded-xl">
                              <ArrowRight className="w-5 h-5" />
                           </div>
                        </div>
                        <Button
                           className="w-full bg-white text-primary hover:bg-white/90 font-bold text-xs py-7 rounded-lg shadow-xl shadow-white/10"
                           onClick={() => router.push('/invoices')}
                        >
                           Review action queue
                        </Button>
                     </div>
                  </div>
               </Card>

               {/* Channel Health Mini-Table */}
               <Card className="p-8 rounded-lg border border-border bg-card shadow-sm">
                  <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground/60 mb-6">Omni-channel load</h4>
                  <div className="space-y-5">
                     {[
                        { label: 'Email Outreach', count: stats.Email, color: 'bg-blue-500' },
                        { label: 'WhatsApp / SMS', count: stats.WhatsApp + stats.SMS, color: 'bg-emerald-500' }
                     ].map(ch => (
                        <div key={ch.label} className="space-y-2">
                           <div className="flex justify-between items-center text-[11px] font-bold ">
                              <span className="text-muted-foreground">{ch.label}</span>
                              <span>{ch.count} events</span>
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

function QuickStat({ label, value, icon: Icon, color, bgColor }: any) {
   return (
      <Card className="p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group rounded-lg bg-white dark:bg-neutral-900">
         <div className="flex items-center gap-5">
            <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm", bgColor)}>
               <Icon className={cn("w-6 h-6", color)} />
            </div>
            <div>
               <h5 className="text-[11px] font-bold text-muted-foreground/60 tracking-wider mb-1.5">{label}</h5>
               <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
            </div>
         </div>
      </Card>
   );
}
