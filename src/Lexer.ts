import { DiagnosticBag } from './Diagnostic';
import { getKeyword } from './SyntaxHelper';
import {
  EndOfFileToken,
  NumberToken,
  PlusToken,
  SyntaxToken,
  WhitespaceToken,
  textSpan,
  MinusToken,
  StarToken,
  SlashToken,
  OpenParenthesisToken,
  CloseParenthesisToken,
  BangEqualsToken,
  BangToken,
  AmpersandAmpersandToken,
  PipePipeToken,
  EqualsEqualsToken,
} from './SyntaxToken';

export class Lexer {
  text: string;
  position: number = 0;
  diagnostics: DiagnosticBag = new DiagnosticBag();

  constructor(text: string) {
    this.text = text;
  }

  isDigit(char: string) {
    return !isNaN(parseInt(char, 10));
  }

  isWhitepsace(char: string) {
    return /\s/.test(char);
  }

  isLetter(char: string) {
    if (char === undefined) {
      return false;
    }
    return /[a-zA-Z]/.test(char);
  }

  current() {
    return this.peek(0);
  }

  lookAhead() {
    return this.peek(1);
  }

  peek(offset: number) {
    const index = this.position + offset;

    if (index >= this.text.length) {
      return '\0';
    }

    return this.text[index];
  }

  nextToken(): SyntaxToken {
    if (this.position >= this.text.length) {
      const span = textSpan(this.position, 1);
      return EndOfFileToken(span);
    }

    let current = this.current();

    if (this.isDigit(current)) {
      const start = this.position;
      while (this.isDigit(current)) {
        current = this.text[++this.position];
      }

      var text = this.text.substring(start, this.position);
      const value = parseInt(text);
      if (isNaN(value)) {
        const span = textSpan(start, text.length);
        this.diagnostics.reportInvalidNumber(span, text);
      }

      const span = textSpan(start, text.length);
      return NumberToken(span, text, value);
    }

    if (this.isWhitepsace(current)) {
      const start = this.position;
      while (this.isWhitepsace(current)) {
        current = this.text[++this.position];
      }
      const text = this.text.substring(start, this.position);
      const span = textSpan(start, text.length);
      return WhitespaceToken(span, text);
    }

    if (this.isLetter(current)) {
      var start = this.position;

      while (this.isLetter(current)) {
        current = this.text[++this.position];
      }
      const text = this.text.substring(start, this.position);
      const token = getKeyword(text, this.position - text.length);
      return token;
    }

    switch (current) {
      case '+':
        return PlusToken(textSpan(this.position++, 1));
      case '-':
        return MinusToken(textSpan(this.position++, 1));
      case '*':
        return StarToken(textSpan(this.position++, 1));
      case '/':
        return SlashToken(textSpan(this.position++, 1));
      case '(':
        return OpenParenthesisToken(textSpan(this.position++, 1));
      case ')':
        return CloseParenthesisToken(textSpan(this.position++, 1));
      case '!':
        if (this.lookAhead() === '=') {
          this.position += 2;
          return BangEqualsToken(textSpan(this.position - 2, 2));
        }
        return BangToken(textSpan(this.position++, 1));
      case '&': {
        if (this.lookAhead() === '&') {
          this.position += 2;
          return AmpersandAmpersandToken(textSpan(this.position - 2, 2));
        }
      }
      case '|': {
        if (this.lookAhead() === '|') {
          this.position += 2;
          return PipePipeToken(textSpan(this.position - 2, 2));
        }
      }
      case '=': {
        if (this.lookAhead() === '=') {
          this.position += 2;
          return EqualsEqualsToken(textSpan(this.position - 2, 2));
        }
      }
    }

    this.diagnostics.reportBadCharacter(this.position, current);
    return { kind: 'BadToken', span: textSpan(this.position, 1), text: current, children: [] };
  }
}
