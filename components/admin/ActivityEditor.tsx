'use client';

import { useEffect, useState } from 'react';
import { toDateKey } from '@/lib/calendar';
import { useAdminCollection } from '@/lib/use-admin-collection';
import {
  Activity,
  ACTIVITY_OUTCOMES,
  ACTIVITY_OUTCOME_LABELS,
  ActivityOutcome,
} from '@/lib/types';

export default function ActivityEditor() {
  const {
    items: activities,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    save,
    remove,
  } = useAdminCollection<Activity>('activities', { column: 'started_on' });

  const [name, setName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [outcome, setOutcome] = useState<ActivityOutcome>('applied');
  const [startedOn, setStartedOn] = useState('');
  const [endedOn, setEndedOn] = useState('');
  const [note, setNote] = useState('');
  const [published, setPublished] = useState(true);

  useEffect(() => {
    // 기본값은 오늘 — 서버와 브라우저의 시간대 차이를 피하려고 마운트 후에 채운다.
    setStartedOn(toDateKey(new Date()));
  }, []);

  function resetForm() {
    setEditingId(null);
    setName('');
    setOrganizer('');
    setOutcome('applied');
    setStartedOn(toDateKey(new Date()));
    setEndedOn('');
    setNote('');
    setPublished(true);
  }

  function loadIntoForm(activity: Activity) {
    setEditingId(activity.id);
    setName(activity.name);
    setOrganizer(activity.organizer || '');
    setOutcome(activity.outcome);
    setStartedOn(activity.started_on);
    setEndedOn(activity.ended_on || '');
    setNote(activity.note || '');
    setPublished(activity.published);
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    if (!name.trim() || !startedOn) {
      setStatus('이름과 날짜는 필수예요.');
      return;
    }
    if (endedOn && endedOn < startedOn) {
      setStatus('끝난 날이 시작한 날보다 빨라요.');
      return;
    }

    const saved = await save({
      name: name.trim(),
      organizer: organizer.trim() || null,
      outcome,
      started_on: startedOn,
      ended_on: endedOn || null,
      note: note.trim() || null,
      published,
    });

    if (saved) resetForm();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '활동 수정' : '새 활동'}
        </h1>

        <div className="flex flex-col gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="공모전 · 활동 이름"
            className="rounded-md border border-line px-3 py-2 text-lg font-semibold focus:border-ink-muted focus:outline-none"
          />

          <input
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="주최 (선택)"
            className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            {ACTIVITY_OUTCOMES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setOutcome(option)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  outcome === option
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink-muted'
                }`}
              >
                {ACTIVITY_OUTCOME_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              시작
              <input
                type="date"
                value={startedOn}
                onChange={(e) => setStartedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              끝
              <input
                type="date"
                value={endedOn}
                onChange={(e) => setEndedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 (선택) — 뭘 했는지, 왜 떨어졌다고 생각하는지"
            rows={3}
            className="resize-none rounded-md border border-line px-3 py-2 text-sm leading-relaxed focus:border-ink-muted focus:outline-none"
          />

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            사이트에 보이기
          </label>

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
        <h2 className="mb-4 text-sm text-ink-muted">
          활동 {activities.length}개
        </h2>

        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="border-b border-line pb-3 last:border-b-0"
              >
                <p className="text-sm font-medium">
                  {activity.name}
                  {!activity.published && (
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      숨김
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs tabular-nums text-ink-muted">
                  {ACTIVITY_OUTCOME_LABELS[activity.outcome]} ·{' '}
                  {activity.started_on}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    onClick={() => loadIntoForm(activity)}
                    className="text-ink-soft underline hover:text-ink"
                  >
                    수정
                  </button>
                  <button
                    onClick={() =>
                      remove(activity.id, '이 활동을 삭제할까요?').then(
                        (done) => done && resetForm()
                      )
                    }
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
