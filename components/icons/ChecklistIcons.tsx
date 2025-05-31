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

// Example: Thermometer Icon (for Temperature)
export const ThermometerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

// Example: Wind Icon (for Air Circulation/Ventilation)
export const WindIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);

// Example: Beaker Icon (for pH/EC)
export const BeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-1V3M6 14h12" />
  </svg>
);

// Example: Eye Icon (for various checks like bud development, trichomes)
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
   <circle cx="12" cy="12" r="3" />
 </svg>
);

// Example: Scissors Icon (for Training/Defoliation)
export const ScissorsIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
   <circle cx="6" cy="6" r="3" />
   <circle cx="6" cy="18" r="3" />
   <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
 </svg>
);

// Example: Clock Icon (for Light Cycle)
export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
   <circle cx="12" cy="12" r="10" />
   <polyline points="12 6 12 12 16 14" />
 </svg>
);

// Example: Droplets Icon (for Humidity)
 export const DropletsIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
     <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3C6.71 6.75 5.43 8 4.71 8.95S3 11.09 3 12.25C3 14.47 4.8 16.3 7 16.3z"/>
     <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 4 2.5 4 5.5A4.5 4.5 0 0 1 13.5 13H11c-.14 0-.28-.01-.4-.02"/>
     <path d="M15 16a3.5 3.5 0 0 0-6.5 0"/>
   </svg>
 );
// Example: Jar Icon (for Curing/Burping)
 export const JarIcon = (props: React.SVGProps<SVGSVGElement>) => (
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
         <path d="M4 7h16M6 7v12a2 2 0 002 2h8a2 2 0 002-2V7M9 3h6M9 3a2 2 0 012-2h2a2 2 0 012 2v4H9V3z" />
     </svg>
 );
