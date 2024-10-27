export function fnRollup(
  fn: Function | Function[] | string | string[],
  ...args: unknown[]
): void {
  if (typeof fn === "function") {
    fn(...args);
  }

  if (Array.isArray(fn)) {
    for (const f of fn) {
      fnRollup(f, ...args);
    }
  }
}
