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
  User,
  Building,
  Sparkles,
  Rocket,
  Check
} from 'lucide-react';

import { cn } from '@/lib/utils';
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
const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  companyName: z.string().min(2, { message: "Company name is required." }),
  email: z.string().email({ message: "Please enter a valid work email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions."
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    // Simulate API registration
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Account Created', {
      description: "Welcome to PayPilot AI! You're ready to automate.",
    });
    
    login(); // Auto-login
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-neutral-950">
      {/* Background Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 grid w-full lg:grid-cols-2">
        
        {/* Left Side: Benefits & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 text-white bg-gradient-to-br from-neutral-900/50 to-transparent">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">PayPilot <span className="text-primary">AI</span></span>
          </motion.div>

          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                 <Rocket className="h-3.5 w-3.5" />
                 <span>Free 14-day Enterprise Trial</span>
              </div> */}
              <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                Scale Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500">Business Faster.</span>
              </h1>
              <p className="mt-6 text-lg  max-w-lg font-medium leading-relaxed">
                Join thousands of high-growth companies using PayPilot to automate 90% of their accounts receivable workload.
              </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="space-y-6"
            >
              {[
                "Deploy in under 10 minutes with ERP sync.",
                "AI follow-up cadences that sound human.",
                "Real-time DSO and cash flow forecasting.",
                "White-labeled customer payment portals."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                     <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-neutral-300 font-semibold">{text}</span>
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
            &copy; 2026 PayPilot AI. Built for finance leaders.
          </motion.div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="flex items-center justify-center p-6 lg:p-16 bg-white/5 backdrop-blur-3xl lg:border-l lg:border-white/5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-10"
          >
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-4xl font-extrabold tracking-tight text-white">Create Account</h2>
              <p className=" font-medium text-lg">Start your automation journey today.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className=" font-bold uppercase tracking-widest text-[12px] ml-1">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-primary transition-colors" />
                            <Input placeholder="John Doe" {...field} className="pl-12 h-13 bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-700 focus:ring-primary/40 focus:border-primary transition-all rounded-2xl" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className=" font-bold uppercase tracking-widest text-[12px] ml-1">Company Name</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-primary transition-colors" />
                            <Input placeholder="Acme Global" {...field} className="pl-12 h-13 bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-700 focus:ring-primary/40 focus:border-primary transition-all rounded-2xl" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className=" font-bold uppercase tracking-widest text-[12px] ml-1">Work Email</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-primary transition-colors" />
                            <Input placeholder="john@company.com" {...field} className="pl-12 h-13  border-neutral-800 text-white placeholder:text-neutral-700 focus:ring-primary/40 focus:border-primary transition-all rounded-2xl" />
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
                      <FormItem className="space-y-2">
                        <FormLabel className=" font-bold uppercase tracking-widest text-[12px] ml-1">Master Password</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-primary transition-colors" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                              className="pl-12 pr-12 h-13  border-neutral-800 text-white placeholder:text-neutral-700 focus:ring-primary/40 focus:border-primary transition-all rounded-2xl" 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
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

                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="bg-neutral-900 border-neutral-800 rounded-lg shrink-0"
                          />
                        </FormControl>
                        <div className="leading-none">
                          <FormLabel className="text-xs font-semibold text-neutral-500 cursor-pointer select-none">
                            I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormMessage className="mt-2 ml-1" />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-15 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] group mt-4"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                        <span>CREATING ACCOUNT...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                         <span>INITIALIZE TRIAL</span>
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                <p className="text-center text-sm text-neutral-500 font-semibold pt-6">
                  Already a member?{' '}
                  <Link href="/auth/login" className="text-primary font-black hover:underline underline-offset-4">
                    Sign in to workspace
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
