'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  value: string; // ISO yyyy-mm-dd или ''
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type Rect = { top: number; left: number; width: number };

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIso(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function displayFmt(iso: string): string {
  const d = parseIso(iso);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function buildDays(year: number, month: number) {
  // month 0..11. Возвращает 6 недель × 7 дней (включая хвосты).
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Пн=0
  const start = new Date(year, month, 1 - startDow);
  const days: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);
    days.push({ date: d, inMonth: d.getMonth() === month });
  }
  return days;
}

export function DatePicker({ value, onChange, placeholder = 'дата', disabled, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const base = parseIso(value) ?? new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const estH = 360; // примерная высота календаря
      const spaceBelow = window.innerHeight - r.bottom;
      const top =
        spaceBelow < estH + 8 && r.top > estH ? Math.max(8, r.top - estH - 4) : r.bottom + 6;
      setRect({ top, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const days = buildDays(viewYear, viewMonth);
  const today = new Date();
  const selected = parseIso(value);

  function prev() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }
  function next() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`dropdown-trigger ${open ? 'dropdown-trigger--open' : ''}`.trim()}
        aria-label={ariaLabel ?? 'Выбрать дату'}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? '' : 'muted'}>{value ? displayFmt(value) : placeholder}</span>
        <Calendar size={15} />
      </button>

      {mounted && open && rect
        ? createPortal(
            <div
              ref={popupRef}
              className="datepicker-popup"
              style={{ position: 'fixed', top: rect.top, left: rect.left }}
            >
              <div className="datepicker-header">
                <button type="button" className="datepicker-nav" onClick={prev} aria-label="Пред.">
                  <ChevronLeft size={14} />
                </button>
                <div className="datepicker-title">
                  {MONTHS[viewMonth]} {viewYear}
                </div>
                <button type="button" className="datepicker-nav" onClick={next} aria-label="След.">
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="datepicker-weekdays">
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="datepicker-grid">
                {days.map(({ date, inMonth }) => {
                  const iso = toIso(date);
                  const isSel = selected && toIso(selected) === iso;
                  const isToday = toIso(today) === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className="datepicker-day"
                      data-muted={!inMonth || undefined}
                      data-today={isToday || undefined}
                      data-selected={isSel || undefined}
                      onClick={() => {
                        onChange(iso);
                        setOpen(false);
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="datepicker-footer">
                <button
                  type="button"
                  className="datepicker-link"
                  onClick={() => {
                    onChange(toIso(new Date()));
                    setOpen(false);
                  }}
                >
                  Сегодня
                </button>
                {value && (
                  <button
                    type="button"
                    className="datepicker-link"
                    onClick={() => {
                      onChange('');
                      setOpen(false);
                    }}
                  >
                    Очистить
                  </button>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
