import { TextSpan } from '../text/TextSpan';
import { SyntaxNode } from './SyntaxNode';
import { TokenSyntax } from './TokenSyntax';

// Generated code

export type LiteralExpressionSyntax = {
  kind: 'LiteralExpression';
  span: TextSpan;
  literal: TokenSyntax;
  children: SyntaxNode[];
};
export type BinaryExpressionSyntax = {
  kind: 'BinaryExpression';
  span: TextSpan;
  left: ExpressionSyntax;
  operator: TokenSyntax;
  right: ExpressionSyntax;
  children: SyntaxNode[];
};
export type UnaryExpressionSyntax = {
  kind: 'UnaryExpression';
  span: TextSpan;
  operator: TokenSyntax;
  operand: ExpressionSyntax;
  children: SyntaxNode[];
};
export type ParenthesizedExpressionSyntax = {
  kind: 'ParenthesizedExpression';
  span: TextSpan;
  open: TokenSyntax;
  expression: ExpressionSyntax;
  close: TokenSyntax;
  children: SyntaxNode[];
};
export type NameExpressionSyntax = {
  kind: 'NameExpression';
  span: TextSpan;
  identifier: TokenSyntax;
  children: SyntaxNode[];
};
export type AssignmentExpressionSyntax = {
  kind: 'AssignmentExpression';
  span: TextSpan;
  identifier: TokenSyntax;
  equals: TokenSyntax;
  expression: ExpressionSyntax;
  children: SyntaxNode[];
};
export type ExpressionSyntax =
  | LiteralExpressionSyntax
  | BinaryExpressionSyntax
  | UnaryExpressionSyntax
  | ParenthesizedExpressionSyntax
  | NameExpressionSyntax
  | AssignmentExpressionSyntax;
export function LiteralExpression(literal: TokenSyntax): LiteralExpressionSyntax {
  const span = literal.span;
  const children = [literal];
  return {
    kind: 'LiteralExpression',
    span,
    literal,
    children,
  };
}
export function BinaryExpression(
  left: ExpressionSyntax,
  operator: TokenSyntax,
  right: ExpressionSyntax
): BinaryExpressionSyntax {
  const span = left.span;
  const children = [left, operator, right];
  return {
    kind: 'BinaryExpression',
    span,
    left,
    operator,
    right,
    children,
  };
}
export function UnaryExpression(
  operator: TokenSyntax,
  operand: ExpressionSyntax
): UnaryExpressionSyntax {
  const span = operator.span;
  const children = [operator, operand];
  return {
    kind: 'UnaryExpression',
    span,
    operator,
    operand,
    children,
  };
}
export function ParenthesizedExpression(
  open: TokenSyntax,
  expression: ExpressionSyntax,
  close: TokenSyntax
): ParenthesizedExpressionSyntax {
  const span = open.span;
  const children = [open, expression, close];
  return {
    kind: 'ParenthesizedExpression',
    span,
    open,
    expression,
    close,
    children,
  };
}
export function NameExpression(identifier: TokenSyntax): NameExpressionSyntax {
  const span = identifier.span;
  const children = [identifier];
  return {
    kind: 'NameExpression',
    span,
    identifier,
    children,
  };
}
export function AssignmentExpression(
  identifier: TokenSyntax,
  equals: TokenSyntax,
  expression: ExpressionSyntax
): AssignmentExpressionSyntax {
  const span = identifier.span;
  const children = [identifier, equals, expression];
  return {
    kind: 'AssignmentExpression',
    span,
    identifier,
    equals,
    expression,
    children,
  };
}
