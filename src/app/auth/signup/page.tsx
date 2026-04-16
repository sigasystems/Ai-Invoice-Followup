'use client';

import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, Building } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Account created successfully!');
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/5">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black  text-neutral-900 mt-2">PayPilot</h1>
          <p className="text-sm font-medium text-muted-foreground italic">"Join the future of receivables management."</p>
        </div>

        <Card className="rounded-3xl border border-neutral-100 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
            <CardDescription className="text-sm font-medium">Create your 14-day free trial account today.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold ml-1 uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input id="name" placeholder="John Doe" className="pl-12 h-12 rounded-xl bg-neutral-50/50 border-none focus:bg-white focus:ring-2 focus:ring-primary shadow-sm font-medium" required />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-bold ml-1 uppercase tracking-wider text-muted-foreground">Company Name</Label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="company" placeholder="Acme Inc." className="pl-12 h-12 rounded-xl bg-neutral-50/50 border-none focus:bg-white focus:ring-2 focus:ring-primary shadow-sm font-medium" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold ml-1 uppercase tracking-wider text-muted-foreground">Work Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="email" type="email" placeholder="john@company.com" className="pl-12 h-12 rounded-xl bg-neutral-50/50 border-none focus:bg-white focus:ring-2 focus:ring-primary shadow-sm font-medium" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-xs font-bold ml-1 uppercase tracking-wider text-muted-foreground">Master Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="pass" type="password" placeholder="••••••••" className="pl-12 h-12 rounded-xl bg-neutral-50/50 border-none focus:bg-white focus:ring-2 focus:ring-primary shadow-sm font-medium" required />
                </div>
              </div>

              <div className="flex items-start gap-2 px-1 pt-2">
                <Checkbox id="terms" className="mt-0.5 rounded-md border-neutral-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" required />
                <Label htmlFor="terms" className="text-[11px] font-medium text-muted-foreground leading-normal cursor-pointer">
                  I agree to the <Link href="#" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                </Label>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:translate-y-1 mt-2" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Start Free Trial"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex justify-center border-t border-neutral-50 bg-neutral-50/20">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Sign in instead</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
