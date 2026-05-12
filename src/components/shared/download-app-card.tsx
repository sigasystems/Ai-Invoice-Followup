import { motion } from 'framer-motion';
import { Monitor, Apple, ShieldCheck, Box, Terminal, Computer } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export function DownloadAppCard() {
  const handleDownload = (platform: 'windows' | 'macos') => {
    const fileName = platform === 'windows' ? 'paypilot-setup.exe' : 'paypilot-installer.dmg';
    const platformName = platform === 'windows' ? 'Windows' : 'macOS';
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Preparing ${platformName} installer...`,
        success: () => {
          const link = document.createElement('a');
          link.href = `/${fileName}`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return `${platformName} App downloaded successfully!`;
        },
        error: 'Download server is busy. Please try again.',
      }
    );
  };

  return (
    <motion.div
      id="download-app-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-indigo-950 p-8 lg:p-14 text-white shadow-2xl shadow-indigo-500/10 mb-10 scroll-mt-24 border border-white/5"
    >
      {/* Decorative background elements */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-[11px] font-bold tracking-[0.2em] uppercase backdrop-blur-md border border-indigo-500/20 text-indigo-300">
            <Monitor className="h-3.5 w-3.5" />
            <span>Premium Desktop App</span>
          </div>
          
          <div className="space-y-5">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              Experience Power <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300 font-black">On Your Desktop.</span>
            </h2>
            
            <p className="max-w-md text-lg font-medium text-neutral-400 leading-relaxed">
              Unlock the full potential of PayPilot with our native desktop client. Multi-window support, system-wide shortcuts, and offline audit modes.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 pt-4">
            <button 
              onClick={() => handleDownload('windows')}
              className="group flex items-center gap-4 rounded-2xl bg-white px-8 py-4 font-bold text-neutral-900 transition-all hover:bg-indigo-50 hover:scale-[1.03] active:scale-[0.97] shadow-2xl"
            >
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Monitor className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] uppercase opacity-60 font-black tracking-wider">Download for</p>
                <p className="text-lg font-black">Windows 11</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleDownload('macos')}
              className="group flex items-center gap-4 rounded-2xl bg-neutral-700/50 backdrop-blur-xl px-8 py-4 font-bold text-white transition-all hover:bg-neutral-700 hover:scale-[1.03] active:scale-[0.97] shadow-2xl border border-white/10"
            >
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Apple className="h-5 w-5 text-white" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] uppercase opacity-60 font-black tracking-wider">Download for</p>
                <p className="text-lg font-black">macOS</p>
              </div>
            </button>
          </div>
          
          <div className="mt-10 flex items-center gap-8">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <div className="leading-tight">
                  <p className="text-xs font-black text-white">Verified Security</p>
                  <p className="text-[10px] text-neutral-500 font-bold">256-bit Encrypted</p>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex items-center gap-3">
                <Box className="h-6 w-6 text-indigo-400" />
                <div className="leading-tight">
                  <p className="text-xs font-black text-white">Latest Version</p>
                  <p className="text-[10px] text-neutral-500 font-bold">Build 4.2.0-STABLE</p>
                </div>
             </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative group w-full max-w-[540px]">
            {/* Desktop Mockup Container */}
            <div className="relative aspect-[16/10] rounded-3xl bg-neutral-900 border-8 border-neutral-800 shadow-[0_0_80px_rgba(79,70,229,0.15)] overflow-hidden transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-[0_0_100px_rgba(79,70,229,0.25)]">
               <div className="absolute inset-0 bg-neutral-950/20 z-10 pointer-events-none" />
               <Image 
                  src="/desktop-app-mockup.png" 
                  alt="Desktop App Mockup"
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
               />
               
               {/* UI Overlay */}
               <div className="absolute top-4 left-4 flex gap-1.5 z-20">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
               </div>
            </div>

            {/* Support Bar */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 w-32 bg-neutral-800 rounded-b-xl border-x-4 border-b-4 border-neutral-900/50" />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-2 w-48 bg-neutral-800/80 blur-[2px] rounded-full" />
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-10 top-1/4 rounded-2xl bg-white/5 backdrop-blur-xl p-5 shadow-2xl border border-white/10 z-30"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Terminal className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Automation</p>
                  <p className="text-base font-black text-white">Live Console</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 bottom-1/4 rounded-2xl bg-emerald-500/10 backdrop-blur-xl p-5 shadow-2xl border border-emerald-500/20 z-30"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Computer className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Native App</p>
                  <p className="text-base font-black text-white">Offline Ready</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
