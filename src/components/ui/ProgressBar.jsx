import React from 'react';

const ProgressBar = ({ value, max, color = 'success' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    primary: 'bg-primary-light',
  };

  const barColor = percentage > 80 ? 'danger' : percentage > 50 ? 'warning' : color;

  return (
    <div className="w-full">
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${colorClasses[barColor]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
