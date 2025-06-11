import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: React.ReactNode;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => (
  <nav className={`text-xs text-gray-500 dark:text-gray-400 flex gap-1 ${className || ''}`.trim()}>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        {idx < items.length - 1 ? (
          item.to ? (
            <Link to={item.to} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )
        ) : (
          <span className="font-bold text-green-700 dark:text-green-300">
            {item.label}
          </span>
        )}
        {idx < items.length - 1 && <span>&gt;</span>}
      </React.Fragment>
    ))}
  </nav>
);

export default Breadcrumbs;
