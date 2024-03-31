import { DiagnosticBag } from './Diagnostic';
import { getKeyword } from './SyntaxHelper';
import { SyntaxToken, textSpan } from './SyntaxToken';

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
      return { kind: 'EndOfFileToken', span, text: '\0', children: [] };
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
      return { kind: 'NumberToken', span, text, value, children: [] };
    }

    if (this.isWhitepsace(current)) {
      const start = this.position;
      while (this.isWhitepsace(current)) {
        current = this.text[++this.position];
      }
      const text = this.text.substring(start, this.position);
      const span = textSpan(start, text.length);
      return { kind: 'WhitespaceToken', span, text, children: [] };
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
        return {
          kind: 'PlusToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case '-':
        return {
          kind: 'MinusToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case '*':
        return {
          kind: 'StarToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case '/':
        return {
          kind: 'SlashToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case '(':
        return {
          kind: 'OpenParenthesisToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case ')':
        return {
          kind: 'CloseParenthesisToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case '!':
        if (this.lookAhead() === '=') {
          this.position += 2;
          return {
            kind: 'BangEqualsToken',
            span: textSpan(this.position - 2, 2),
            text: '!=',
            children: [],
          };
        }
        return {
          kind: 'BangToken',
          span: textSpan(this.position++, 1),
          text: current,
          children: [],
        };
      case '&': {
        if (this.lookAhead() === '&') {
          this.position += 2;
          return {
            kind: 'AmpersandAmpersandToken',
            span: textSpan(this.position - 2, 2),
            text: '&&',
            children: [],
          };
        }
      }
      case '|': {
        if (this.lookAhead() === '|') {
          this.position += 2;
          return {
            kind: 'PipePipeToken',
            span: textSpan(this.position - 2, 2),
            text: '||',
            children: [],
          };
        }
      }
      case '=': {
        if (this.lookAhead() === '=') {
          this.position += 2;
          return {
            kind: 'EqualsEqualsToken',
            span: textSpan(this.position - 2, 2),
            text: '==',
            children: [],
          };
        }
      }
    }

    this.diagnostics.reportBadCharacter(this.position, current);
    return { kind: 'BadToken', span: textSpan(this.position, 1), text: current, children: [] };
  }
}
