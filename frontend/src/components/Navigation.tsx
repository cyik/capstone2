import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, MessageSquare, User, Users, Calendar, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export default function Navigation({ role }: { role: UserRole }) {
  const guardianItems = [
    { to: '/report', icon: ClipboardCheck, label: 'Questionnaire' },
    { to: '/calendar', icon: Calendar, label: 'Schedule' },
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const therapistItems = [
    { to: '/admin', icon: Users, label: 'Patients' },
    { to: '/calendar', icon: Calendar, label: 'Schedule' },
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const navItems = role === 'guardian' ? guardianItems : therapistItems;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 pb-safe pt-1 px-2 z-40 shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full transition-all gap-1 relative",
                isActive ? "text-primary" : "text-slate-400 hover:text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -top-1 w-12 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={22} className={cn("transition-transform", isActive && "scale-110")} />
                <span className={cn("text-[9px] font-bold uppercase tracking-tight", isActive ? "opacity-100" : "opacity-60")}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
