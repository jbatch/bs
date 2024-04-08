import { TextSpan } from '../text/TextSpan';
import { SyntaxNode } from './SyntaxNode';

export type TokenSyntaxKind = TokenSyntax['kind'];

// Generated code

export type NumberTokenSyntax = {
  kind: 'NumberToken';
  span: TextSpan;
  value: number;
  children: SyntaxNode[];
};
export type StringTokenSyntax = {
  kind: 'StringToken';
  span: TextSpan;
  value: string;
  children: SyntaxNode[];
};
export type WhitespaceTokenSyntax = {
  kind: 'WhitespaceToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type PlusTokenSyntax = {
  kind: 'PlusToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type MinusTokenSyntax = {
  kind: 'MinusToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type StarTokenSyntax = {
  kind: 'StarToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type SlashTokenSyntax = {
  kind: 'SlashToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type PlusEqualsSyntax = {
  kind: 'PlusEquals';
  span: TextSpan;
  children: SyntaxNode[];
};
export type MinusEqualsSyntax = {
  kind: 'MinusEquals';
  span: TextSpan;
  children: SyntaxNode[];
};
export type PlusPlusSyntax = {
  kind: 'PlusPlus';
  span: TextSpan;
  children: SyntaxNode[];
};
export type MinusMinusSyntax = {
  kind: 'MinusMinus';
  span: TextSpan;
  children: SyntaxNode[];
};
export type OpenParenthesisTokenSyntax = {
  kind: 'OpenParenthesisToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type CloseParenthesisTokenSyntax = {
  kind: 'CloseParenthesisToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type OpenBraceTokenSyntax = {
  kind: 'OpenBraceToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type CloseBraceTokenSyntax = {
  kind: 'CloseBraceToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type BangTokenSyntax = {
  kind: 'BangToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type EqualsTokenSyntax = {
  kind: 'EqualsToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type TildeTokenSyntax = {
  kind: 'TildeToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type CaretTokenSyntax = {
  kind: 'CaretToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type AmpersandTokenSyntax = {
  kind: 'AmpersandToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type PipeTokenSyntax = {
  kind: 'PipeToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type SemicolonTokenSyntax = {
  kind: 'SemicolonToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type CommaTokenSyntax = {
  kind: 'CommaToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type LessTokenSyntax = {
  kind: 'LessToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type GreaterTokenSyntax = {
  kind: 'GreaterToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type LessOrEqualsTokenSyntax = {
  kind: 'LessOrEqualsToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type GreaterOrEqualsTokenSyntax = {
  kind: 'GreaterOrEqualsToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type AmpersandAmpersandTokenSyntax = {
  kind: 'AmpersandAmpersandToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type PipePipeTokenSyntax = {
  kind: 'PipePipeToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type EqualsEqualsTokenSyntax = {
  kind: 'EqualsEqualsToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type BangEqualsTokenSyntax = {
  kind: 'BangEqualsToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type IdentifierTokenSyntax = {
  kind: 'IdentifierToken';
  span: TextSpan;
  text: string;
  children: SyntaxNode[];
};
export type NumberLiteralSyntax = {
  kind: 'NumberLiteral';
  span: TextSpan;
  value: number;
  children: SyntaxNode[];
};
export type BooleanLiteralSyntax = {
  kind: 'BooleanLiteral';
  span: TextSpan;
  value: boolean;
  children: SyntaxNode[];
};
export type StringLiteralSyntax = {
  kind: 'StringLiteral';
  span: TextSpan;
  value: string;
  children: SyntaxNode[];
};
export type TrueKeywordSyntax = {
  kind: 'TrueKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type FalseKeywordSyntax = {
  kind: 'FalseKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type ConstKeywordSyntax = {
  kind: 'ConstKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type VarKeywordSyntax = {
  kind: 'VarKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type IfKeywordSyntax = {
  kind: 'IfKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type ElseKeywordSyntax = {
  kind: 'ElseKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type WhileKeywordSyntax = {
  kind: 'WhileKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type ForKeywordSyntax = {
  kind: 'ForKeyword';
  span: TextSpan;
  children: SyntaxNode[];
};
export type BadTokenSyntax = {
  kind: 'BadToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type EndOfFileTokenSyntax = {
  kind: 'EndOfFileToken';
  span: TextSpan;
  children: SyntaxNode[];
};
export type TokenSyntax =
  | NumberTokenSyntax
  | StringTokenSyntax
  | WhitespaceTokenSyntax
  | PlusTokenSyntax
  | MinusTokenSyntax
  | StarTokenSyntax
  | SlashTokenSyntax
  | PlusEqualsSyntax
  | MinusEqualsSyntax
  | PlusPlusSyntax
  | MinusMinusSyntax
  | OpenParenthesisTokenSyntax
  | CloseParenthesisTokenSyntax
  | OpenBraceTokenSyntax
  | CloseBraceTokenSyntax
  | BangTokenSyntax
  | EqualsTokenSyntax
  | TildeTokenSyntax
  | CaretTokenSyntax
  | AmpersandTokenSyntax
  | PipeTokenSyntax
  | SemicolonTokenSyntax
  | CommaTokenSyntax
  | LessTokenSyntax
  | GreaterTokenSyntax
  | LessOrEqualsTokenSyntax
  | GreaterOrEqualsTokenSyntax
  | AmpersandAmpersandTokenSyntax
  | PipePipeTokenSyntax
  | EqualsEqualsTokenSyntax
  | BangEqualsTokenSyntax
  | IdentifierTokenSyntax
  | NumberLiteralSyntax
  | BooleanLiteralSyntax
  | StringLiteralSyntax
  | TrueKeywordSyntax
  | FalseKeywordSyntax
  | ConstKeywordSyntax
  | VarKeywordSyntax
  | IfKeywordSyntax
  | ElseKeywordSyntax
  | WhileKeywordSyntax
  | ForKeywordSyntax
  | BadTokenSyntax
  | EndOfFileTokenSyntax;
