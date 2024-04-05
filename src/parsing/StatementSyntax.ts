import { TextSpan } from '../text/TextSpan';
import { ExpressionSyntax } from './ExpressionSyntax';
import { SyntaxNode } from './SyntaxNode';
import { IdentifierTokenSyntax, TokenSyntax } from './TokenSyntax';

function isDefined<T>(node: T | undefined): node is T {
  return node !== undefined;
}

export type StatementKind = StatementSyntax['kind'];

// Generated code

export type ExpressionStatementSyntax = {
  kind: 'ExpressionStatement';
  span: TextSpan;
  expression: ExpressionSyntax;
  children: SyntaxNode[];
};
export type BlockStatementSyntax = {
  kind: 'BlockStatement';
  span: TextSpan;
  open: TokenSyntax;
  statements: StatementSyntax[];
  close: TokenSyntax;
  children: SyntaxNode[];
};
export type VariableDeclarationStatementSyntax = {
  kind: 'VariableDeclarationStatement';
  span: TextSpan;
  keyword: TokenSyntax;
  identifier: IdentifierTokenSyntax;
  equals: TokenSyntax;
  expression: ExpressionSyntax;
  children: SyntaxNode[];
};
export type IfStatementSyntax = {
  kind: 'IfStatement';
  span: TextSpan;
  ifKeyword: TokenSyntax;
  openParenthesis: TokenSyntax;
  condition: ExpressionSyntax;
  closeParenthesis: TokenSyntax;
  ifBlock: StatementSyntax;
  elseKeyword: TokenSyntax | undefined;
  elseBlock: StatementSyntax | undefined;
  children: SyntaxNode[];
};
export type WhileStatementSyntax = {
  kind: 'WhileStatement';
  span: TextSpan;
  whileKeyword: TokenSyntax;
  openParenthesis: TokenSyntax;
  loopCondition: ExpressionSyntax;
  closeParenthesis: TokenSyntax;
  whileBlock: StatementSyntax;
  children: SyntaxNode[];
};
export type ForStatementSyntax = {
  kind: 'ForStatement';
  span: TextSpan;
  forKeyword: TokenSyntax;
  openParenthesis: TokenSyntax;
  beginStatement: StatementSyntax;
  loopCondition: ExpressionSyntax;
  endStatement: StatementSyntax;
  closeParenthesis: TokenSyntax;
  forBlock: StatementSyntax;
  children: SyntaxNode[];
};
export type StatementSyntax =
  | ExpressionStatementSyntax
  | BlockStatementSyntax
  | VariableDeclarationStatementSyntax
  | IfStatementSyntax
  | WhileStatementSyntax
  | ForStatementSyntax;
export function ExpressionStatement(expression: ExpressionSyntax): ExpressionStatementSyntax {
  const span = expression.span;
  const children: SyntaxNode[] = [expression];
  return {
    kind: 'ExpressionStatement',
    span,
    expression,
    children,
  };
}
export function BlockStatement(
  open: TokenSyntax,
  statements: StatementSyntax[],
  close: TokenSyntax
): BlockStatementSyntax {
  const span = open.span;
  const children: SyntaxNode[] = [open, ...statements, close];
  return {
    kind: 'BlockStatement',
    span,
    open,
    statements,
    close,
    children,
  };
}
export function VariableDeclarationStatement(
  keyword: TokenSyntax,
  identifier: IdentifierTokenSyntax,
  equals: TokenSyntax,
  expression: ExpressionSyntax
): VariableDeclarationStatementSyntax {
  const span = keyword.span;
  const children: SyntaxNode[] = [keyword, identifier, equals, expression];
  return {
    kind: 'VariableDeclarationStatement',
    span,
    keyword,
    identifier,
    equals,
    expression,
    children,
  };
}
export function IfStatement(
  ifKeyword: TokenSyntax,
  openParenthesis: TokenSyntax,
  condition: ExpressionSyntax,
  closeParenthesis: TokenSyntax,
  ifBlock: StatementSyntax,
  elseKeyword: TokenSyntax | undefined,
  elseBlock: StatementSyntax | undefined
): IfStatementSyntax {
  const span = ifKeyword.span;
  const children: SyntaxNode[] = [
    ifKeyword,
    openParenthesis,
    condition,
    closeParenthesis,
    ifBlock,
    elseKeyword,
    elseBlock,
  ].filter(isDefined);
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
  loopCondition: ExpressionSyntax,
  closeParenthesis: TokenSyntax,
  whileBlock: StatementSyntax
): WhileStatementSyntax {
  const span = whileKeyword.span;
  const children: SyntaxNode[] = [
    whileKeyword,
    openParenthesis,
    loopCondition,
    closeParenthesis,
    whileBlock,
  ];
  return {
    kind: 'WhileStatement',
    span,
    whileKeyword,
    openParenthesis,
    loopCondition,
    closeParenthesis,
    whileBlock,
    children,
  };
}
export function ForStatement(
  forKeyword: TokenSyntax,
  openParenthesis: TokenSyntax,
  beginStatement: StatementSyntax,
  loopCondition: ExpressionSyntax,
  endStatement: StatementSyntax,
  closeParenthesis: TokenSyntax,
  forBlock: StatementSyntax
): ForStatementSyntax {
  const span = forKeyword.span;
  const children: SyntaxNode[] = [
    forKeyword,
    openParenthesis,
    beginStatement,
    loopCondition,
    endStatement,
    closeParenthesis,
    forBlock,
  ];
  return {
    kind: 'ForStatement',
    span,
    forKeyword,
    openParenthesis,
    beginStatement,
    loopCondition,
    endStatement,
    closeParenthesis,
    forBlock,
    children,
  };
}
