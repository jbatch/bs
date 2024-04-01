import { DiagnosticBag } from '../reporting/Diagnostic';
import { SourceText } from '../text/SourceText';
import { getKeywordOrIdentifier } from './SyntaxHelper';
import {
  EndOfFileToken,
  NumberToken,
  PlusToken,
  TokenSyntax,
  WhitespaceToken,
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
  EqualsToken,
  BadToken,
} from './TokenSyntax';
import { textSpan } from '../text/TextSpan';

export class Lexer {
  source: SourceText;
  position: number = 0;
  diagnostics: DiagnosticBag = new DiagnosticBag();

  constructor(source: SourceText) {
    this.source = source;
  }

  private isDigit(char: string) {
    return !isNaN(parseInt(char, 10));
  }

  private isWhitepsace(char: string) {
    return /\s/.test(char);
  }

  private isLetter(char: string) {
    if (char === undefined) {
      return false;
    }
    return /[a-zA-Z]/.test(char);
  }

  private current() {
    return this.peek(0);
  }

  private lookAhead() {
    return this.peek(1);
  }

  private peek(offset: number) {
    const index = this.position + offset;

    if (index >= this.source.length) {
      return '\0';
    }

    return this.source.text[index];
  }

  nextToken(): TokenSyntax {
    if (this.position >= this.source.length) {
      const span = textSpan(this.position, 1);
      return EndOfFileToken(span);
    }

    let current = this.current();

    if (this.isDigit(this.current())) {
      return this.readNumber();
    }

    if (this.isWhitepsace(this.current())) {
      return this.readWhitespace();
    }

    if (this.isLetter(this.current())) {
      return this.readKeywordOrIdentifier();
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
        } else {
          return EqualsToken(textSpan(this.position++, 1));
        }
      }
    }

    this.diagnostics.reportBadCharacter(this.position, current);
    return BadToken(textSpan(this.position, 1), current);
  }

  private readKeywordOrIdentifier() {
    var start = this.position;

    while (this.isLetter(this.current())) {
      this.position++;
    }
    const text = this.source.text.substring(start, this.position);
    const token = getKeywordOrIdentifier(text, this.position - text.length);
    return token;
  }

  private readWhitespace() {
    const start = this.position;
    while (this.isWhitepsace(this.current())) {
      this.position++;
    }
    const text = this.source.text.substring(start, this.position);
    const span = textSpan(start, text.length);
    return WhitespaceToken(span, text);
  }

  private readNumber(): TokenSyntax {
    const start = this.position;
    while (this.isDigit(this.current())) {
      this.position++;
    }

    var text = this.source.text.substring(start, this.position);
    const span = textSpan(start, text.length);
    const value = parseInt(text);
    if (isNaN(value)) {
      this.diagnostics.reportInvalidNumber(span, text);
    }

    return NumberToken(span, text, value);
  }
}
