const EVENT_NAME = "explore:toast";

export function emitToast(payload) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
}

export function onToast(handler) {
  const fn = (e) => handler?.(e.detail);
  window.addEventListener(EVENT_NAME, fn);
  return () => window.removeEventListener(EVENT_NAME, fn);
}