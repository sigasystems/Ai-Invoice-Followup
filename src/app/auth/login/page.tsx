'use client';

import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/5">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black  text-neutral-900 mt-2">PayPilot</h1>
          <p className="text-sm font-medium text-muted-foreground italic">"Your receivables, on autopilot."</p>
        </div>

        <Card className="rounded-3xl border border-neutral-100 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-sm font-medium">Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold ml-1">Work Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    className="pl-12 h-14 rounded-2xl bg-neutral-50/50 border-none focus:bg-white focus:ring-2 focus:ring-primary shadow-sm text-base font-medium"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass" className="text-sm font-bold ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-14 rounded-2xl bg-neutral-50/50 border-none focus:bg-white focus:ring-2 focus:ring-primary shadow-sm text-base font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" className="rounded-md border-neutral-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="remember" className="text-xs font-semibold text-muted-foreground cursor-pointer">Remember me</Label>
                </div>
                <Link href="#" className="text-xs font-bold text-primary hover:underline underline-offset-4">Forgot password?</Link>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:translate-y-1" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex justify-center border-t border-neutral-50 bg-neutral-50/20">
            <p className="text-sm font-medium text-muted-foreground">
              New here? <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create an account</Link>
            </p>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground/40 uppercase  mt-8">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <span className="h-1 w-1 rounded-full bg-neutral-200" />
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          <span className="h-1 w-1 rounded-full bg-neutral-200" />
          <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
        </div>
      </div>
    </div>
  );
}
