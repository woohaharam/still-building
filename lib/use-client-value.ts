'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** 값이 바뀌는 걸 알려주는 수단이 없는 자리라, 구독은 아무것도 하지 않는다. */
const noSubscribe = () => () => {};

/**
 * 서버에서는 알 수 없고 브라우저에서만 읽히는 값.
 *
 * 시계, 시간대, localStorage 처럼 서버와 브라우저의 답이 다른 것들이다.
 * 붙기 전에는 null 을 내고, 붙은 뒤부터 read() 가 낸 값을 낸다.
 *
 * effect 안에서 setState 로 같은 일을 하면 화면을 한 번 더 그린다.
 * 이쪽은 React 가 첫 그리기에서 바로 처리한다.
 *
 * read() 는 부를 때마다 같은 값을 내야 한다. 숫자나 글자는 괜찮지만
 * 객체나 배열을 새로 만들어 돌려주면 React 가 끝없이 다시 그린다.
 */
export function useClientValue<T>(read: () => T): T | null {
  return useSyncExternalStore<T | null>(noSubscribe, read, () => null);
}

/**
 * 지금 시각. 정해준 간격마다 다시 읽는다.
 *
 * 예약 표시처럼 시간이 지나면 저절로 바뀌어야 하는 자리에 쓴다. 그리는
 * 중에 Date.now() 를 부르면 같은 입력에 다른 화면이 나와서, 시간을 바깥
 * 값으로 두고 구독한다.
 *
 * 간격 단위로 끊어서 낸다. 밀리초를 그대로 내면 부를 때마다 값이 달라져
 * React 가 끝없이 다시 그린다. 그만큼 늦게 바뀌는 건 감수한다.
 */
export function useNow(intervalMs = 60_000): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs]
  );

  const read = useCallback(
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    [intervalMs]
  );

  // 서버에서는 0. 아직 아무것도 지나지 않은 셈이라 예약 표시가 뜨지 않는다.
  return useSyncExternalStore(subscribe, read, () => 0);
}
