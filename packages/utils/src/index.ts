/** Shared utilities (dates, strings, errors). */

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
