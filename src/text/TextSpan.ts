export type TextSpan = { start: number; end: number; length: number };

export function textSpan(start: number, length: number): TextSpan {
  return { start, end: start + length, length };
}

export function textSpanWithEnd(start: number, end: number): TextSpan {
  return { start, end, length: end - start };
}
