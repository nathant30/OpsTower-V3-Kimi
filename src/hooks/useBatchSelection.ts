import { useState, useCallback, useMemo, useRef } from 'react';

export interface UseBatchSelectionOptions<T> {
  /** All available items */
  items: T[];
  /** Function to get unique ID from an item */
  getItemId: (item: T) => string;
  /** Initial selected IDs */
  initialSelected?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Maximum number of items that can be selected */
  maxSelection?: number;
}

export interface UseBatchSelectionReturn<T> {
  /** Currently selected item IDs */
  selectedIds: string[];
  /** Set of selected IDs for O(1) lookup */
  selectedSet: Set<string>;
  /** Number of selected items */
  selectedCount: number;
  /** Whether any items are selected */
  hasSelection: boolean;
  /** Whether all items are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) items are selected */
  isIndeterminate: boolean;

  // Selection methods
  /** Toggle selection of a single item */
  toggleSelection: (id: string | string[]) => void;
  /** Select a single item */
  select: (id: string) => void;
  /** Deselect a single item */
  deselect: (id: string) => void;
  /** Set the full selection */
  setSelection: (ids: string[]) => void;
  /** Select all items */
  selectAll: () => void;
  /** Deselect all items */
  deselectAll: () => void;
  /** Select a range of items (for shift+click) */
  selectRange: (startId: string, endId: string) => void;
  /** Toggle selection with support for shift+click range selection */
  handleSelectionClick: (id: string, event?: React.MouseEvent) => void;
  /** Check if an item is selected */
  isSelected: (id: string) => boolean;

  // Get selected items
  /** Get the actual selected item objects */
  selectedItems: T[];
}

/**
 * Hook for managing batch selection in tables and lists
 * 
 * Features:
 * - Single item selection/deselection
 * - Select all / deselect all
 * - Shift+click range selection
 * - O(1) selection lookup via Set
 * - Max selection limit
 * 
 * @example
 * const selection = useBatchSelection({
 *   items: orders,
 *   getItemId: (order) => order.orderId,
 * });
 * 
 * // In table row
 * <tr onClick={(e) => selection.handleSelectionClick(order.orderId, e)}>
 * 
 * // Batch action bar
 * {selection.hasSelection && (
 *   <BatchActionBar count={selection.selectedCount}>
 *     <Button onClick={() => bulkCancel(selection.selectedIds)}>Cancel</Button>
 *   </BatchActionBar>
 * )}
 */
export function useBatchSelection<T>(
  options: UseBatchSelectionOptions<T>
): UseBatchSelectionReturn<T> {
  const {
    items,
    getItemId,
    initialSelected = [],
    onSelectionChange,
    maxSelection,
  } = options;

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
  const lastClickedIdRef = useRef<string | null>(null);

  // Create a Set for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Derived state
  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const isAllSelected = items.length > 0 && itemIds.every(id => selectedSet.has(id));
  const isIndeterminate = hasSelection && !isAllSelected;

  // Get selected item objects
  const selectedItems = useMemo(
    () => items.filter(item => selectedSet.has(getItemId(item))),
    [items, selectedSet, getItemId]
  );

  // Internal setter that calls onSelectionChange
  const updateSelection = useCallback((newSelection: string[]) => {
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  // Toggle selection of a single item or array of items
  const toggleSelection = useCallback((id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    setSelectedIds(prev => {
      const newSelection = [...prev];
      ids.forEach(singleId => {
        const index = newSelection.indexOf(singleId);
        if (index > -1) {
          newSelection.splice(index, 1);
        } else {
          newSelection.push(singleId);
        }
      });
      onSelectionChange?.(newSelection);
      return newSelection;
    });
    lastClickedIdRef.current = ids[ids.length - 1];
  }, [onSelectionChange]);

  // Select a single item
  const select = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev;
      if (maxSelection && prev.length >= maxSelection) {
        return prev; // Don't exceed max
      }
      const newSelection = [...prev, id];
      onSelectionChange?.(newSelection);
      return newSelection;
    });
    lastClickedIdRef.current = id;
  }, [maxSelection, onSelectionChange]);

  // Deselect a single item
  const deselect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSelection = prev.filter(sid => sid !== id);
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Select all items
  const selectAll = useCallback(() => {
    const allIds = maxSelection 
      ? itemIds.slice(0, maxSelection)
      : itemIds;
    updateSelection(allIds);
    lastClickedIdRef.current = null;
  }, [itemIds, maxSelection, updateSelection]);

  // Deselect all items
  const deselectAll = useCallback(() => {
    updateSelection([]);
    lastClickedIdRef.current = null;
  }, [updateSelection]);

  // Select a range of items (for shift+click)
  const selectRange = useCallback((startId: string, endId: string) => {
    const startIndex = itemIds.indexOf(startId);
    const endIndex = itemIds.indexOf(endId);

    if (startIndex === -1 || endIndex === -1) return;

    const [minIndex, maxIndex] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];

    const rangeIds = itemIds.slice(minIndex, maxIndex + 1);

    // Merge with existing selection (for shift+click behavior)
    setSelectedIds(prev => {
      const newSelection = [...new Set([...prev, ...rangeIds])];
      if (maxSelection && newSelection.length > maxSelection) {
        onSelectionChange?.(newSelection.slice(0, maxSelection));
        return newSelection.slice(0, maxSelection);
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [itemIds, maxSelection, onSelectionChange]);

  // Handle click with support for shift+click range selection
  const handleSelectionClick = useCallback((id: string, event?: React.MouseEvent) => {
    if (event?.shiftKey && lastClickedIdRef.current) {
      // Shift+click: select range
      selectRange(lastClickedIdRef.current, id);
    } else if (event?.ctrlKey || event?.metaKey) {
      // Ctrl/Cmd+click: toggle selection
      toggleSelection(id);
    } else {
      // Normal click: toggle selection (adds to selection)
      toggleSelection(id);
    }
    lastClickedIdRef.current = id;
  }, [selectRange, toggleSelection]);

  // Check if an item is selected
  const isSelected = useCallback((id: string) => selectedSet.has(id), [selectedSet]);

  return {
    selectedIds,
    selectedSet,
    selectedCount,
    hasSelection,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    select,
    deselect,
    setSelection: updateSelection,
    selectAll,
    deselectAll,
    selectRange,
    handleSelectionClick,
    isSelected,
    selectedItems,
  };
}

export default useBatchSelection;
