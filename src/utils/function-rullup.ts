export function fnRollup(fn: Function | Function[], ...args: unknown[]): void {
  if (typeof fn === "function") {
    fn(...args);
  }

  if (Array.isArray(fn)) {
    for (const f of fn) {
      f(...args);
    }
  }
}
