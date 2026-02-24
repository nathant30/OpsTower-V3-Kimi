import { cn } from '@/lib/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn(
        "w-4 h-4 rounded border-xpress-border bg-xpress-bg-secondary",
        "text-xpress-accent-blue focus:ring-xpress-accent-blue",
        "cursor-pointer",
        className
      )}
    />
  );
}

export default Checkbox;
