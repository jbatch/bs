export type SyntaxToken =
  | (
      | { kind: 'NumberToken'; position: number; text?: string; value?: number | string }
      | { kind: 'WhitespaceToken'; position: number; text?: string; value?: undefined }
      | { kind: 'PlusToken'; position: number; text?: '+'; value?: undefined }
      | { kind: 'MinusToken'; position: number; text?: '-'; value?: undefined }
      | { kind: 'StarToken'; position: number; text?: '*'; value?: undefined }
      | { kind: 'SlashToken'; position: number; text?: '/'; value?: undefined }
      | { kind: 'OpenParenthesisToken'; position: number; text?: '('; value?: undefined }
      | { kind: 'CloseParenthesisToken'; position: number; text?: ')'; value?: undefined }
      | { kind: 'IdentifierToken'; position: number; text?: string; value?: undefined }
      | { kind: 'TrueKeyword'; position: number; text?: 'true'; value?: true }
      | { kind: 'FalseKeyword'; position: number; text?: 'false'; value?: false }
      | { kind: 'BadToken'; position: number; text?: string; value?: undefined }
      | { kind: 'EndOfFileToken'; position: number; text?: '\0'; value?: undefined }
    ) & { children: [] };

export type SyntaxKind = SyntaxToken['kind'];
