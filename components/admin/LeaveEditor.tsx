'use client';

import { useState } from 'react';
import { today } from '@/lib/calendar';
import { leaveTimeLabel } from '@/lib/leave-dates';
import AdminList from './AdminList';
import { useAdminCollection } from '@/lib/use-admin-collection';
import { Leave, LEAVE_KINDS, LEAVE_KIND_LABELS, LeaveKind } from '@/lib/types';

export default function LeaveEditor() {
  const {
    items: leaves,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    save,
    remove,
  } = useAdminCollection<Leave>('service_leaves', { column: 'started_on' });

  const [kind, setKind] = useState<LeaveKind>('outing');
  // 기본값은 오늘. 이 화면은 로그인한 뒤에만 그려지니 서버와 날짜가 어긋날 일이 없다.
  const [startedOn, setStartedOn] = useState(today);
  const [endedOn, setEndedOn] = useState('');
  const [leftAt, setLeftAt] = useState('');
  const [returnedAt, setReturnedAt] = useState('');
  const [note, setNote] = useState('');

  function resetForm() {
    setEditingId(null);
    setKind('outing');
    setStartedOn(today());
    setEndedOn('');
    setLeftAt('');
    setReturnedAt('');
    setNote('');
  }

  function loadIntoForm(leave: Leave) {
    setEditingId(leave.id);
    setKind(leave.kind);
    setStartedOn(leave.started_on);
    setEndedOn(leave.ended_on || '');
    // Postgres 의 time 은 '13:30:00' 으로 온다. input[type=time] 은 분까지만 받는다.
    setLeftAt((leave.left_at || '').slice(0, 5));
    setReturnedAt((leave.returned_at || '').slice(0, 5));
    setNote(leave.note || '');
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 지금 고른 종류와 날짜라면 몇 시가 되는지. 저장하기 전에 확인하라고 둔다.
  const preview = startedOn
    ? leaveTimeLabel({
        id: '',
        kind,
        started_on: startedOn,
        ended_on: endedOn || null,
        left_at: leftAt || null,
        returned_at: returnedAt || null,
        note: null,
        created_at: '',
      })
    : '';

  async function handleSave() {
    if (!startedOn) {
      setStatus('나가는 날은 필수예요.');
      return;
    }
    if (endedOn && endedOn < startedOn) {
      setStatus('복귀일이 나가는 날보다 빨라요.');
      return;
    }

    const saved = await save({
      kind,
      started_on: startedOn,
      ended_on: endedOn || null,
      // 비워두면 종류별 규정 시각을 쓴다 (lib/service.ts 의 LEAVE_SCHEDULE).
      left_at: leftAt || null,
      returned_at: returnedAt || null,
      note: note.trim() || null,
    });

    if (saved) resetForm();
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

          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              출영
              <input
                type="time"
                value={leftAt}
                onChange={(e) => setLeftAt(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              복귀
              <input
                type="time"
                value={returnedAt}
                onChange={(e) => setReturnedAt(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
          </div>

          {/*
            시각은 비워두는 게 보통이다. 규정대로 나가는 일정은 종류만 고르면
            맞고, 특별외출처럼 받을 때마다 다른 것만 적으면 된다. 그래서 지금
            적용될 시각을 밑에 미리 보여준다.
          */}
          <p className="-mt-1 text-xs text-ink-muted">
            비워두면 규정 시각을 씁니다 — {preview || '시각을 따지지 않음'}
          </p>

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

      <AdminList
        title={`일정 ${leaves.length}개`}
        items={leaves}
        loading={loading}
        onEdit={loadIntoForm}
        onRemove={(leave) =>
          remove(leave.id, '이 일정을 삭제할까요?').then(
            (done) => done && resetForm()
          )
        }
      >
        {(leave) => (
          <>
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
              {leaveTimeLabel(leave) && (
                <span className="ml-2">{leaveTimeLabel(leave)}</span>
              )}
            </p>
          </>
        )}
      </AdminList>
    </div>
  );
}
