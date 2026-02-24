import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => unknown;
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  getRowId: (row: T) => string;
}

interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export function Table<T>({
  data,
  columns,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  sortable = true,
  loading = false,
  emptyMessage = 'No data available',
  getRowId,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);

  // Use controlled selection only
  const selected = selectedIds;

  // Sort data
  const sortedData = useMemo(() => {
    if (!sort) return data;

    const column = columns.find((c) => c.key === sort.column);
    if (!column || !column.sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = column.accessor(a);
      const bVal = column.accessor(b);

      if (aVal === null || aVal === undefined) return sort.direction === 'asc' ? -1 : 1;
      if (bVal === null || bVal === undefined) return sort.direction === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sort.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sort, columns]);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    setSort((prev) => {
      if (prev?.column === columnKey) {
        if (prev.direction === 'asc') {
          return { column: columnKey, direction: 'desc' };
        }
        return null; // Remove sort
      }
      return { column: columnKey, direction: 'asc' };
    });
  };

  const toggleSelection = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onSelectionChange?.(newSelected);
  };

  const toggleAllSelection = () => {
    const allIds = sortedData.map((row) => getRowId(row));
    const allSelected = allIds.every((id) => selected.includes(id));
    
    if (allSelected) {
      // Deselect all visible
      onSelectionChange?.(selected.filter((id) => !allIds.includes(id)));
    } else {
      // Select all visible
      onSelectionChange?.([...new Set([...selected, ...allIds])]);
    }
  };

  const isAllSelected =
    sortedData.length > 0 &&
    sortedData.every((row) => selected.includes(getRowId(row)));

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-xpress-bg-tertiary rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-xpress-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-xpress-border">
            {selectable && (
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAllSelection}
                  className="rounded border-xpress-border bg-xpress-bg-secondary text-xpress-accent-blue focus:ring-xpress-accent-blue"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 font-semibold text-xpress-text-secondary whitespace-nowrap',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && sortable && 'cursor-pointer hover:text-xpress-text-primary'
                )}
                style={{ width: column.width }}
                onClick={() => handleSort(column.key)}
              >
                <div
                  className={cn(
                    'flex items-center gap-1',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}
                >
                  {column.header}
                  {column.sortable && sortable && (
                    <span className="inline-flex flex-col">
                      <ChevronUp
                        className={cn(
                          'w-3 h-3 -mb-1',
                          sort?.column === column.key && sort?.direction === 'asc'
                            ? 'text-xpress-accent-blue'
                            : 'text-xpress-text-muted'
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'w-3 h-3',
                          sort?.column === column.key && sort?.direction === 'desc'
                            ? 'text-xpress-accent-blue'
                            : 'text-xpress-text-muted'
                        )}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowId = getRowId(row);
            const isSelected = selected.includes(rowId);
            const isEven = index % 2 === 0;

            return (
              <tr
                key={rowId}
                className={cn(
                  'border-b border-xpress-border transition-colors',
                  isEven ? 'bg-xpress-bg-secondary/30' : 'bg-transparent',
                  onRowClick && 'cursor-pointer hover:bg-xpress-bg-tertiary/50',
                  isSelected && 'bg-xpress-accent-blue/10'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(rowId)}
                      className="rounded border-xpress-border bg-xpress-bg-secondary text-xpress-accent-blue focus:ring-xpress-accent-blue"
                    />
                  </td>
                )}
                {columns.map((column) => {
                  const value = column.accessor(row);
                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 whitespace-nowrap',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render
                        ? column.render(value, row)
                        : String(value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
