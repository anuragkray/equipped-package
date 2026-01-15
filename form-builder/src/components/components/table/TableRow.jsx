import React from 'react';
import TrimmedText from '../trimmed-text/TrimmedText';

const formatCurrency = (value) => {
  if (!value && value !== 0) return '-';
  // Return the value as-is without any formatting
  return value;
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return value;
  }
};

const formatPercentage = (value) => {
  if (!value && value !== 0) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  return `${num.toFixed(2)}%`;
};

const TableRow = ({ item, columns = [], rowAction, onView, onFlag, StatusPill }) => {
  if (!columns || columns.length === 0) {
    return null;
  }

  const getColumnKey = (column) => {
    if (typeof column === 'object') {
      return column.key || column.name || column.displayName;
    }
    return column;
  };

  const getColumnDisplayName = (column) => {
    if (typeof column === 'object') {
      return column.displayName || column.label || column.name;
    }
    return column;
  };

  const handleRowClick = () => {
    if (rowAction && typeof rowAction === 'function') {
      rowAction(item);
    }
  };

  const formatCellValue = (column, value) => {
    const displayName = getColumnDisplayName(column);
    const columnKey = typeof column === 'object' ? (column.key || column.originalKey) : column;
    
    if (column.isAction) {
      return null; // Actions column handled separately
    }

    // Format based on column key or display name
    const keyLower = (columnKey || '').toLowerCase();
    const displayLower = (displayName || '').toLowerCase();

    // Check if it's a currency/amount field
    if (keyLower.includes('outstanding') || keyLower.includes('amount') || 
        keyLower.includes('balance') || keyLower.includes('principal') ||
        displayLower.includes('outstanding') || displayLower.includes('amount')) {
      return formatCurrency(value);
    }
    
    // Check if it's a percentage/yield field
    if (keyLower.includes('yield') || keyLower.includes('rate') || 
        keyLower.includes('interest') || keyLower.includes('apr') ||
        displayLower.includes('yield') || displayLower.includes('rate')) {
      return formatPercentage(value);
    }
    
    // Check if it's a date field
    if (keyLower.includes('date') || keyLower.includes('payment') || 
        keyLower.includes('due') || displayLower.includes('date') ||
        displayLower.includes('payment')) {
      return formatDate(value);
    }

    // Check if it's an array
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    // Check if it's an object
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return JSON.stringify(value);
    }

    return value;
  };

  const renderCellContent = (column, value) => {
    const displayName = getColumnDisplayName(column);
    const columnKey = typeof column === 'object' ? (column.key || column.originalKey) : column;
    const keyLower = (columnKey || '').toLowerCase();
    const displayLower = (displayName || '').toLowerCase();
    
    if (column.isAction) {
      return (
        <div className="table-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="table-action-link"
            onClick={(e) => onView && onView(e, item)}
          >
            View
          </button>
          <button
            className="table-action-link"
            onClick={(e) => onFlag && onFlag(e, item)}
          >
            Flag
          </button>
        </div>
      );
    }

    // Check for Risk Rating fields
    if (keyLower.includes('risk') && (keyLower.includes('rating') || keyLower.includes('level'))) {
      return <StatusPill status={value} type="risk" />;
    }
    if (displayLower.includes('risk') && displayLower.includes('rating')) {
      return <StatusPill status={value} type="risk" />;
    }

    // Check for Covenant Status fields
    if (keyLower.includes('covenant')) {
      return <StatusPill status={value} type="covenant" />;
    }
    if (displayLower.includes('covenant')) {
      return <StatusPill status={value} type="covenant" />;
    }

    const formattedValue = formatCellValue(column, value);
    
    // Handle null or undefined values
    if (formattedValue === null || formattedValue === undefined || formattedValue === '') {
      return <span style={{ color: '#999999' }}>-</span>;
    }
    
    return (
      <TrimmedText text={String(formattedValue)} numOfChar={30} />
    );
  };

  return (
    <tr
      role="button"
      onClick={handleRowClick}
      className="loan-table-row"
    >
      {columns.map((column, index) => {
        const columnKey = getColumnKey(column);
        const cellValue = item?.[columnKey];
        
        return (
          <td
            key={columnKey || index}
            className="loan-table-cell"
          >
            {renderCellContent(column, cellValue)}
          </td>
        );
      })}
    </tr>
  );
};

export default TableRow;
