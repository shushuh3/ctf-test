'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type DropdownOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  ariaLabel?: string;
  /** Доп. класс для trigger (управлять шириной в редких случаях). */
  className?: string;
};

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Выбрать',
  disabled,
  name,
  ariaLabel,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className="dropdown" ref={ref} data-open={open || undefined}>
      {name && <input type="hidden" name={name} value={value} readOnly />}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={`${id}-menu`}
        className={`dropdown-trigger ${className ?? ''}`.trim()}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={current ? '' : 'muted'}>{current ? current.label : placeholder}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <ul id={`${id}-menu`} role="listbox" className="dropdown-menu">
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className="dropdown-item"
              data-selected={o.value === value || undefined}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              {o.value === value && <Check size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
