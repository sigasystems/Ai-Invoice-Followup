// 'use client';

// import * as React from 'react';
// import { DashboardLayout } from '@/components/layout/dashboard-layout';
// import { PageHeader } from '@/components/shared/page-header';
// import { ActivityItem } from '@/components/shared/activity-item';
// import { 
//   Calendar,
//   Filter,
//   Download,
//   Mail,
//   MessageSquare,
//   PhoneCall,
//   Search,
//   TrendingUp
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { fetchActivities } from '@/lib/api';
// import { Activity } from '@/types';
// import { format } from 'date-fns';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// export default function ActivityPage() {
//   const [activities, setActivities] = React.useState<Activity[]>([]);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     async function loadData() {
//       setLoading(true);
//       try {
//         const data = await fetchActivities();
//         setActivities(data);
//       } catch (error) {
//         console.error("Failed to load activities:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadData();
//   }, []);

//   // Calculate channel stats dynamically
//   const channelStats = {
//     Email: activities.filter(a => a.channel === 'Email').length,
//     WhatsApp: activities.filter(a => a.channel === 'WhatsApp').length,
//     SMS: activities.filter(a => a.channel === 'SMS').length,
//   };

//   return (
//     <DashboardLayout>
//       <PageHeader 
//         title="Activity Logs" 
//         description="Comprehensive audit trail of all manual and automated communication."
//       >
//         <div className="flex items-center gap-2">
//            <Button variant="outline" size="sm" className="h-11 rounded-xl px-5 border-border">
//              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
//              Export Logs
//            </Button>
//         </div>
//       </PageHeader>

//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
//          <Tabs defaultValue="all" className="w-full sm:w-auto">
//             <TabsList className="bg-muted/80 p-1 rounded-xl h-11 border border-border">
//                <TabsTrigger value="all" className="rounded-lg h-9 px-5 px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">All Activity</TabsTrigger>
//                <TabsTrigger value="automated" className="rounded-lg h-9 px-5 px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Automated</TabsTrigger>
//                <TabsTrigger value="manual" className="rounded-lg h-9 px-5 px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Manual</TabsTrigger>
//             </TabsList>
//          </Tabs>
//          <div className="flex items-center gap-2 w-full sm:w-auto">
//             <div className="relative flex-1 sm:w-64">
//                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                <Input placeholder="Search logs..." className="pl-10 h-11 border-border bg-card rounded-xl focus:ring-primary shadow-sm" />
//             </div>
//             <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border bg-card shadow-sm hover:bg-muted">
//                <Filter className="h-4 w-4 text-muted-foreground" />
//             </Button>
//          </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//          <div className="lg:col-span-3">
//             <Card className="rounded-[32px] border border-border/80 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
//                <CardContent className="p-0">
//                   {loading ? (
//                     <div className="flex flex-col items-center justify-center p-32 space-y-6">
//                       <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
//                       <p className="text-sm font-bold text-foreground leading-none">Syncing Database Logs...</p>
//                     </div>
//                   ) : activities.length > 0 ? (
//                     <div className="p-10">
//                       <div className="space-y-4">
//                         <div className="flex items-center gap-4 mb-10">
//                            <div className="h-px flex-1 bg-border" />
//                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-1.5 bg-muted border border-border rounded-full">Recent Database Records</span>
//                            <div className="h-px flex-1 bg-border" />
//                         </div>
//                         <div className="space-y-0 relative pl-4 lg:pl-10 pr-4">
//                            {activities.map((activity, index) => (
//                               <ActivityItem 
//                                 key={activity.id} 
//                                 activity={activity} 
//                                 isLast={index === activities.length - 1} 
//                               />
//                            ))}
//                         </div>
//                       </div>
//                       <Button variant="ghost" className="w-full mt-12 text-xs font-bold text-primary py-6 rounded-2xl hover:bg-primary/5 transition-all border border-dashed border-primary/20">
//                          View Extended Audit Trail
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center p-32 text-center">
//                       <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
//                         <Calendar className="h-8 w-8 text-muted-foreground" />
//                       </div>
//                       <h3 className="text-lg font-bold text-foreground">No activities found</h3>
//                       <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">There are no recorded communications in the database yet.</p>
//                     </div>
//                   )}
//                </CardContent>
//             </Card>
//          </div>

//          <div className="space-y-6">
//             <Card className="rounded-[24px] border border-border shadow-sm bg-card overflow-hidden p-6 hover:shadow-md transition-shadow">
//                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 px-1">Engagement Volume</h4>
//                <div className="space-y-5">
//                   <div className="flex items-center justify-between group">
//                      <div className="flex items-center gap-4">
//                         <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center ring-4 ring-blue-500/5 group-hover:scale-110 transition-transform">
//                            <Mail className="h-5 w-5 text-blue-500" />
//                         </div>
//                         <span className="text-sm font-bold text-foreground">Email</span>
//                      </div>
//                      <span className="text-sm font-black tabular-nums">{channelStats.Email}</span>
//                   </div>
//                   <div className="flex items-center justify-between group">
//                      <div className="flex items-center gap-4">
//                         <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/5 group-hover:scale-110 transition-transform">
//                            <MessageSquare className="h-5 w-5 text-emerald-500" />
//                         </div>
//                         <span className="text-sm font-bold text-foreground">WhatsApp</span>
//                      </div>
//                      <span className="text-sm font-black tabular-nums">{channelStats.WhatsApp}</span>
//                   </div>
//                   <div className="flex items-center justify-between group">
//                      <div className="flex items-center gap-4">
//                         <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center ring-4 ring-amber-500/5 group-hover:scale-110 transition-transform">
//                            <PhoneCall className="h-5 w-5 text-amber-500" />
//                         </div>
//                         <span className="text-sm font-bold text-foreground">SMS</span>
//                      </div>
//                      <span className="text-sm font-black tabular-nums">{channelStats.SMS}</span>
//                   </div>
//                </div>
//             </Card>

