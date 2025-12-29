import { useEffect, useState } from 'react';

export default function NeoToast({ message, type = 'success', onClose, duration = 2500 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    if (!onClose) return;
    
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const baseStyles = `
    fixed top-6 right-6 z-[9999] 
    px-5 py-3.5
    border-3 
    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
    font-bold text-base 
    rounded-xl 
    flex items-center gap-3
    transform transition-all duration-300 ease-out
    ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
  `;

  const typeStyles = {
    success: 'bg-emerald-500 text-white border-black',
    error: 'bg-red-500 text-white border-black',
    info: 'bg-amber-400 text-black border-black',
    warning: 'bg-orange-500 text-white border-black',
  };

  return (
    <div
      className={`${baseStyles} ${typeStyles[type] || typeStyles.success}`}
      style={{ minWidth: 240 }}
    >
      {type === 'success' && (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {type === 'error' && (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      {type === 'info' && (
        <div className="w-6 h-6 bg-black/10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
          </svg>
        </div>
      )}
      {type === 'warning' && (
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )}
      <span className="tracking-tight">{message}</span>
    </div>
  );
}
