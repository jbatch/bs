import { TextSpan } from '../text/TextSpan';

export type TokenSyntax =
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
      | { kind: 'OpenBraceToken'; span: TextSpan; text?: '{'; value?: undefined }
      | { kind: 'CloseBraceToken'; span: TextSpan; text?: '}'; value?: undefined }
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
    ) & { children: TokenSyntax[] };

export type TokenSyntaxKind = TokenSyntax['kind'];

// Tokens
export function NumberToken(span: TextSpan, text: string, value: number | string): TokenSyntax {
  return { kind: 'NumberToken', span, text, value, children: [] };
}

export function WhitespaceToken(span: TextSpan, text: string): TokenSyntax {
  return { kind: 'WhitespaceToken', span, text, value: undefined, children: [] };
}

export function PlusToken(span: TextSpan): TokenSyntax {
  return { kind: 'PlusToken', span, text: '+', value: undefined, children: [] };
}

export function MinusToken(span: TextSpan): TokenSyntax {
  return { kind: 'MinusToken', span, text: '-', value: undefined, children: [] };
}

export function StarToken(span: TextSpan): TokenSyntax {
  return { kind: 'StarToken', span, text: '*', value: undefined, children: [] };
}

export function SlashToken(span: TextSpan): TokenSyntax {
  return { kind: 'SlashToken', span, text: '/', value: undefined, children: [] };
}

export function OpenParenthesisToken(span: TextSpan): TokenSyntax {
  return { kind: 'OpenParenthesisToken', span, text: '(', value: undefined, children: [] };
}

export function CloseParenthesisToken(span: TextSpan): TokenSyntax {
  return { kind: 'CloseParenthesisToken', span, text: ')', value: undefined, children: [] };
}

export function OpenBraceToken(span: TextSpan): TokenSyntax {
  return { kind: 'OpenBraceToken', span, text: '{', value: undefined, children: [] };
}

export function CloseBraceToken(span: TextSpan): TokenSyntax {
  return { kind: 'CloseBraceToken', span, text: '}', value: undefined, children: [] };
}

export function BangToken(span: TextSpan): TokenSyntax {
  return { kind: 'BangToken', span, text: '!', value: undefined, children: [] };
}

export function EqualsToken(span: TextSpan): TokenSyntax {
  return { kind: 'EqualsToken', span, text: '=', value: undefined, children: [] };
}

export function AmpersandAmpersandToken(span: TextSpan): TokenSyntax {
  return { kind: 'AmpersandAmpersandToken', span, text: '&&', value: undefined, children: [] };
}

export function PipePipeToken(span: TextSpan): TokenSyntax {
  return { kind: 'PipePipeToken', span, text: '||', value: undefined, children: [] };
}

export function EqualsEqualsToken(span: TextSpan): TokenSyntax {
  return { kind: 'EqualsEqualsToken', span, text: '==', value: undefined, children: [] };
}

export function BangEqualsToken(span: TextSpan): TokenSyntax {
  return { kind: 'BangEqualsToken', span, text: '!=', value: undefined, children: [] };
}

export function IdentifierToken(span: TextSpan, text: string): TokenSyntax {
  return { kind: 'IdentifierToken', span, text, value: undefined, children: [] };
}

// Keywords
export function TrueKeyword(span: TextSpan): TokenSyntax {
  return { kind: 'TrueKeyword', span, text: 'true', value: true, children: [] };
}

export function FalseKeyword(span: TextSpan): TokenSyntax {
  return { kind: 'FalseKeyword', span, text: 'false', value: false, children: [] };
}

// Should not be used
export function BadToken(span: TextSpan, text: string): TokenSyntax {
  return { kind: 'BadToken', span, text, value: undefined, children: [] };
}

export function EndOfFileToken(span: TextSpan): TokenSyntax {
  return { kind: 'EndOfFileToken', span, text: '\0', value: undefined, children: [] };
}