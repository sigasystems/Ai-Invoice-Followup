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
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockActivities } from '@/lib/mock-data';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Activity Logs" 
        description="Comprehensive audit trail of all manual and automated communication."
      >
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-10 rounded-xl">
             <Download className="w-4 h-4 mr-2" />
             Export Logs
           </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
         <Tabs defaultValue="all" className="w-full sm:w-auto">
            <TabsList className="bg-neutral-100 p-1 rounded-xl h-11">
               <TabsTrigger value="all" className="rounded-lg h-9 px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">All Activity</TabsTrigger>
               <TabsTrigger value="automated" className="rounded-lg h-9 px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Automated</TabsTrigger>
               <TabsTrigger value="manual" className="rounded-lg h-9 px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Manual</TabsTrigger>
            </TabsList>
         </Tabs>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Search logs..." className="pl-9 h-11 border-neutral-100 bg-white rounded-xl focus:ring-primary" />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-neutral-100 bg-white">
               <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3">
            <Card className="rounded-3xl border border-neutral-100 shadow-sm overflow-hidden bg-white">
               <CardContent className="p-8">
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="h-0.5 flex-1 bg-neutral-100" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 bg-neutral-50 rounded-full">April 06, 2026</span>
                        <div className="h-0.5 flex-1 bg-neutral-100" />
                     </div>
                     <div className="space-y-0 relative pl-4 lg:pl-10 pr-4">
                        {mockActivities.map((activity, index) => (
                           <ActivityItem 
                             key={activity.id} 
                             activity={activity} 
                             isLast={index === mockActivities.length - 1} 
                           />
                        ))}
                     </div>
                     <div className="flex items-center gap-4 py-8">
                        <div className="h-0.5 flex-1 bg-neutral-100" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 bg-neutral-50 rounded-full">April 05, 2026</span>
                        <div className="h-0.5 flex-1 bg-neutral-100" />
                     </div>
                     <div className="space-y-0 relative pl-4 lg:pl-10 pr-4">
                        {mockActivities.slice(0, 2).map((activity, index) => (
                           <ActivityItem 
                             key={`old-${activity.id}`} 
                             activity={activity} 
                             isLast={index === 1} 
                           />
                        ))}
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full mt-10 text-xs font-semibold text-primary py-4 rounded-2xl hover:bg-primary/5 transition-all">
                     Load More History
                  </Button>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="rounded-3xl border border-neutral-100 shadow-sm bg-white overflow-hidden p-6">
               <h4 className="text-sm font-semibold mb-4">Volume by Channel</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                           <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Email</span>
                     </div>
                     <span className="text-sm font-bold">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                           <MessageSquare className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium">WhatsApp</span>
                     </div>
                     <span className="text-sm font-bold">86</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
                           <PhoneCall className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium">SMS</span>
                     </div>
                     <span className="text-sm font-bold">42</span>
                  </div>
               </div>
            </Card>

            <Card className="rounded-3xl border border-neutral-100 shadow-sm bg-primary/95 text-white overflow-hidden p-6">
               <h4 className="text-sm font-semibold mb-2">Automated Savings</h4>
               <p className="text-xs text-white/70 mb-4 font-medium italic">"The AI has saved you approx 24 hours of manual follow-ups this week."</p>
               <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold">₹1.8k</span>
                  <span className="text-sm mb-1 text-white/80">Estimated value</span>
               </div>
            </Card>
         </div>
      </div>
    </DashboardLayout>
  );
}
