'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Severity, Status } from '@/generated/prisma/enums';
import { SEVERITY_LABEL, STATUS_LABEL } from './badges';

type Option = { id: string; label: string };

type Props = {
  systems: Option[];
  assignees: Option[];
  categories: string[];
};

const ANY = '__any__';

export function AuditResultsFilters({ systems, assignees, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = {
    search: searchParams.get('search') ?? '',
    severity: searchParams.get('severity') ?? '',
    status: searchParams.get('status') ?? '',
    systemId: searchParams.get('systemId') ?? '',
    assigneeId: searchParams.get('assigneeId') ?? '',
    category: searchParams.get('category') ?? '',
    foundFrom: searchParams.get('foundFrom') ?? '',
    foundTo: searchParams.get('foundTo') ?? '',
  };

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const [k, v] of formData.entries()) {
      const value = String(v);
      if (!value || value === ANY) continue;
      params.set(k, value);
    }
    const sortBy = searchParams.get('sortBy');
    const sortDir = searchParams.get('sortDir');
    if (sortBy) params.set('sortBy', sortBy);
    if (sortDir) params.set('sortDir', sortDir);
    startTransition(() => router.push(`/audit-results?${params.toString()}`));
  }

  function reset() {
    startTransition(() => router.push('/audit-results'));
  }

  return (
    <form
      action={apply}
      className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-4"
    >
      <div className="md:col-span-2">
        <Label htmlFor="search" className="text-xs">
          Поиск
        </Label>
        <Input
          id="search"
          name="search"
          placeholder="название или описание"
          defaultValue={current.search}
        />
      </div>

      <div>
        <Label className="text-xs">Критичность</Label>
        <Select name="severity" defaultValue={current.severity || ANY}>
          <SelectTrigger>
            <SelectValue placeholder="любая" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>любая</SelectItem>
            {Object.values(Severity).map((s) => (
              <SelectItem key={s} value={s}>
                {SEVERITY_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Статус</Label>
        <Select name="status" defaultValue={current.status || ANY}>
          <SelectTrigger>
            <SelectValue placeholder="любой" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>любой</SelectItem>
            {Object.values(Status).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Система</Label>
        <Select name="systemId" defaultValue={current.systemId || ANY}>
          <SelectTrigger>
            <SelectValue placeholder="любая" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>любая</SelectItem>
            {systems.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Ответственный</Label>
        <Select name="assigneeId" defaultValue={current.assigneeId || ANY}>
          <SelectTrigger>
            <SelectValue placeholder="любой" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>любой</SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Категория</Label>
        <Select name="category" defaultValue={current.category || ANY}>
          <SelectTrigger>
            <SelectValue placeholder="любая" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>любая</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="foundFrom" className="text-xs">
          Обнаружено с
        </Label>
        <Input id="foundFrom" name="foundFrom" type="date" defaultValue={current.foundFrom} />
      </div>

      <div>
        <Label htmlFor="foundTo" className="text-xs">
          Обнаружено по
        </Label>
        <Input id="foundTo" name="foundTo" type="date" defaultValue={current.foundTo} />
      </div>

      <div className="flex items-end gap-2 md:col-span-4">
        <Button type="submit" disabled={pending}>
          Применить
        </Button>
        <Button type="button" variant="outline" onClick={reset} disabled={pending}>
          Сбросить
        </Button>
      </div>
    </form>
  );
}
