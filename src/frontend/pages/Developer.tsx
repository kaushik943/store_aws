import React from 'react';
import { ArrowLeft, Globe, Mail, Phone, MapPin, Zap, Code, Layout, Smartphone, Cloud, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface DeveloperProps {
  setView: (view: any) => void;
}

export const Developer: React.FC<DeveloperProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-20">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => { setView('home'); window.scrollTo(0, 0); }}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-emerald-400 transition-all mb-12 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <Zap size={20} fill="white" className="md:w-6 md:h-6 w-5 h-5" />
                </div>
                <span className="text-lg md:text-xl font-black italic tracking-tighter text-emerald-500 uppercase">AKmedia Pvt Limited</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter mb-6 md:mb-8 leading-[0.9]">
              WE BUILD THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">DIGITAL FUTURE.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed mb-8 md:mb-10 max-w-xl">
              AKmedia is a premiere technology solutions firm specializing in hyper-local commerce systems, high-performance web applications, and intuitive user experiences.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black italic tracking-tight transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                Start a Project
              </button>
              <button className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl font-black italic tracking-tight transition-all">
                Our Portfolio
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] md:aspect-square bg-gradient-to-br from-emerald-500/20 to-blue-600/20 rounded-[40px] md:rounded-[80px] border border-white/5 backdrop-blur-3xl p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <Terminal className="text-emerald-500 opacity-20 group-hover:opacity-60 transition-opacity" size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="text-sm font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Core Expertise</div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10"><Code size={20} /></div>
                    <span className="text-2xl font-black italic">Cloud Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10"><Layout size={20} /></div>
                    <span className="text-2xl font-black italic">UI/UX Engineering</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10"><Smartphone size={20} /></div>
                    <span className="text-2xl font-black italic">Mobile Ecosystems</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-20 md:pb-32">
          {[
            { icon: <Mail />, title: "Email Us", detail: "contact@akmedia.in", color: "from-pink-500 to-rose-500" },
            { icon: <Phone />, title: "Call Us", detail: "+91 98765 43210", color: "from-emerald-500 to-teal-500" },
            { icon: <MapPin />, title: "Location", detail: "Bank Road, Raxaul, Bihar - 845305", color: "from-blue-500 to-indigo-500" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] hover:border-white/10 transition-all group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20`}>
                {item.icon}
              </div>
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">{item.title}</h3>
              <p className="text-xl font-black italic">{item.detail}</p>
            </motion.div>
          ))}
        </div>

        <div className="pt-20 border-t border-slate-900 text-center">
          <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">
            AKmedia Pvt Limited © 2026 - All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};
