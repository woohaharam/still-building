'use client';

import { useEffect, useState } from 'react';
import { toDateKey } from '@/lib/calendar';
import { countryName, flagEmoji, isCountryCode } from '@/lib/country';
import { toSlug } from '@/lib/slug';
import { uploadImage } from '@/lib/storage';
import { stayLabel } from '@/lib/travel';
import { supabaseClient } from '@/lib/supabase';
import { Trip } from '@/lib/types';

/** 자주 가는 곳은 눌러서 넣는다. 코드를 외우고 있을 이유가 없다. */
const QUICK_CODES = ['KR', 'JP', 'TW', 'VN', 'TH', 'US', 'FR', 'IT'];

export default function TripEditor() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [place, setPlace] = useState('');
  const [slug, setSlug] = useState('');
  const [countryCode, setCountryCode] = useState('KR');
  const [startedOn, setStartedOn] = useState('');
  const [endedOn, setEndedOn] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [journal, setJournal] = useState('');
  const [published, setPublished] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function loadTrips() {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('trips')
      .select('*')
      .order('started_on', { ascending: false });
    if (!error && data) setTrips(data as Trip[]);
    setLoading(false);
  }

  useEffect(() => {
    // 기본값은 오늘 — 서버와 브라우저의 시간대 차이를 피하려고 마운트 후에 채운다.
    setStartedOn(toDateKey(new Date()));
    loadTrips();
  }, []);

  function resetForm() {
    setEditingId(null);
    setPlace('');
    setSlug('');
    setCountryCode('KR');
    setStartedOn(toDateKey(new Date()));
    setEndedOn('');
    setCoverImageUrl('');
    setJournal('');
    setPublished(false);
    setUploadError('');
  }

  function loadIntoForm(trip: Trip) {
    setEditingId(trip.id);
    setPlace(trip.place);
    setSlug(trip.slug);
    setCountryCode(trip.country_code);
    setStartedOn(trip.started_on);
    setEndedOn(trip.ended_on || '');
    setCoverImageUrl(trip.cover_image_url || '');
    setJournal(trip.journal);
    setPublished(trip.published);
    setStatus('');
    setUploadError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      setCoverImageUrl(await uploadImage(file));
    } catch (err) {
      setUploadError(
        err instanceof Error ? `업로드 실패: ${err.message}` : '업로드 실패'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave() {
    if (!place.trim() || !journal.trim() || !startedOn) {
      setStatus('다녀온 곳과 날짜, 여행기는 필수예요.');
      return;
    }
    if (!isCountryCode(countryCode)) {
      setStatus('나라 코드는 두 글자예요. 일본이면 JP.');
      return;
    }
    if (endedOn && endedOn < startedOn) {
      setStatus('돌아온 날이 떠난 날보다 빨라요.');
      return;
    }

    const finalSlug = toSlug(slug, place);
    if (!finalSlug) {
      setStatus('주소로 쓸 글자가 없어요. slug를 직접 적어주세요.');
      return;
    }

    setSaving(true);
    setStatus('');

    const payload = {
      slug: finalSlug,
      place: place.trim(),
      country_code: countryCode.trim().toUpperCase(),
      started_on: startedOn,
      ended_on: endedOn || null,
      cover_image_url: coverImageUrl.trim() || null,
      journal,
      published,
    };

    let error;
    if (editingId) {
      ({ error } = await supabaseClient
        .from('trips')
        .update(payload)
        .eq('id', editingId));
    } else {
      ({ error } = await supabaseClient.from('trips').insert(payload));
    }

    setSaving(false);
    if (error) {
      setStatus(`저장 실패: ${error.message}`);
    } else {
      setStatus('저장했어요.');
      resetForm();
      loadTrips();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 여행 기록을 삭제할까요?')) return;
    await supabaseClient.from('trips').delete().eq('id', id);
    if (editingId === id) resetForm();
    loadTrips();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="mb-6 text-xl font-bold">
          {editingId ? '여행 기록 수정' : '새 여행 기록'}
        </h1>

        <div className="flex flex-col gap-4">
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="다녀온 곳 (오사카, 제주)"
            className="rounded-md border border-line px-3 py-2 text-lg font-semibold focus:border-ink-muted focus:outline-none"
          />

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="나라 코드"
                maxLength={2}
                className="w-24 rounded-md border border-line px-3 py-2 text-sm uppercase focus:border-ink-muted focus:outline-none"
              />
              <span className="text-2xl leading-none">
                {flagEmoji(countryCode)}
              </span>
              <span className="text-sm text-ink-soft">
                {isCountryCode(countryCode)
                  ? countryName(countryCode)
                  : '두 글자로 적어주세요'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCountryCode(code)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    countryCode === code
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line text-ink-soft hover:border-ink-muted'
                  }`}
                >
                  {flagEmoji(code)} {countryName(code)}
                </button>
              ))}
            </div>
          </div>

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={`slug (비워두면 자동: ${toSlug('', place) || '장소-기반'})`}
            title={`저장되는 주소: ${toSlug(slug, place) || '(비어 있음)'}`}
            className="rounded-md border border-line px-3 py-2 text-sm text-ink-muted focus:border-ink-muted focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              떠난 날
              <input
                type="date"
                value={startedOn}
                onChange={(e) => setStartedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              돌아온 날
              <input
                type="date"
                value={endedOn}
                onChange={(e) => setEndedOn(e.target.value)}
                className="rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
            </label>
            {startedOn && (
              <span className="text-xs text-ink-muted">
                {stayLabel(startedOn, endedOn || null)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="대표 사진 주소 (선택)"
                className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm focus:border-ink-muted focus:outline-none"
              />
              <label className="cursor-pointer whitespace-nowrap rounded-md border border-line px-3 py-2 text-sm text-ink-soft hover:border-ink-muted">
                {uploading ? '올리는 중...' : '사진 올리기'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && (
              <p className="text-xs text-accent">{uploadError}</p>
            )}
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="대표 사진 미리보기"
                className="h-32 w-full rounded-md border border-line object-cover"
              />
            )}
          </div>

          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="여행기를 마크다운으로 적어주세요..."
            rows={16}
            className="rounded-md border border-line px-3 py-2 font-mono text-sm leading-relaxed focus:border-ink-muted focus:outline-none"
          />

          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            발행하기
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
        <h2 className="mb-4 text-sm text-ink-muted">여행 {trips.length}번</h2>

        {loading ? (
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        ) : trips.length === 0 ? (
          <p className="text-sm text-ink-muted">아직 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="border-b border-line pb-3 last:border-b-0"
              >
                <p className="text-sm font-medium">
                  {flagEmoji(trip.country_code)} {trip.place}
                  {!trip.published && (
                    <span className="ml-2 text-xs text-ink-muted">
                      임시저장
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {trip.started_on} ·{' '}
                  {stayLabel(trip.started_on, trip.ended_on)}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    onClick={() => loadIntoForm(trip)}
                    className="text-ink-soft underline hover:text-ink"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="text-ink-muted underline hover:text-ink-soft"
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
