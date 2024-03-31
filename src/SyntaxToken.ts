export type TextSpan = { start: number; end: number; length: number };
export function textSpan(start: number, length: number): TextSpan {
  return { start, end: start + length, length };
}

export type SyntaxToken =
  | (
      | { kind: 'NumberToken'; span: TextSpan; text?: string; value?: number | string }
      | { kind: 'WhitespaceToken'; span: TextSpan; text?: string; value?: undefined }
      | { kind: 'PlusToken'; span: TextSpan; text?: '+'; value?: undefined }
      | { kind: 'MinusToken'; span: TextSpan; text?: '-'; value?: undefined }
      | { kind: 'StarToken'; span: TextSpan; text?: '*'; value?: undefined }
      | { kind: 'SlashToken'; span: TextSpan; text?: '/'; value?: undefined }
      | { kind: 'OpenParenthesisToken'; span: TextSpan; text?: '('; value?: undefined }
      | { kind: 'CloseParenthesisToken'; span: TextSpan; text?: ')'; value?: undefined }
      | { kind: 'BangToken'; span: TextSpan; text?: '!'; value?: undefined }
      | { kind: 'AmpersandAmpersandToken'; span: TextSpan; text?: '&&'; value?: undefined }
      | { kind: 'PipePipeToken'; span: TextSpan; text?: '||'; value?: undefined }
      | { kind: 'EqualsEqualsToken'; span: TextSpan; text?: '=='; value?: undefined }
      | { kind: 'BangEqualsToken'; span: TextSpan; text?: '!='; value?: undefined }
      | { kind: 'IdentifierToken'; span: TextSpan; text?: string; value?: undefined }
      | { kind: 'TrueKeyword'; span: TextSpan; text?: 'true'; value?: true }
      | { kind: 'FalseKeyword'; span: TextSpan; text?: 'false'; value?: false }
      | { kind: 'BadToken'; span: TextSpan; text?: string; value?: undefined }
      | { kind: 'EndOfFileToken'; span: TextSpan; text?: '\0'; value?: undefined }
    ) & { children: [] };

export type SyntaxKind = SyntaxToken['kind'];
