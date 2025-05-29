import React from 'react';

export const WaterDropIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M12 3C12 3 5 11 5 16a7 7 0 0 0 14 0c0-5-7-13-7-13z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22a6 6 0 0 1-6-6c0-4 6-12 6-12s6 8 6 12a6 6 0 0 1-6 6z" fill="currentColor" fillOpacity={0.2}/>
  </svg>
);

export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="5" strokeWidth={2} />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const BugAntIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="4" strokeWidth={2} />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const AdjustmentsHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="8" cy="12" r="2" strokeWidth={2} />
    <circle cx="16" cy="6" r="2" strokeWidth={2} />
    <circle cx="16" cy="18" r="2" strokeWidth={2} />
    <path d="M8 14v6M8 4v6M16 8v4M16 14v4M3 12h3M10 12h11M3 6h11M19 6h2M3 18h11M19 18h2" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M4 4v6h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 20v-6h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19a9 9 0 1 1 1.3 1.5" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <path d="M9 12l2 2 4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
