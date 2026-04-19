'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  className?: string;
};

type Rect = { top: number; left: number; width: number; height: number };

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
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const id = useId();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Позиция popup — относительно viewport (position: fixed).
  // Если снизу мало места — flip-up.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const estMenuH = Math.min(320, options.length * 38 + 16);
      const spaceBelow = window.innerHeight - r.bottom;
      const top =
        spaceBelow < estMenuH + 8 && r.top > estMenuH
          ? Math.max(8, r.top - estMenuH - 4)
          : r.bottom + 4;
      setRect({ top, left: r.left, width: r.width, height: r.height });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
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
    <>
      {name && <input type="hidden" name={name} value={value} readOnly />}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={`${id}-menu`}
        className={`dropdown-trigger ${open ? 'dropdown-trigger--open' : ''} ${className ?? ''}`.trim()}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={current ? '' : 'muted'}>{current ? current.label : placeholder}</span>
        <ChevronDown size={15} />
      </button>
      {mounted && open && rect
        ? createPortal(
            <ul
              ref={menuRef}
              id={`${id}-menu`}
              role="listbox"
              className="dropdown-menu"
              style={{
                position: 'fixed',
                top: rect.top,
                left: rect.left,
                minWidth: rect.width,
              }}
            >
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
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}
