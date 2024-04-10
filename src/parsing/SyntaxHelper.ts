import { textSpan } from '../text/TextSpan';
import { SyntaxKind } from './SyntaxNode';
import {
  ConstKeyword,
  ElseKeyword,
  FalseKeyword,
  ForKeyword,
  FunctionKeyword,
  IdentifierToken,
  IfKeyword,
  TokenSyntax,
  TrueKeyword,
  VarKeyword,
  WhileKeyword,
} from './TokenSyntax';

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
    case 'AmpersandToken':
      return 2;
    case 'PipePipeToken':
    case 'PipeToken':
    case 'CaretToken':
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
    case 'TildeToken':
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
    case 'function':
      return FunctionKeyword(span);
    default:
      return IdentifierToken(span, text);
  }
}

export function getTokenText(token: TokenSyntax): string {
  switch (token.kind) {
    case 'NumberToken':
      return '';
    case 'WhitespaceToken':
      return ' ';
    case 'PlusToken':
      return '+';
    case 'MinusToken':
      return '-';
    case 'StarToken':
      return '*';
    case 'SlashToken':
      return '/';
    case 'OpenParenthesisToken':
      return '(';
    case 'CloseParenthesisToken':
      return ')';
    case 'OpenBraceToken':
      return '{';
    case 'CloseBraceToken':
      return '}';
    case 'BangToken':
      return '!';
    case 'EqualsToken':
      return '=';
    case 'TildeToken':
      return '~';
    case 'CaretToken':
      return '^';
    case 'AmpersandToken':
      return '&';
    case 'PipeToken':
      return '|';
    case 'ColonToken':
      return ':';
    case 'SemicolonToken':
      return ';';
    case 'CommaToken':
      return ',';
    case 'LessToken':
      return '<';
    case 'GreaterToken':
      return '>';
    case 'LessOrEqualsToken':
      return '<=';
    case 'GreaterOrEqualsToken':
      return '>=';
    case 'AmpersandAmpersandToken':
      return '&&';
    case 'PipePipeToken':
      return '||';
    case 'EqualsEqualsToken':
      return '==';
    case 'BangEqualsToken':
      return '!=';
    case 'IdentifierToken':
      return '';
    case 'TrueKeyword':
      return 'true';
    case 'FalseKeyword':
      return 'false';
    case 'ConstKeyword':
      return 'const';
    case 'VarKeyword':
      return 'var';
    case 'IfKeyword':
      return 'if';
    case 'ElseKeyword':
      return 'else';
    case 'WhileKeyword':
      return 'while';
    case 'ForKeyword':
      return 'for';
    case 'BadToken':
      return '\0';
    case 'EndOfFileToken':
      return '\0';
    case 'StringToken':
    case 'PlusEquals':
      return '+=';
    case 'MinusEquals':
      return '-=';
    case 'PlusPlus':
      return '++';
    case 'MinusMinus':
      return '--';
    default:
      return '';
  }
}
