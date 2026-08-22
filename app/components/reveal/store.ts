"use client";

import { useSyncExternalStore } from "react";

/**
 * A one-way latch shared by the entrance gate and the page content.
 *
 * Page sections render at opacity 0 and wait for this to flip, so the gate can
 * hand off deliberately: its copy leaves, the night dissolves to paper, and
 * only then does the page begin arriving underneath. Once flipped it stays
 * flipped for the rest of the session, so client navigations are instant.
 */
let revealed = false;
const subscribers = new Set<() => void>();

export function reveal() {
  if (revealed) return;
  revealed = true;
  for (const notify of subscribers) notify();
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

const getSnapshot = () => revealed;
// The server has no idea whether the gate will run, so it always renders the
// pre-reveal state; the client corrects it on hydration.
const getServerSnapshot = () => false;

export function useRevealed() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
