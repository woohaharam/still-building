'use client';

import { useState } from 'react';
import { today } from '@/lib/calendar';
import { dutyTimeLabel, isDutySlot, slotNumber } from '@/lib/duty';
import AdminList from './AdminList';
import { useAdminCollection } from '@/lib/use-admin-collection';
import {
  DUTY_SLOTS,
  DUTY_SLOT_LABELS,
  Duty,
  DutySlot,
  dutySlotLabel,
} from '@/lib/types';

export default function DutyEditor() {
  const {
    items: duties,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    save,
    remove,
  } = useAdminCollection<Duty>('service_duties', { column: 'served_on' });

  const [slot, setSlot] = useState<DutySlot>('am');
  // 기본값은 오늘. 이 화면은 로그인한 뒤에만 그려지니 서버와 날짜가 어긋날 일이 없다.
  const [servedOn, setServedOn] = useState(today);
  const [dayOffAfter, setDayOffAfter] = useState(false);
  const [note, setNote] = useState('');

  function resetForm() {
    setEditingId(null);
    setSlot('am');
    setServedOn(today());
    setDayOffAfter(false);
    setNote('');
  }

  function loadIntoForm(duty: Duty) {
    setEditingId(duty.id);
    setSlot(duty.slot);
    setServedOn(duty.served_on);
    setDayOffAfter(duty.day_off_after);
    setNote(duty.note || '');
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 지금 적고 있는 근무가 몇 조인지, 그리고 걸리는 게 없는지.
   *
   * 직전 근무는 '목록에서 제일 위'가 아니다. 목록은 날짜순이라 같은 날의 두
   * 타임 사이 순서를 모르고, 빠뜨린 근무를 나중에 끼워 넣을 수도 있다. 지금
   * 값보다 앞서는 것 중 가장 늦은 근무를 직접 찾는다.
   *
   * useMemo 로 싸두지 않는다. 목록이 수백 줄이어도 한 번 훑는 일이고, 고르는
   * 값이 바뀔 때마다 다시 세야 하는 값이다.
   */
  function look() {
    if (!servedOn) return null;

    const draftNumber = slotNumber({ served_on: servedOn, slot });
    let sameDay = false;
    let closest = -Infinity;

    for (const duty of duties) {
      if (duty.id === editingId || !isDutySlot(duty.slot)) continue;

      if (duty.served_on === servedOn) {
        if (duty.slot === slot) {
          return { duplicate: true, jo: null, noddak: false };
        }
        sameDay = true;
      }

      const number = slotNumber(duty);
      if (number < draftNumber && number > closest) closest = number;
    }

    return {
      duplicate: false,
      jo: closest === -Infinity ? null : draftNumber - closest,
      noddak: sameDay,
    };
  }

  const preview = look();

  async function handleSave() {
    if (!servedOn) {
      setStatus('근무한 날은 필수예요.');
      return;
    }
    if (preview?.duplicate) {
      setStatus('그 날 그 타임은 이미 적혀 있어요.');
      return;
    }

    const saved = await save({
      served_on: servedOn,
      slot,
      day_off_after: dayOffAfter,
      note: note.trim() || null,
    });

    if (saved) resetForm();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '근무 수정' : '새 근무'}
        </h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {DUTY_SLOTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSlot(option)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  slot === option
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-ink-muted'
                }`}
              >
                {DUTY_SLOT_LABELS[option]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              근무한 날
              <input
                type="date"
                value={servedOn}
                onChange={(e) => setServedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dayOffAfter}
                onChange={(e) => setDayOffAfter(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />
              명근
            </label>
          </div>

          {/*
            열삼·삼팔은 자정을 넘겨 뛴다. 근무표에 적히는 날짜를 넣어야 조가
            맞는데, 새벽에 들어와서 그날 날짜로 적기 쉬운 자리라 미리 적어둔다.
          */}
          <p className="-mt-1 text-xs text-ink-muted">
            {DUTY_SLOT_LABELS[slot]} {dutyTimeLabel(slot)}
            {preview?.duplicate ? (
              <span className="ml-2 text-danger">
                그 날 그 타임은 이미 있어요
              </span>
            ) : (
              <>
                {preview?.jo !== null && preview?.jo !== undefined && (
                  <span className="ml-2 tabular-nums">{preview.jo}조</span>
                )}
                {preview?.noddak && <span className="ml-2">노딱</span>}
              </>
            )}
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
        title={`근무 ${duties.length}번`}
        items={duties}
        loading={loading}
        onEdit={loadIntoForm}
        onRemove={(duty) =>
          remove(duty.id, '이 근무를 삭제할까요?').then(
            (done) => done && resetForm()
          )
        }
      >
        {(duty) => (
          <>
            <p className="text-sm font-medium">
              {dutySlotLabel(duty.slot) ?? duty.slot}
              {duty.day_off_after && (
                <span className="ml-2 text-xs font-normal text-ink-soft">
                  명근
                </span>
              )}
              {duty.note && (
                <span className="ml-2 text-xs font-normal text-ink-muted">
                  {duty.note}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs tabular-nums text-ink-muted">
              {duty.served_on}
            </p>
          </>
        )}
      </AdminList>
    </div>
  );
}
