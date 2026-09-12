'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from './supabase';

/**
 * 관리자 화면 네 곳(독후감·여행·복무·활동)이 똑같이 하던 일.
 *
 * 표에서 목록을 읽고, 새로 넣거나 고치고, 지우고, 그 사이의 진행 상태를
 * 문구로 보여준다. 표 이름과 정렬 기준만 다르고 나머지는 글자까지 같았다.
 *
 * 폼의 입력값은 여기서 다루지 않는다. 항목마다 칸이 달라서 한데 묶으면
 * 오히려 읽기 어려워진다. 목록과 저장만 맡는다.
 */
export function useAdminCollection<T extends { id: string }>(
  table: string,
  orderBy: { column: string; ascending?: boolean }
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const { column, ascending = false } = orderBy;

  /*
    불러오는 동안 loading 을 다시 켜지 않는다. 처음에는 이미 켜져 있고,
    저장이나 삭제 뒤의 새로고침에서는 켜봤자 목록이 한 번 사라졌다 돌아오는
    깜빡임만 생긴다. 그동안 보이는 건 직전 목록이고, 곧 새 목록으로 바뀐다.
  */
  const load = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .order(column, { ascending, nullsFirst: false });

    if (error) {
      setStatus(`목록을 불러오지 못했어요: ${error.message}`);
    } else if (data) {
      setItems(data as T[]);
    }

    setLoading(false);
  }, [table, column, ascending]);

  /*
    화면이 붙으면 목록을 받아온다.

    load 안의 setState 는 전부 await 뒤, 즉 응답이 온 다음에 일어난다.
    규칙은 await 를 건너보지 못해서 effect 안에서 바로 상태를 바꾼다고 읽는다.
    React 문서가 말하는 "외부에서 값이 오면 그때 setState" 그대로다.
  */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  /**
   * editingId 가 있으면 고치고 없으면 새로 넣는다.
   * 성공하면 폼을 비우도록 true 를 돌려준다. 실패했는데 폼까지 비우면
   * 적어둔 내용이 사라진다.
   */
  async function save(payload: Record<string, unknown>): Promise<boolean> {
    setSaving(true);
    setStatus('');

    const { error } = editingId
      ? await supabaseClient.from(table).update(payload).eq('id', editingId)
      : await supabaseClient.from(table).insert(payload);

    setSaving(false);

    if (error) {
      setStatus(`저장 실패: ${error.message}`);
      return false;
    }

    setStatus('저장했어요.');
    setEditingId(null);
    await load();
    return true;
  }

  async function remove(id: string, confirmMessage: string) {
    if (!confirm(confirmMessage)) return false;

    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if (error) {
      setStatus(`삭제 실패: ${error.message}`);
      return false;
    }

    if (editingId === id) setEditingId(null);
    await load();
    return true;
  }

  return {
    items,
    loading,
    editingId,
    setEditingId,
    saving,
    status,
    setStatus,
    load,
    save,
    remove,
  };
}
