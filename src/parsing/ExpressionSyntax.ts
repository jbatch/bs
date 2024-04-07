import { TextSpan } from '../text/TextSpan.ts';
import { SyntaxNode } from './SyntaxNode.ts';
import {
  BooleanLiteralSyntax,
  IdentifierTokenSyntax,
  NumberLiteralSyntax,
  TokenSyntax,
} from './TokenSyntax.ts';

function isDefined<T>(node: T | undefined): node is T {
  return node !== undefined;
}

// Generated code

export type LiteralExpressionSyntax = {
  kind: 'LiteralExpression';
  span: TextSpan;
  literal: NumberLiteralSyntax | BooleanLiteralSyntax;
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
  identifier: IdentifierTokenSyntax;
  children: SyntaxNode[];
};
export type AssignmentExpressionSyntax = {
  kind: 'AssignmentExpression';
  span: TextSpan;
  identifier: IdentifierTokenSyntax;
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
export function LiteralExpression(
  literal: NumberLiteralSyntax | BooleanLiteralSyntax
): LiteralExpressionSyntax {
  const span = literal.span;
  const children: SyntaxNode[] = [literal].filter(isDefined);
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
  const children: SyntaxNode[] = [left, operator, right];
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
  const children: SyntaxNode[] = [operator, operand];
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
  const children: SyntaxNode[] = [open, expression, close];
  return {
    kind: 'ParenthesizedExpression',
    span,
    open,
    expression,
    close,
    children,
  };
}
export function NameExpression(identifier: IdentifierTokenSyntax): NameExpressionSyntax {
  const span = identifier.span;
  const children: SyntaxNode[] = [identifier];
  return {
    kind: 'NameExpression',
    span,
    identifier,
    children,
  };
}
export function AssignmentExpression(
  identifier: IdentifierTokenSyntax,
  equals: TokenSyntax,
  expression: ExpressionSyntax
): AssignmentExpressionSyntax {
  const span = identifier.span;
  const children: SyntaxNode[] = [identifier, equals, expression];
  return {
    kind: 'AssignmentExpression',
    span,
    identifier,
    equals,
    expression,
    children,
  };
}
