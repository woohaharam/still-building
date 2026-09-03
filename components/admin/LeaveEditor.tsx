'use client';

import { useEffect, useState } from 'react';
import { toDateKey } from '@/lib/calendar';
import { supabaseClient } from '@/lib/supabase';
import { Leave, LEAVE_KINDS, LEAVE_KIND_LABELS, LeaveKind } from '@/lib/types';

export default function LeaveEditor() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [kind, setKind] = useState<LeaveKind>('outing');
  const [startedOn, setStartedOn] = useState('');
  const [endedOn, setEndedOn] = useState('');
  const [note, setNote] = useState('');

  async function loadLeaves() {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('service_leaves')
      .select('*')
      .order('started_on', { ascending: false });
    if (!error && data) setLeaves(data as Leave[]);
    setLoading(false);
  }

  useEffect(() => {
    // 기본값은 오늘 — 서버와 브라우저의 시간대 차이를 피하려고 마운트 후에 채운다.
    setStartedOn(toDateKey(new Date()));
    loadLeaves();
  }, []);

  function resetForm() {
    setEditingId(null);
    setKind('outing');
    setStartedOn(toDateKey(new Date()));
    setEndedOn('');
    setNote('');
  }

  function loadIntoForm(leave: Leave) {
    setEditingId(leave.id);
    setKind(leave.kind);
    setStartedOn(leave.started_on);
    setEndedOn(leave.ended_on || '');
    setNote(leave.note || '');
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    if (!startedOn) {
      setStatus('나가는 날은 필수예요.');
      return;
    }
    if (endedOn && endedOn < startedOn) {
      setStatus('복귀일이 나가는 날보다 빨라요.');
      return;
    }

    setSaving(true);
    setStatus('');

    const payload = {
      kind,
      started_on: startedOn,
      ended_on: endedOn || null,
      note: note.trim() || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabaseClient
        .from('service_leaves')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabaseClient.from('service_leaves').insert(payload));
    }

    setSaving(false);
    if (error) {
      setStatus(`저장 실패: ${error.message}`);
    } else {
      setStatus('저장했어요.');
      resetForm();
      loadLeaves();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 일정을 삭제할까요?')) return;
    await supabaseClient.from('service_leaves').delete().eq('id', id);
    if (editingId === id) resetForm();
    loadLeaves();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '나가는 일정 수정' : '새 일정'}
        </h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {LEAVE_KINDS.map((option) => (
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
                {LEAVE_KIND_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              나가는 날
              <input
                type="date"
                value={startedOn}
                onChange={(e) => setStartedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              복귀일
              <input
                type="date"
                value={endedOn}
                onChange={(e) => setEndedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 (선택)"
            className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-ink px-4 py-2 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-sm text-ink-muted underline hover:text-ink-soft"
              >
                새로 쓰기
              </button>
            )}
            {status && <span className="text-sm text-ink-muted">{status}</span>}
          </div>
        </div>
      </div>

      <aside>
        <h2 className="mb-4 text-sm text-ink-muted">일정 {leaves.length}개</h2>

        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        ) : leaves.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {leaves.map((leave) => (
              <li
                key={leave.id}
                className="border-b border-line pb-3 last:border-b-0"
              >
                <p className="text-sm font-medium">
                  {LEAVE_KIND_LABELS[leave.kind]}
                  {leave.note && (
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      {leave.note}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs tabular-nums text-ink-muted">
                  {leave.started_on}
                  {leave.ended_on && leave.ended_on !== leave.started_on && (
                    <> — {leave.ended_on}</>
                  )}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    onClick={() => loadIntoForm(leave)}
                    className="text-ink-soft underline hover:text-ink"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(leave.id)}
                    className="text-danger underline hover:opacity-80"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
