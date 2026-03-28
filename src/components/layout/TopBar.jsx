import React from 'react';
import { Bell, Menu } from 'lucide-react';

const TopBar = ({ title, user, onMenuClick }) => {
  const today = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Capitalize first letter of weekday
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="h-16 bg-white border-b border-border px-7 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-text hover:text-primary transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-text leading-tight">{title}</h1>
          <p className="text-[11px] text-text-muted mt-0.5">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-radius-sm border border-border flex items-center justify-center text-text hover:bg-bg transition-all relative group">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
          
          {/* Simple Tooltip on hover */}
          <span className="absolute -bottom-10 right-0 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            Notificações
          </span>
        </button>

        <div className="w-9 h-9 rounded-full bg-slate-200 border border-border flex items-center justify-center text-primary text-xs font-bold cursor-pointer hover:border-primary-light transition-all overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{user?.email?.[0].toUpperCase() || 'U'}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
