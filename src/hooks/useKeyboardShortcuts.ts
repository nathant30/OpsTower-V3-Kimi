import { useEffect, useCallback, useRef } from 'react';

type ModifierKey = 'ctrl' | 'cmd' | 'alt' | 'shift';

export interface ShortcutConfig {
  key: string;
  modifiers?: ModifierKey[];
  handler: () => void;
  preventDefault?: boolean;
  /** When true, shortcut works even when an input is focused */
  allowInInput?: boolean;
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutConfig[];
  /** Global scope - works even when shortcuts are disabled for specific elements */
  global?: boolean;
}

/**
 * Checks if the current active element is an input field
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const inputTypes = ['input', 'textarea', 'select'];
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';

  return inputTypes.includes(tagName) || isContentEditable;
}

/**
 * Checks if a modifier key is pressed
 */
function checkModifier(e: KeyboardEvent, modifier: ModifierKey): boolean {
  switch (modifier) {
    case 'ctrl':
      return e.ctrlKey;
    case 'cmd':
      return e.metaKey;
    case 'alt':
      return e.altKey;
    case 'shift':
      return e.shiftKey;
    default:
      return false;
  }
}

/**
 * Hook for registering keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 'k', modifiers: ['ctrl'], handler: () => openSearch(), description: 'Open search' },
 *     { key: 'r', handler: () => refresh(), description: 'Refresh data' },
 *     { key: 'Escape', handler: () => closeModal(), description: 'Close modal' },
 *     { key: '?', handler: () => showHelp(), description: 'Show keyboard shortcuts' },
 *   ]
 * });
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const { shortcuts, global = true } = options;
  const shortcutsRef = useRef(shortcuts);

  // Keep ref in sync
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    for (const shortcut of shortcutsRef.current) {
      const shortcutKey = shortcut.key.toLowerCase();

      // Check if the key matches
      if (key !== shortcutKey) continue;

      // Check modifiers
      const requiredModifiers = shortcut.modifiers || [];
      const modifiersMatch = requiredModifiers.every(mod => checkModifier(e, mod));
      const noExtraModifiers = !['ctrl', 'alt', 'shift', 'meta'].some(mod => {
        if (requiredModifiers.includes(mod as ModifierKey)) return false;
        if (mod === 'meta' && !requiredModifiers.includes('cmd')) return e.metaKey;
        if (mod === 'ctrl' && !requiredModifiers.includes('ctrl')) return e.ctrlKey;
        if (mod === 'alt' && !requiredModifiers.includes('alt')) return e.altKey;
        if (mod === 'shift' && !requiredModifiers.includes('shift')) return e.shiftKey;
        return false;
      });

      if (!modifiersMatch || !noExtraModifiers) continue;

      // Check if input is focused and shortcut shouldn't work in inputs
      if (!shortcut.allowInInput && isInputFocused()) continue;

      // Execute handler
      if (shortcut.preventDefault !== false) {
        e.preventDefault();
      }
      shortcut.handler();
      return;
    }
  }, []);

  useEffect(() => {
    if (!global) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [global, handleKeyDown]);
}

/**
 * Predefined common keyboard shortcuts
 */
export const CommonShortcuts = {
  /** Ctrl/Cmd+K - Open search/command palette */
  search: (handler: () => void): ShortcutConfig => ({
    key: 'k',
    modifiers: ['ctrl'],
    handler,
    preventDefault: true,
    allowInInput: false,
    description: 'Open search',
  }),

  /** R - Refresh data */
  refresh: (handler: () => void): ShortcutConfig => ({
    key: 'r',
    handler,
    preventDefault: false,
    allowInInput: false,
    description: 'Refresh data',
  }),

  /** Escape - Close modal/dialog */
  escape: (handler: () => void): ShortcutConfig => ({
    key: 'Escape',
    handler,
    preventDefault: true,
    allowInInput: true,
    description: 'Close modal or dialog',
  }),

  /** ? - Show help */
  help: (handler: () => void): ShortcutConfig => ({
    key: '?',
    handler,
    preventDefault: true,
    allowInInput: false,
    description: 'Show keyboard shortcuts help',
  }),

  /** Ctrl/Cmd+A - Select all (when not in input) */
  selectAll: (handler: () => void): ShortcutConfig => ({
    key: 'a',
    modifiers: ['ctrl'],
    handler,
    preventDefault: true,
    allowInInput: false,
    description: 'Select all items',
  }),

  /** Ctrl/Cmd+D - Deselect all */
  deselectAll: (handler: () => void): ShortcutConfig => ({
    key: 'd',
    modifiers: ['ctrl'],
    handler,
    preventDefault: true,
    allowInInput: false,
    description: 'Deselect all items',
  }),

  /** Delete or Backspace - Delete selected */
  delete: (handler: () => void): ShortcutConfig => ({
    key: 'Delete',
    handler,
    preventDefault: true,
    allowInInput: false,
    description: 'Delete selected items',
  }),
} as const;

export default useKeyboardShortcuts;
