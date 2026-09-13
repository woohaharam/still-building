'use client';

import { useState } from 'react';
import { formatDayLabel, today } from '@/lib/calendar';
import { useAdminCollection } from '@/lib/use-admin-collection';
import { CalendarEvent, EVENT_KIND_LABELS, EventKind } from '@/lib/types';
import AdminList from './AdminList';

const KIND_OPTIONS: EventKind[] = ['plan', 'deadline', 'note'];

export default function EventEditor() {
  const {
    items: events,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    save,
    remove,
  } = useAdminCollection<CalendarEvent>('events', { column: 'start_date' });

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('plan');
  // 기본값은 오늘. 이 화면은 로그인한 뒤에만 그려지니 서버와 날짜가 어긋날 일이 없다.
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setKind('plan');
    setStartDate(today());
    setEndDate('');
    setStartTime('');
    setDescription('');
  }

  function loadIntoForm(event: CalendarEvent) {
    setEditingId(event.id);
    setTitle(event.title);
    setKind(event.kind);
    setStartDate(event.start_date);
    setEndDate(event.end_date || '');
    setStartTime(event.start_time || '');
    setDescription(event.description || '');
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    if (!title.trim() || !startDate) {
      setStatus('제목과 날짜는 필수예요.');
      return;
    }
    if (endDate && endDate < startDate) {
      setStatus('종료일이 시작일보다 빨라요.');
      return;
    }

    const saved = await save({
      title: title.trim(),
      kind,
      start_date: startDate,
      end_date: endDate || null,
      start_time: startTime || null,
      description: description.trim() || null,
    });

    if (saved) resetForm();
  }

  async function handleRemove(event: CalendarEvent) {
    const removed = await remove(event.id, '이 일정을 삭제할까요?');
    if (removed && editingId === event.id) resetForm();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '일정 수정' : '새 일정 추가'}
        </h1>

        <div className="flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목"
            className="rounded-md border border-line px-3 py-2 text-lg font-semibold focus:border-ink-muted focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            {KIND_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  kind === option
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink-muted'
                }`}
              >
                {EVENT_KIND_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1 text-xs text-ink-muted">
              날짜
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-ink-muted focus:outline-none"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-ink-muted">
              종료일 (선택)
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-ink-muted focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-muted sm:w-32">
              시간 (선택)
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:border-ink-muted focus:outline-none"
              />
            </label>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="메모 (선택)"
            rows={3}
            className="resize-none rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm text-ink-muted underline"
              >
                새 일정으로 전환
              </button>
            )}
            {status && <span className="text-sm text-ink-muted">{status}</span>}
          </div>
        </div>
      </div>

      <AdminList
        title={`전체 일정 ${events.length}개`}
        items={events}
        loading={loading}
        onEdit={loadIntoForm}
        onRemove={handleRemove}
      >
        {(event) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{event.title}</span>
              <span className="shrink-0 text-xs text-ink-muted">
                {EVENT_KIND_LABELS[event.kind]}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {formatDayLabel(event.start_date)}
              {event.start_time ? ` ${event.start_time}` : ''}
            </p>
          </>
        )}
      </AdminList>
    </div>
  );
}
