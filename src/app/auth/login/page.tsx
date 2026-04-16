'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Zap, 
  CheckCircle2,
  TrendingUp,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { login } from '@/lib/auth';

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid work email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (values.email === 'admin@gmail.com' && values.password === '123123123') {
      login(); // CRITICAL: Sets the session state
      toast.success('Access Granted', {
        description: 'Welcome back to your dashboard.',
      });
      router.push('/dashboard');
    } else {
      toast.error('Authentication Failed', {
        description: 'Please check your credentials and try again.',
      });
      form.setError('password', { message: 'Invalid email or password' });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-neutral-950">
      {/* Background Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 grid w-full lg:grid-cols-2">
        
        {/* Left Side: Branding & Info (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">PayPilot</span>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-6xl font-black leading-tight">
                Automate Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Receivables.</span>
              </h1>
              <p className="mt-6 text-xl text-neutral-400 max-w-md font-medium">
                The most advanced AI-powered invoicing platform for modern finance teams.
              </p>
            </motion.div>


            
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6"
          >
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-10 w-10 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="h-full w-full object-cover" />
                 </div>
               ))}
            </div>
            <p className="text-neutral-500 text-sm font-semibold">
               Join <span className="text-neutral-200">2,500+</span> finance teams using PayPilot.
            </p>
          </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: CheckCircle2, label: "99% Success Rate" },
                { icon: TrendingUp, label: "3x Faster Collections" },
                { icon: Globe, label: "Global Compliance" },
                { icon: ShieldCheck, label: "Enterprise Security" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-300">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-neutral-500 text-sm font-medium"
          >
            &copy; 2026 PayPilot . All rights reserved.
          </motion.div>

        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center p-6 lg:p-12 bg-white/5 backdrop-blur-3xl border-l border-white/10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md space-y-8"
          >
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                 <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                    <Zap className="h-7 w-7 text-white" />
                 </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
              <p className="mt-2 text-neutral-400 font-medium">Please enter your details to sign in.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-300 font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="admin@gmail.com" 
                              {...field} 
                              className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-neutral-300 font-semibold">Password</FormLabel>
                          <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-primary transition-colors" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                              className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-neutral-400 cursor-pointer">
                            Keep me logged in for 30 days
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Validating...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        Sign in to Dashboard
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                {/* <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-neutral-500 font-bold tracking-widest">or continue with</span>
                  </div>
                </div> */}

                {/* <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" className="h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold">
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold">
                    Azure AD
                  </Button>
                </div> */}

                <p className="text-center text-sm text-neutral-400 font-medium pt-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-primary font-bold hover:underline underline-offset-4">
                    Get started for free
                  </Link>
                </p>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

