'use client';

import { useEffect, useRef } from 'react';
import { adfitUnit } from '@/lib/site';

const SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js';

/**
 * 카카오 애드핏 광고.
 *
 * 애드핏 스크립트는 받아지는 순간 문서에서 .kakao_ad_area 를 찾아 한 번
 * 채운다. 그 뒤로는 다시 안 본다. 글에서 글로 넘어가는 건 Next 가 화면만
 * 갈아끼우는 거라 문서를 새로 받지 않아서, 스크립트를 머리에 한 번 심어두는
 * 방식이면 두 번째 글부터는 빈 자리만 남는다.
 *
 * 그래서 이 칸이 생길 때마다 스크립트를 새로 붙이고, 칸이 사라질 때 같이
 * 걷는다. 칸 하나에 스크립트 하나가 붙었다 떨어진다.
 *
 * id 가 비어 있으면 아무것도 그리지 않는다. 자리만 잡아두면 광고가 없는
 * 동안 글 밑에 빈 구멍이 남는다.
 */
export default function AdFit() {
  const slot = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adfitUnit.id) return;

    const node = slot.current;
    if (!node) return;

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    node.after(script);

    return () => {
      script.remove();
    };
  }, []);

  if (!adfitUnit.id) return null;

  return (
    <aside className="no-print mt-12 flex justify-center border-t border-line pt-8">
      {/*
        애드핏이 채우기 전까지 display:none 이다. 스크립트가 광고를 넣으면서
        직접 벗긴다. 미리 보이게 해두면 광고가 안 붙었을 때 빈 상자가 남는다.
      */}
      <ins
        ref={slot}
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adfitUnit.id}
        data-ad-width={adfitUnit.width}
        data-ad-height={adfitUnit.height}
      />
    </aside>
  );
}
