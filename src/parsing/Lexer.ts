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
  OpenBraceToken,
  CloseBraceToken,
  LessOrEqualsToken,
  LessToken,
  GreaterOrEqualsToken,
  GreaterToken,
  SemicolonToken,
  CaretToken,
  TildeToken,
  AmpersandToken,
  PipeToken,
  StringToken,
  PlusPlus,
  PlusEquals,
  MinusMinus,
  MinusEquals,
  CommaToken,
  ColonToken,
} from './TokenSyntax';
import { TextSpan, textSpan, textSpanWithEnd } from '../text/TextSpan';

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

  private consumeSymbols(n: number): TextSpan {
    const start = this.position;
    this.position += n;
    return textSpan(start, n);
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
        if (this.lookAhead() === '+') {
          return PlusPlus(this.consumeSymbols(2));
        } else if (this.lookAhead() === '=') {
          return PlusEquals(this.consumeSymbols(2));
        }
        return PlusToken(this.consumeSymbols(1));
      case '-':
        if (this.lookAhead() === '-') {
          return MinusMinus(this.consumeSymbols(2));
        } else if (this.lookAhead() === '=') {
          return MinusEquals(this.consumeSymbols(2));
        }
        return MinusToken(this.consumeSymbols(1));
      case '*':
        return StarToken(this.consumeSymbols(1));
      case '/':
        return SlashToken(this.consumeSymbols(1));
      case '(':
        return OpenParenthesisToken(this.consumeSymbols(1));
      case ')':
        return CloseParenthesisToken(this.consumeSymbols(1));
      case '{':
        return OpenBraceToken(this.consumeSymbols(1));
      case '}':
        return CloseBraceToken(this.consumeSymbols(1));
      case '^':
        return CaretToken(this.consumeSymbols(1));
      case '~':
        return TildeToken(this.consumeSymbols(1));
      case '"':
        return this.readString();
      case '!':
        if (this.lookAhead() === '=') {
          return BangEqualsToken(this.consumeSymbols(2));
        }
        return BangToken(this.consumeSymbols(1));
      case '&': {
        if (this.lookAhead() === '&') {
          return AmpersandAmpersandToken(this.consumeSymbols(2));
        } else {
          return AmpersandToken(this.consumeSymbols(1));
        }
      }
      case '|': {
        if (this.lookAhead() === '|') {
          return PipePipeToken(this.consumeSymbols(2));
        } else {
          return PipeToken(this.consumeSymbols(1));
        }
      }
      case ':':
        return ColonToken(this.consumeSymbols(1));
      case ';':
        return SemicolonToken(this.consumeSymbols(1));
      case ',':
        return CommaToken(this.consumeSymbols(1));
      case '=': {
        if (this.lookAhead() === '=') {
          return EqualsEqualsToken(this.consumeSymbols(2));
        } else {
          return EqualsToken(this.consumeSymbols(1));
        }
      }
      case '<': {
        if (this.lookAhead() === '=') {
          return LessOrEqualsToken(this.consumeSymbols(2));
        }
        return LessToken(this.consumeSymbols(1));
      }
      case '>': {
        if (this.lookAhead() === '=') {
          return GreaterOrEqualsToken(this.consumeSymbols(2));
        }
        return GreaterToken(this.consumeSymbols(1));
      }
    }

    this.diagnostics.reportBadCharacter(this.position, current);
    return BadToken(textSpan(this.position, 1));
  }

  private readKeywordOrIdentifier() {
    const start = this.position;

    while (this.isLetter(this.current())) {
      this.position++;
    }
    const text = this.source.text.substring(start, this.position);
    const token = getKeywordOrIdentifier(text, this.position - text.length);
    return token;
  }

  private readString(): TokenSyntax {
    const start = this.position++;

    let done = false;
    let stringBuilder = '';
    while (!done) {
      switch (this.current()) {
        case '\n':
        case '\n':
        case '\r':
          this.diagnostics.reportUnterminatedString(textSpan(start, 1));
          done = true;
          this.position++;
          break;
        case '"':
          this.position++;
          done = true;
          break;
        default:
          stringBuilder += this.current();
          this.position++;
      }
    }
    const span = textSpanWithEnd(start, this.position);
    return StringToken(span, stringBuilder);
  }

  private readWhitespace() {
    const start = this.position;
    while (this.isWhitepsace(this.current())) {
      this.position++;
    }
    const span = textSpan(start, this.position - start);
    return WhitespaceToken(span);
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

    return NumberToken(span, value);
  }
}
