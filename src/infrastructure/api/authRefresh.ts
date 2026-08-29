let handler: (() => void) | null = null;

export function setAuthRefreshHandler(fn: () => void) {
  handler = fn;
}

export function refreshAuth() {
  handler?.();
}
