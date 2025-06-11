import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={`text-xs text-gray-500 dark:text-gray-400 flex gap-1 ${className ?? ''}`.trim()}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>&gt;</span>}
          {item.to ? (
            <Link to={item.to} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-green-700 dark:text-green-300">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
