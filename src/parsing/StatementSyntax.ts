import { TextSpan } from '../text/TextSpan';
import { ExpressionSyntax } from './ExpressionSyntax';
import { SyntaxNode } from './SyntaxNode';
import { TokenSyntax } from './TokenSyntax';

export type StatementSyntax =
  | (
      | {
          kind: 'ExpressionStatement';
          expression: ExpressionSyntax;
          children: SyntaxNode[];
        }
      | {
          kind: 'BlockStatement';
          open: TokenSyntax;
          statements: StatementSyntax[];
          close: TokenSyntax;
          children: SyntaxNode[];
        }
      | {
          kind: 'VariableDeclarationStatement';
          keyword: TokenSyntax;
          identifier: TokenSyntax;
          equals: TokenSyntax;
          expression: ExpressionSyntax;
          children: SyntaxNode[];
        }
      | {
          kind: 'IfStatement';
          ifKeyword: TokenSyntax;
          openParenthesis: TokenSyntax;
          condition: ExpressionSyntax;
          closeParenthesis: TokenSyntax;
          ifBlock: StatementSyntax;
          elseKeyword?: TokenSyntax;
          elseBlock?: StatementSyntax;
          children: SyntaxNode[];
        }
      | {
          kind: 'WhileStatement';
          whileKeyword: TokenSyntax;
          openParenthesis: TokenSyntax;
          condition: ExpressionSyntax;
          closeParenthesis: TokenSyntax;
          whileBlock: StatementSyntax;
          children: SyntaxNode[];
        }
    ) & { span: TextSpan; children: SyntaxNode[] };

export type StatementKind = StatementSyntax['kind'];

export function ExpressionStatement(expression: ExpressionSyntax): StatementSyntax {
  const span = expression.span;
  return {
    kind: 'ExpressionStatement',
    span,
    expression,
    children: [expression],
  };
}

export function BlockStatement(
  open: TokenSyntax,
  statements: StatementSyntax[],
  close: TokenSyntax
): StatementSyntax {
  const span = open.span;
  return {
    kind: 'BlockStatement',
    span,
    open,
    statements,
    close,
    children: [open, ...statements, close],
  };
}

export function VariableDeclarationStatement(
  keyword: TokenSyntax,
  identifier: TokenSyntax,
  equals: TokenSyntax,
  expression: ExpressionSyntax
): StatementSyntax {
  const span = keyword.span;
  return {
    kind: 'VariableDeclarationStatement',
    span,
    keyword,
    identifier,
    equals,
    expression,
    children: [keyword, identifier, equals, expression],
  };
}

export function IfStatement(
  ifKeyword: TokenSyntax,
  openParenthesis: TokenSyntax,
  condition: ExpressionSyntax,
  closeParenthesis: TokenSyntax,
  ifBlock: StatementSyntax,
  elseKeyword?: TokenSyntax,
  elseBlock?: StatementSyntax
): StatementSyntax {
  const span = ifKeyword.span;
  const children = [ifKeyword, openParenthesis, condition, closeParenthesis, ifBlock];
  if (elseKeyword && elseBlock) {
    children.push(elseKeyword);
    children.push(elseBlock);
  }
  return {
    kind: 'IfStatement',
    span,
    ifKeyword,
    openParenthesis,
    condition,
    closeParenthesis,
    ifBlock,
    elseKeyword,
    elseBlock,
    children,
  };
}

export function WhileStatement(
  whileKeyword: TokenSyntax,
  openParenthesis: TokenSyntax,
  condition: ExpressionSyntax,
  closeParenthesis: TokenSyntax,
  whileBlock: StatementSyntax
): StatementSyntax {
  const span = whileKeyword.span;
  const children = [whileKeyword, openParenthesis, condition, closeParenthesis, whileBlock];
  return {
    kind: 'WhileStatement',
    span,
    whileKeyword,
    openParenthesis,
    condition,
    closeParenthesis,
    whileBlock,
    children,
  };
}
