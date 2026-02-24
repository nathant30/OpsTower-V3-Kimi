import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn()', () => {
  it('should merge basic class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes with objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('should merge Tailwind classes and remove duplicates', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should filter out falsy values', () => {
    expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2');
  });

  it('should handle complex Tailwind merging', () => {
    expect(cn('text-sm text-gray-500', 'text-lg')).toBe('text-gray-500 text-lg');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle nested arrays', () => {
    expect(cn('base', ['nested1', ['nested2', 'nested3']])).toBe('base nested1 nested2 nested3');
  });

  it('should properly merge conflicting margin classes', () => {
    expect(cn('m-2', 'm-4')).toBe('m-4');
  });

  it('should properly merge conflicting padding classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should handle color class conflicts', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle complex real-world example', () => {
    const result = cn(
      'inline-flex items-center justify-center gap-2 font-medium',
      'bg-blue-500 text-white',
      'hover:bg-blue-600',
      'px-4 py-2 rounded-md',
      'px-6' // override padding
    );
    // The exact order may vary based on tailwind-merge configuration
    expect(result).toContain('inline-flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-center');
    expect(result).toContain('gap-2');
    expect(result).toContain('font-medium');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('hover:bg-blue-600');
    expect(result).toContain('rounded-md');
    expect(result).toContain('py-2');
    expect(result).toContain('px-6');
    // px-6 should override px-4
    expect(result).not.toContain('px-4');
  });
});
