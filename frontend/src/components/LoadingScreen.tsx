import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-50 py-12 px-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center flex-grow z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border border-slate-100">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACwx0lWli7S6ZzIeR9uc9vU4VCgtVyehYPmQRIfFa4KNSH9WdzP8wJtnIGC1i_CXhAwQ9WcYuy33y3EixdRANwwjxWdkQOwkhWnZ4gwczJmQJH_T1AjG-ouYrWR-g_aSgzmetLOhNXLYjfC8X9TXsCso1paGxwR_EwpaZLof986Vc_7Dhtk-Xnz-bJjWAtw5F7_JW7WR1P0NZdvJycJ7_ok3g3oceznb3td22ChjD3RFeLkF0rXFmYYA_uNg2GHmuEyGYWNKYSr4w")' }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-slate-100">
            <span className="material-symbols-outlined text-primary text-2xl">favorite</span>
          </div>
        </motion.div>

        <h1 className="text-primary tracking-tight text-4xl font-bold leading-tight text-center pb-2">EZTherapy</h1>
        <p className="text-slate-500 text-lg font-normal text-center max-w-[280px]">
          Empowering Progress, One Step at a Time
        </p>
      </div>

      <div className="flex flex-col items-center w-full max-w-[240px] z-10 gap-6">
        <div className="w-full">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Loading resources...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-slate-400/80 text-xs font-normal text-center">v1.0.2</p>
      </div>
    </div>
  );
}
