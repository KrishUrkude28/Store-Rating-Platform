import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function TableSortHeader({
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  children,
  className = ''
}) {
  const isActive = currentSortBy === field;

  const handleClick = () => {
    if (isActive) {
      onSort(field, currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <th
      className={`sortable ${className}`}
      onClick={handleClick}
      title={`Sort by ${typeof children === 'string' ? children : field}`}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>{children}</span>
        {isActive ? (
          currentSortOrder === 'asc' ? (
            <ArrowUp size={14} color="#818cf8" />
          ) : (
            <ArrowDown size={14} color="#818cf8" />
          )
        ) : (
          <ArrowUpDown size={14} color="#6b7280" />
        )}
      </div>
    </th>
  );
}
