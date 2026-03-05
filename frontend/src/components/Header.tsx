import React from 'react';
import { Bell, Puzzle } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  showNotification?: boolean;
  rightElement?: React.ReactNode;
}

export default function Header({ title, subtitle, avatar, showNotification, rightElement }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md p-4 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatar ? (
            <div className="relative">
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary"
                style={{ backgroundImage: `url(${avatar})` }}
              />
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <Puzzle size={24} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-slate-900 text-lg font-bold leading-tight truncate">{title}</h2>
            {subtitle && <p className="text-slate-500 text-xs font-medium truncate">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showNotification && (
            <button className="flex items-center justify-center size-10 rounded-full bg-slate-50 text-slate-600 shrink-0">
              <Bell size={20} />
            </button>
          )}
          {rightElement}
        </div>
      </div>
    </header>
  );
}
