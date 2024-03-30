import { getKeyword } from './SyntaxHelper';
import { SyntaxToken } from './SyntaxToken';

export class Lexer {
  text: string;
  position: number = 0;
  diagnostics: string[] = [];

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
      return { kind: 'EndOfFileToken', position: this.position, text: '\0', children: [] };
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
        this.diagnostics.push(`Invalid number "${text}"`);
      }

      return { kind: 'NumberToken', position: start, text, value, children: [] };
    }

    if (this.isWhitepsace(current)) {
      const start = this.position;
      while (this.isWhitepsace(current)) {
        current = this.text[++this.position];
      }
      const text = this.text.substring(start, this.position);
      return { kind: 'WhitespaceToken', position: start, text, children: [] };
    }

    if (this.isLetter(current)) {
      var start = this.position;

      while (this.isLetter(current)) {
        current = this.text[++this.position];
      }
      const text = this.text.substring(start, this.position);
      const token = getKeyword(text, this.position);
      return token;
    }

    switch (current) {
      case '+':
        return { kind: 'PlusToken', position: this.position++, text: current, children: [] };
      case '-':
        return { kind: 'MinusToken', position: this.position++, text: current, children: [] };
      case '*':
        return { kind: 'StarToken', position: this.position++, text: current, children: [] };
      case '/':
        return { kind: 'SlashToken', position: this.position++, text: current, children: [] };
      case '(':
        return {
          kind: 'OpenParenthesisToken',
          position: this.position++,
          text: current,
          children: [],
        };
      case ')':
        return {
          kind: 'CloseParenthesisToken',
          position: this.position++,
          text: current,
          children: [],
        };
      case '!':
        if (this.lookAhead() === '=') {
          this.position += 2;
          return { kind: 'BangEqualsToken', position: this.position - 2, text: '!=', children: [] };
        }
        return { kind: 'BangToken', position: this.position++, text: current, children: [] };
      case '&': {
        if (this.lookAhead() === '&') {
          this.position += 2;
          return {
            kind: 'AmpersandAmpersandToken',
            position: this.position - 2,
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
            position: this.position - 2,
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
            position: this.position - 2,
            text: '==',
            children: [],
          };
        }
      }
    }

    this.diagnostics.push(`Input error: unexpected character ${current}`);
    return { kind: 'BadToken', position: this.position, text: current, children: [] };
  }
}