export function NumberToken(span: TextSpan, value: number): NumberTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'NumberToken',
    span,
    value,
    children,
  };
}
export function StringToken(span: TextSpan, value: string): StringTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'StringToken',
    span,
    value,
    children,
  };
}
export function WhitespaceToken(span: TextSpan): WhitespaceTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'WhitespaceToken',
    span,
    children,
  };
}
export function PlusToken(span: TextSpan): PlusTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'PlusToken',
    span,
    children,
  };
}
export function MinusToken(span: TextSpan): MinusTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'MinusToken',
    span,
    children,
  };
}
export function StarToken(span: TextSpan): StarTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'StarToken',
    span,
    children,
  };
}
export function SlashToken(span: TextSpan): SlashTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'SlashToken',
    span,
    children,
  };
}
export function PlusEquals(span: TextSpan): PlusEqualsSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'PlusEquals',
    span,
    children,
  };
}
export function MinusEquals(span: TextSpan): MinusEqualsSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'MinusEquals',
    span,
    children,
  };
}
export function PlusPlus(span: TextSpan): PlusPlusSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'PlusPlus',
    span,
    children,
  };
}
export function MinusMinus(span: TextSpan): MinusMinusSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'MinusMinus',
    span,
    children,
  };
}
export function OpenParenthesisToken(span: TextSpan): OpenParenthesisTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'OpenParenthesisToken',
    span,
    children,
  };
}
export function CloseParenthesisToken(span: TextSpan): CloseParenthesisTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'CloseParenthesisToken',
    span,
    children,
  };
}
export function OpenBraceToken(span: TextSpan): OpenBraceTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'OpenBraceToken',
    span,
    children,
  };
}
export function CloseBraceToken(span: TextSpan): CloseBraceTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'CloseBraceToken',
    span,
    children,
  };
}
export function BangToken(span: TextSpan): BangTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'BangToken',
    span,
    children,
  };
}
export function EqualsToken(span: TextSpan): EqualsTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'EqualsToken',
    span,
    children,
  };
}
export function TildeToken(span: TextSpan): TildeTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'TildeToken',
    span,
    children,
  };
}
export function CaretToken(span: TextSpan): CaretTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'CaretToken',
    span,
    children,
  };
}
export function AmpersandToken(span: TextSpan): AmpersandTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'AmpersandToken',
    span,
    children,
  };
}
export function PipeToken(span: TextSpan): PipeTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'PipeToken',
    span,
    children,
  };
}
export function SemicolonToken(span: TextSpan): SemicolonTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'SemicolonToken',
    span,
    children,
  };
}
export function CommaToken(span: TextSpan): CommaTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'CommaToken',
    span,
    children,
  };
}
export function LessToken(span: TextSpan): LessTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'LessToken',
    span,
    children,
  };
}
export function GreaterToken(span: TextSpan): GreaterTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'GreaterToken',
    span,
    children,
  };
}
export function LessOrEqualsToken(span: TextSpan): LessOrEqualsTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'LessOrEqualsToken',
    span,
    children,
  };
}
export function GreaterOrEqualsToken(span: TextSpan): GreaterOrEqualsTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'GreaterOrEqualsToken',
    span,
    children,
  };
}
export function AmpersandAmpersandToken(span: TextSpan): AmpersandAmpersandTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'AmpersandAmpersandToken',
    span,
    children,
  };
}
export function PipePipeToken(span: TextSpan): PipePipeTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'PipePipeToken',
    span,
    children,
  };
}
export function EqualsEqualsToken(span: TextSpan): EqualsEqualsTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'EqualsEqualsToken',
    span,
    children,
  };
}
export function BangEqualsToken(span: TextSpan): BangEqualsTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'BangEqualsToken',
    span,
    children,
  };
}
export function IdentifierToken(span: TextSpan, text: string): IdentifierTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'IdentifierToken',
    span,
    text,
    children,
  };
}
export function NumberLiteral(span: TextSpan, value: number): NumberLiteralSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'NumberLiteral',
    span,
    value,
    children,
  };
}
export function BooleanLiteral(span: TextSpan, value: boolean): BooleanLiteralSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'BooleanLiteral',
    span,
    value,
    children,
  };
}
export function StringLiteral(span: TextSpan, value: string): StringLiteralSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'StringLiteral',
    span,
    value,
    children,
  };
}
export function TrueKeyword(span: TextSpan): TrueKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'TrueKeyword',
    span,
    children,
  };
}
export function FalseKeyword(span: TextSpan): FalseKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'FalseKeyword',
    span,
    children,
  };
}
export function ConstKeyword(span: TextSpan): ConstKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'ConstKeyword',
    span,
    children,
  };
}
export function VarKeyword(span: TextSpan): VarKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'VarKeyword',
    span,
    children,
  };
}
export function IfKeyword(span: TextSpan): IfKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'IfKeyword',
    span,
    children,
  };
}
export function ElseKeyword(span: TextSpan): ElseKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'ElseKeyword',
    span,
    children,
  };
}
export function WhileKeyword(span: TextSpan): WhileKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'WhileKeyword',
    span,
    children,
  };
}
export function ForKeyword(span: TextSpan): ForKeywordSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'ForKeyword',
    span,
    children,
  };
}
export function BadToken(span: TextSpan): BadTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'BadToken',
    span,
    children,
  };
}
export function EndOfFileToken(span: TextSpan): EndOfFileTokenSyntax {
  const children: SyntaxNode[] = [];
  return {
    kind: 'EndOfFileToken',
    span,
    children,
  };
}
