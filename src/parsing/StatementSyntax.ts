import { ExpressionSyntax } from './ExpressionSyntax';
import { SyntaxNode } from './SyntaxNode';
import { TokenSyntax } from './TokenSyntax';

export type StatementSyntax =
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
      condition: ExpressionSyntax;
      ifStatement: StatementSyntax;
      elseKeyword?: TokenSyntax;
      elseStatement?: StatementSyntax;
      children: SyntaxNode[];
    };

export function ExpressionStatement(expression: ExpressionSyntax): StatementSyntax {
  return {
    kind: 'ExpressionStatement',
    expression,
    children: [expression],
  };
}

export function BlockStatement(
  open: TokenSyntax,
  statements: StatementSyntax[],
  close: TokenSyntax
): StatementSyntax {
  return {
    kind: 'BlockStatement',
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
  return {
    kind: 'VariableDeclarationStatement',
    keyword,
    identifier,
    equals,
    expression,
    children: [keyword, identifier, equals, expression],
  };
}

export function IfStatement(
  ifKeyword: TokenSyntax,
  condition: ExpressionSyntax,
  ifStatement: StatementSyntax,
  elseKeyword?: TokenSyntax,
  elseStatement?: StatementSyntax
): StatementSyntax {
  const children = [ifKeyword, condition, ifStatement];
  if (elseKeyword && elseStatement) {
    children.push(elseKeyword);
    children.push(elseStatement);
  }
  return {
    kind: 'IfStatement',
    ifKeyword,
    condition,
    ifStatement,
    elseKeyword,
    elseStatement,
    children,
  };
}
