import {
  ConstKeyword,
  ElseKeyword,
  FalseKeyword,
  ForKeyword,
  IdentifierToken,
  IfKeyword,
  TokenSyntax,
  TrueKeyword,
  VarKeyword,
  WhileKeyword,
} from './TokenSyntax';
import { textSpan } from '../text/TextSpan';
import { SyntaxKind } from './SyntaxNode';

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
    case 'LessToken':
    case 'LessOrEqualsToken':
    case 'GreaterToken':
    case 'GreaterOrEqualsToken':
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

export function getKeywordOrIdentifier(text: string, position: number): TokenSyntax {
  const span = textSpan(position, text.length);
  switch (text) {
    case 'true':
      return TrueKeyword(span);
    case 'false':
      return FalseKeyword(span);
    case 'const':
      return ConstKeyword(span);
    case 'var':
      return VarKeyword(span);
    case 'if':
      return IfKeyword(span);
    case 'else':
      return ElseKeyword(span);
    case 'while':
      return WhileKeyword(span);
    case 'for':
      return ForKeyword(span);
    default:
      return IdentifierToken(span, text);
  }
}
