
import React from 'react';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.95-4.22L13 16l7-7l-6-6l-4 4l3 3l-4 4v-3c.83-2.17 2.33-4.34 4-6Z" />
    <path d="M17.5 2C15.5 2 14 3.5 14 5.5C14 6.88 14.62 8.06 15.5 8.72V9c0 1.66-1.34 3-3 3c-.55 0-1.05-.15-1.5-.42V10c0-.83-.67-1.5-1.5-1.5S7.5 9.17 7.5 10v1.52c.83.66 1.84 1.23 2.96 1.62L11 16l4-4l2-2l2-2h-2.5Z"/>
  </svg>
);

export default LeafIcon;
