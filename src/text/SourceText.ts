import { TextSpan } from './TextSpan.ts';
import { TextLine } from './TextLine.ts';

export class SourceText {
  text: string;
  length: number;
  lines: TextLine[];

  constructor(text: string) {
    this.text = text;
    this.length = text.length;
    this.lines = this.parseLines();
  }

  /**
   *  Binary search lines for the line containing index 'position'.
   */
  public getLineIndex(position: number): number {
    let lower = 0;
    let upper = this.lines.length - 1;

    while (lower <= upper) {
      const index = lower + Math.floor((upper - lower) / 2);
      const start = this.lines[index].start;

      if (position == start) return index;

      if (start > position) {
        upper = index - 1;
      } else {
        lower = index + 1;
      }
    }

    return lower - 1;
  }

  public getText(span: TextSpan) {
    return this.text.substring(span.start, span.end);
  }

  private parseLines(): TextLine[] {
    const result: TextLine[] = [];

    let position = 0;
    let lineStart = 0;
    while (position < this.text.length) {
      const lineBreakWidth = this.getLineBreakWidth(position);

      if (lineBreakWidth === 0) {
        position++;
      } else {
        const length = position - lineStart;
        result.push(new TextLine(lineStart, length, lineBreakWidth));
        position += lineBreakWidth;
        lineStart = position;
      }
    }
    if (position > lineStart) {
      result.push(new TextLine(lineStart, position - lineStart, 0));
    }
    return result;
  }

  private getLineBreakWidth(position: number): number {
    var c = this.text[position];
    var l = position + 1 >= this.text.length ? '\0' : this.text[position + 1];

    if (c == '\r' && l == '\n') return 2;

    if (c == '\r' || c == '\n') return 1;

    return 0;
  }
}
