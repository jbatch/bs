import { TextSpan } from '../text/TextSpan';

export type SyntaxToken =
  | // Tokens
  (
      | { kind: 'NumberToken'; span: TextSpan; text?: string; value?: number | string }
      | { kind: 'WhitespaceToken'; span: TextSpan; text?: string; value?: undefined }
      | { kind: 'PlusToken'; span: TextSpan; text?: '+'; value?: undefined }
      | { kind: 'MinusToken'; span: TextSpan; text?: '-'; value?: undefined }
      | { kind: 'StarToken'; span: TextSpan; text?: '*'; value?: undefined }
      | { kind: 'SlashToken'; span: TextSpan; text?: '/'; value?: undefined }
      | { kind: 'OpenParenthesisToken'; span: TextSpan; text?: '('; value?: undefined }
      | { kind: 'CloseParenthesisToken'; span: TextSpan; text?: ')'; value?: undefined }
      | { kind: 'BangToken'; span: TextSpan; text?: '!'; value?: undefined }
      | { kind: 'EqualsToken'; span: TextSpan; text?: '='; value?: undefined }
      | { kind: 'AmpersandAmpersandToken'; span: TextSpan; text?: '&&'; value?: undefined }
      | { kind: 'PipePipeToken'; span: TextSpan; text?: '||'; value?: undefined }
      | { kind: 'EqualsEqualsToken'; span: TextSpan; text?: '=='; value?: undefined }
      | { kind: 'BangEqualsToken'; span: TextSpan; text?: '!='; value?: undefined }
      | { kind: 'IdentifierToken'; span: TextSpan; text?: string; value?: undefined }
      // Keywords
      | { kind: 'TrueKeyword'; span: TextSpan; text?: 'true'; value?: true }
      | { kind: 'FalseKeyword'; span: TextSpan; text?: 'false'; value?: false }
      | { kind: 'BadToken'; span: TextSpan; text?: string; value?: undefined }
      | { kind: 'EndOfFileToken'; span: TextSpan; text?: '\0'; value?: undefined }
    ) & { children: SyntaxToken[] };

// Tokens
export function NumberToken(span: TextSpan, text: string, value: number | string): SyntaxToken {
  return { kind: 'NumberToken', span, text, value, children: [] };
}

export function WhitespaceToken(span: TextSpan, text: string): SyntaxToken {
  return { kind: 'WhitespaceToken', span, text, value: undefined, children: [] };
}

export function PlusToken(span: TextSpan): SyntaxToken {
  return { kind: 'PlusToken', span, text: '+', value: undefined, children: [] };
}

export function MinusToken(span: TextSpan): SyntaxToken {
  return { kind: 'MinusToken', span, text: '-', value: undefined, children: [] };
}

export function StarToken(span: TextSpan): SyntaxToken {
  return { kind: 'StarToken', span, text: '*', value: undefined, children: [] };
}

export function SlashToken(span: TextSpan): SyntaxToken {
  return { kind: 'SlashToken', span, text: '/', value: undefined, children: [] };
}

export function OpenParenthesisToken(span: TextSpan): SyntaxToken {
  return { kind: 'OpenParenthesisToken', span, text: '(', value: undefined, children: [] };
}

export function CloseParenthesisToken(span: TextSpan): SyntaxToken {
  return { kind: 'CloseParenthesisToken', span, text: ')', value: undefined, children: [] };
}

export function BangToken(span: TextSpan): SyntaxToken {
  return { kind: 'BangToken', span, text: '!', value: undefined, children: [] };
}

export function EqualsToken(span: TextSpan): SyntaxToken {
  return { kind: 'EqualsToken', span, text: '=', value: undefined, children: [] };
}

export function AmpersandAmpersandToken(span: TextSpan): SyntaxToken {
  return { kind: 'AmpersandAmpersandToken', span, text: '&&', value: undefined, children: [] };
}

export function PipePipeToken(span: TextSpan): SyntaxToken {
  return { kind: 'PipePipeToken', span, text: '||', value: undefined, children: [] };
}

export function EqualsEqualsToken(span: TextSpan): SyntaxToken {
  return { kind: 'EqualsEqualsToken', span, text: '==', value: undefined, children: [] };
}

export function BangEqualsToken(span: TextSpan): SyntaxToken {
  return { kind: 'BangEqualsToken', span, text: '!=', value: undefined, children: [] };
}

export function IdentifierToken(span: TextSpan, text: string): SyntaxToken {
  return { kind: 'IdentifierToken', span, text, value: undefined, children: [] };
}

// Keywords
export function TrueKeyword(span: TextSpan): SyntaxToken {
  return { kind: 'TrueKeyword', span, text: 'true', value: true, children: [] };
}

export function FalseKeyword(span: TextSpan): SyntaxToken {
  return { kind: 'FalseKeyword', span, text: 'false', value: false, children: [] };
}

// Should not be used
export function BadToken(span: TextSpan, text: string): SyntaxToken {
  return { kind: 'BadToken', span, text, value: undefined, children: [] };
}

export function EndOfFileToken(span: TextSpan): SyntaxToken {
  return { kind: 'EndOfFileToken', span, text: '\0', value: undefined, children: [] };
}

export type SyntaxKind = SyntaxToken['kind'];
