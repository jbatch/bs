export type SyntaxToken =
  | (
      | { kind: 'NumberToken'; position: number; text?: string; value?: number }
      | { kind: 'WhitespaceToken'; position: number; text?: string; value?: undefined }
      | { kind: 'PlusToken'; position: number; text?: '+'; value?: undefined }
      | { kind: 'MinusToken'; position: number; text?: '-'; value?: undefined }
      | { kind: 'StarToken'; position: number; text?: '*'; value?: undefined }
      | { kind: 'SlashToken'; position: number; text?: '/'; value?: undefined }
      | { kind: 'OpenParenthesisToken'; position: number; text?: '('; value?: undefined }
      | { kind: 'CloseParenthesisToken'; position: number; text?: ')'; value?: undefined }
      | { kind: 'BadToken'; position: number; text?: string; value?: undefined }
      | { kind: 'EndOfFileToken'; position: number; text?: '\0'; value?: undefined }
    ) & { children: [] };

export type SyntaxKind = SyntaxToken['kind'];

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

  nextToken(): SyntaxToken {
    if (this.position >= this.text.length) {
      return { kind: 'EndOfFileToken', position: this.position, text: '\0', children: [] };
    }

    let current = this.text[this.position];

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
      var text = this.text.substring(start, this.position);
      return { kind: 'WhitespaceToken', position: start, text, children: [] };
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
    }

    this.diagnostics.push(`Input error: unexpected character ${current}`);
    return { kind: 'BadToken', position: this.position, text: current, children: [] };
  }
}
