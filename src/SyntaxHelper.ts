import { SyntaxKind, SyntaxToken, textSpan } from './SyntaxToken';

export function getBinaryOperatorPrecedence(kind: SyntaxKind) {
  switch (kind) {
    case 'StarToken':
    case 'SlashToken':
      return 5;
    case 'PlusToken':
    case 'MinusToken':
      return 4;
    case 'EqualsEqualsToken':
    case 'BangEqualsToken':
      return 3;
    case 'AmpersandAmpersandToken':
      return 2;
    case 'PipePipeToken':
      return 1;
    default:
      return 0;
  }
}

export function getUnaryOperatorPrecedence(kind: SyntaxKind) {
  switch (kind) {
    case 'PlusToken':
    case 'MinusToken':
    case 'BangToken':
      return 6;
    default:
      return 0;
  }
}

export function getKeyword(text: string, position: number): SyntaxToken {
  switch (text) {
    case 'true':
      return {
        kind: 'TrueKeyword',
        span: textSpan(position, text.length),
        text,
        value: true,
        children: [],
      };
    case 'false':
      return {
        kind: 'FalseKeyword',
        span: textSpan(position, text.length),
        text,
        value: false,
        children: [],
      };
    default:
      return { kind: 'IdentifierToken', span: textSpan(position, text.length), text, children: [] };
  }
}
