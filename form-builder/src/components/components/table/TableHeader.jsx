import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ArrowDown, ArrowUp, FunnelSimple, ArrowsLeftRight } from '@phosphor-icons/react';
import AttachedModal from '../custom/modal/AttachedModal';
import ColumnLevelFilter from './filter/ColumnLevelFilter';
import { SORT_ORDER } from '../../utils/constant';

const HeaderCell = ({ 
  column, 
  index, 
  filterFields = {},
  sortedBy = null,
  onSort = () => {},
  onFilterApply = () => {},
  setModifyingFields = () => {},
  modifyingFields = {},
  openFilterColumn = null,
  setOpenFilterColumn = () => {},
  onDragStart = () => {},
  onDragOver = () => {},
  onDrop = () => {},
  onDragEnd = () => {},
  isDragging = false,
  dragOverIndex = null
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cellRef = useRef(null);
  
  const columnKey = column.key || column.originalKey || column.name;
  const filterPopupOpen = openFilterColumn === columnKey;
  const filterDataForColumn = filterFields?.[columnKey];
  
  const getHeaderName = useCallback(() => {
    return column.displayName || column.label || column.name || column;
  }, [column]);

  const handleSorting = () => {
    const columnKey = column.key || column.originalKey || column.name;
    const sortObj = {
      key: columnKey,
      by: SORT_ORDER.ASC,
    };
    if (sortedBy?.key === columnKey) {
      sortObj.by = sortedBy.by === SORT_ORDER.DESC ? SORT_ORDER.ASC : SORT_ORDER.DESC;
    }
    onSort(sortObj);
  };

  const memoizedHeaderName = useMemo(() => {
    return getHeaderName();
  }, [getHeaderName]);

  const handleFilterToggle = () => {
    if (filterPopupOpen) {
      setOpenFilterColumn(null);
    } else {
      setOpenFilterColumn(columnKey);
    }
  };

  const handleFilterClose = () => {
    setOpenFilterColumn(null);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index);
    onDragStart(index);
    if (cellRef.current) {
      cellRef.current.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/html'), 10);
    if (draggedIndex !== index) {
      onDrop(draggedIndex, index);
    }
    if (cellRef.current) {
      cellRef.current.style.opacity = '1';
    }
  };

  const handleDragEnd = (e) => {
    if (cellRef.current) {
      cellRef.current.style.opacity = '1';
    }
    onDragEnd();
  };

  const isDragOver = dragOverIndex === index && !isDragging;

  return (
    <th 
      ref={cellRef}
      className={`px-2 pr-4 whitespace-nowrap py-3 font-[400] ${isDragOver ? 'border-l-4 border-primary' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      style={{ 
        position: 'relative',
        userSelect: 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <span className="flex gap-3 items-center justify-between">
        <span className="flex gap-2 items-center flex-1">
          <ArrowsLeftRight 
            size={14} 
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"
            style={{ flexShrink: 0 }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            title="Drag to reorder column"
          />
          <span
            className="flex gap-2 cursor-pointer items-center flex-1"
            onClick={handleSorting}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span>{memoizedHeaderName}</span>
            {(isHovered || sortedBy?.key === columnKey) && (
              sortedBy?.key === columnKey && sortedBy.by === SORT_ORDER.DESC ? (
                <ArrowDown size={14} />
              ) : (
                <ArrowUp size={14} />
              )
            )}
          </span>
        </span>
        {!column.isAction && (
          <span 
            className="cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <AttachedModal
              trigger={(ref, onClick) => (
                <div 
                  role="button" 
                  ref={ref} 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleFilterToggle();
                  }}
                  style={{ display: 'inline-block', cursor: 'pointer', zIndex: 10 }}
                >
                  <FunnelSimple
                    className={filterDataForColumn?.filterObj ? 'mt-[0.35rem]' : 'mt-1'}
                    size={filterDataForColumn?.filterObj ? 18 : 16}
                    weight={filterDataForColumn?.filterObj ? 'fill' : 'regular'}
                    style={{ color: filterDataForColumn?.filterObj ? '#308BE0' : '#6B7280', pointerEvents: 'none' }}
                  />
                </div>
              )}
              isOpen={filterPopupOpen}
              setIsOpen={handleFilterToggle}
              offsetX={16}
            >
              <ColumnLevelFilter 
                columnId={columnKey}
                onDone={handleFilterClose}
                fields={modifyingFields}
                setFields={setModifyingFields}
                handleApplyFilters={onFilterApply}
              />
            </AttachedModal>
          </span>
        )}
      </span>
    </th>
  );
};

const TableHeader = ({ 
  columns = [],
  filterFields = {},
  sortedBy = null,
  onSort = () => {},
  onFilterApply = () => {},
  setModifyingFields = () => {},
  modifyingFields = {},
  onColumnReorder = () => {}
}) => {
  const [openFilterColumn, setOpenFilterColumn] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    setDragOverIndex(index);
  };

  const handleDrop = (fromIndex, toIndex) => {
    if (fromIndex !== toIndex && onColumnReorder) {
      onColumnReorder(fromIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!columns || columns.length === 0) {
    return null;
  }

  return (
    <thead>
      <tr className="text-[16px] text-textBrandSecondary font-[400] bg-surfaceControlHeader border-b border-surfaceControlSelected dark:border-0 dark:bg-textBrandSecondary dark:text-white">
        {columns.map((column, index) => {
          const columnKey = typeof column === 'object' ? (column.key || column.name || column.originalKey) : column;
          return (
            <HeaderCell
              key={columnKey || index || `col-${index}`}
              column={column}
              index={index}
              filterFields={filterFields}
              sortedBy={sortedBy}
              onSort={onSort}
              onFilterApply={onFilterApply}
              setModifyingFields={setModifyingFields}
              modifyingFields={modifyingFields}
              openFilterColumn={openFilterColumn}
              setOpenFilterColumn={setOpenFilterColumn}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
              dragOverIndex={dragOverIndex}
            />
          );
        })}
      </tr>
    </thead>
  );
};

export default TableHeader;
