'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { CalendarEvent, EVENT_KIND_LABELS, EventKind } from '@/lib/types';
import { formatDayLabel, toDateKey } from '@/lib/calendar';

const KIND_OPTIONS: EventKind[] = ['plan', 'deadline', 'note'];

export default function EventEditor() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('plan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });
    if (!error && data) setEvents(data as CalendarEvent[]);
    setLoading(false);
  }

  useEffect(() => {
    // 기본값은 오늘 — 서버/브라우저 시간대 차이를 피하려고 마운트 후에 채워요.
    setStartDate(toDateKey(new Date()));
    loadEvents();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setKind('plan');
    setStartDate(toDateKey(new Date()));
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

    setSaving(true);
    setStatus('');

    const payload = {
      title: title.trim(),
      kind,
      start_date: startDate,
      end_date: endDate || null,
      start_time: startTime || null,
      description: description.trim() || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabaseClient
        .from('events')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabaseClient.from('events').insert(payload));
    }

    setSaving(false);
    if (error) {
      setStatus(`저장 실패: ${error.message}`);
    } else {
      setStatus('저장했어요.');
      resetForm();
      loadEvents();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 일정을 삭제할까요?')) return;
    await supabaseClient.from('events').delete().eq('id', id);
    if (editingId === id) resetForm();
    loadEvents();
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

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink-soft">
          전체 일정 ({events.length})
        </h2>
        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 등록한 일정이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-md border border-line p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => loadIntoForm(event)}
                    className="truncate text-left font-medium hover:text-accent"
                  >
                    {event.title}
                  </button>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {EVENT_KIND_LABELS[event.kind]}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-muted">
                    {formatDayLabel(event.start_date)}
                    {event.start_time ? ` ${event.start_time}` : ''}
                  </span>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="shrink-0 text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
