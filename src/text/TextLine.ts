import { TextSpan, textSpan } from './TextSpan.ts';

export class TextLine {
  start: number;
  end: number;
  length: number;
  lengthIncludingLineBreak: number;
  span: TextSpan;
  spanIncludingLineBreak: TextSpan;

  constructor(start: number, length: number, lineBreakLength: number) {
    this.start = start;
    this.end = start + length;
    this.length = length;
    this.lengthIncludingLineBreak = length + lineBreakLength;
    this.span = textSpan(start, length);
    this.spanIncludingLineBreak = textSpan(start, this.lengthIncludingLineBreak);
  }
}