//             <Card className="rounded-[24px] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-primary text-white overflow-hidden p-7 relative">
//                <div className="absolute top-0 right-0 p-4 opacity-10">
//                   <TrendingUp className="h-16 w-16" />
//                </div>
//                <h3 className="text-2xl font-black mb-1">₹{(activities.length * 120).toLocaleString()}</h3>
//                <p className="text-xs text-white/80 font-bold uppercase tracking-widest mb-4">Estimated Efficiency</p>
//                <p className="text-xs text-white/70 leading-relaxed font-medium">The AI has processed <span className="text-white font-bold">{activities.length}</span> dynamic responses directly from the database schema.</p>
//             </Card>
//          </div>
//       </div>
//     </DashboardLayout>
//   );
// }




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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchActivities } from '@/lib/api';
import { Activity } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ActivityPage() {
   const [activities, setActivities] = React.useState<Activity[]>([]);
   const [loading, setLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);

   const [activeTab, setActiveTab] = React.useState<'all' | 'automated' | 'manual'>('all');
   const [search, setSearch] = React.useState('');

   // Fetch data
   React.useEffect(() => {
      async function loadData() {
         try {
            setLoading(true);
            setError(null);

            const data = await fetchActivities();
            setActivities(data);
         } catch (err) {
            console.error(err);
            setError('Failed to load activity logs');
         } finally {
            setLoading(false);
         }
      }

      loadData();
   }, []);

   // Filtered Activities
   const filteredActivities = React.useMemo(() => {
      let result = [...activities];

      // Tab filtering (adjust property names based on your Activity type)
      if (activeTab === 'automated') {
         result = result.filter((a) => 'automated' === 'automated');
      } else if (activeTab === 'manual') {
         result = result.filter((a) => 'manual' === 'manual');
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

   // Channel Stats
   const channelStats = React.useMemo(() => {
      return {
         Email: activities.filter((a) => a.channel === 'Email').length,
         WhatsApp: activities.filter((a) => a.channel === 'WhatsApp').length,
         SMS: activities.filter((a) => a.channel === 'SMS').length,
      };
   }, [activities]);

   return (
      <DashboardLayout>
         {/* HEADER */}
         <PageHeader
            title="Activity Logs"
            description="Audit trail of all communications (manual & automated)."
         >
            <Button variant="outline" size="sm" className="h-11 rounded-xl px-5">
               <Download className="w-4 h-4 mr-2" />
               Export Logs
            </Button>
         </PageHeader>

         {/* FILTER BAR */}
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
               <TabsList className="h-11 rounded-xl">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="automated">Automated</TabsTrigger>
                  <TabsTrigger value="manual">Manual</TabsTrigger>
               </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                     placeholder="Search logs..."
                     className="pl-9 h-11"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>

               <Button variant="outline" size="icon" className="h-11 w-11">
                  <Filter className="h-4 w-4" />
               </Button>
            </div>
         </div>

         {/* MAIN GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* LEFT: ACTIVITY LIST */}
            <div className="lg:col-span-3">
               <Card className="rounded-2xl">
                  <CardContent className="p-0">
                     {/* LOADING */}
                     {loading && (
                        <div className="flex flex-col items-center justify-center p-24">
                           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                           <p className="text-sm font-medium text-muted-foreground">
                              Loading activity logs...
                           </p>
                        </div>
                     )}

                     {/* ERROR */}
                     {error && (
                        <div className="p-20 text-center">
                           <p className="text-sm text-red-500 font-medium">{error}</p>
                        </div>
                     )}

                     {/* EMPTY */}
                     {!loading && !error && filteredActivities.length === 0 && (
                        <div className="p-20 text-center">
                           <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                           <h3 className="font-semibold">No activities found</h3>
                           <p className="text-sm text-muted-foreground">
                              Try adjusting filters or search query.
                           </p>
                        </div>
                     )}

                     {/* DATA */}
                     {!loading && !error && filteredActivities.length > 0 && (
                        <div className="p-6 space-y-4">
                           {filteredActivities.map((activity, index) => (
                              <ActivityItem
                                 key={activity.id}
                                 activity={activity}
                                 isLast={index === filteredActivities.length - 1}
                              />
                           ))}
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* RIGHT: STATS */}
            <div className="space-y-6">
               {/* CHANNEL STATS */}
               <Card className="p-6 rounded-2xl">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-4">
                     Engagement Volume
                  </h4>

                  <div className="space-y-4">
                     <StatItem icon={Mail} label="Email" value={channelStats.Email} />
                     <StatItem icon={MessageSquare} label="WhatsApp" value={channelStats.WhatsApp} />
                     <StatItem icon={PhoneCall} label="SMS" value={channelStats.SMS} />
                  </div>
               </Card>

               {/* KPI CARD */}
               <Card className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-primary text-white">
                  <TrendingUp className="h-10 w-10 opacity-20 mb-2" />
                  <h3 className="text-2xl font-bold">
                     ₹{(activities.length * 120).toLocaleString()}
                  </h3>
                  <p className="text-xs opacity-80 mt-1">Estimated Efficiency</p>
                  <p className="text-xs opacity-70 mt-2">
                     Based on {activities.length} processed activities.
                  </p>
               </Card>
            </div>
         </div>
      </DashboardLayout>
   );
}

/* ============================= */
/* Reusable Stat Component */
/* ============================= */
function StatItem({
   icon: Icon,
   label,
   value,
}: {
   icon: any;
   label: string;
   value: number;
}) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
               <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">{label}</span>
         </div>
         <span className="text-sm font-semibold">{value}</span>
      </div>
   );
}