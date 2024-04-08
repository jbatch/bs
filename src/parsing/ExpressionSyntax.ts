import { TextSpan } from '../text/TextSpan';
import { SyntaxNode } from './SyntaxNode';
import {
  BooleanLiteralSyntax,
  IdentifierTokenSyntax,
  NumberLiteralSyntax,
  StringLiteralSyntax,
  TokenSyntax,
} from './TokenSyntax';

function isDefined<T>(node: T | undefined): node is T {
  return node !== undefined;
}

// Generated code

export type LiteralExpressionSyntax = {
  kind: 'LiteralExpression';
  span: TextSpan;
  literal: NumberLiteralSyntax | BooleanLiteralSyntax | StringLiteralSyntax;
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
export type OperatorAssignmentExpressionSyntax = {
  kind: 'OperatorAssignmentExpression';
  span: TextSpan;
  identifier: IdentifierTokenSyntax;
  operator: TokenSyntax;
  expression: ExpressionSyntax;
  children: SyntaxNode[];
};
export type PostfixUnaryExpressionSyntax = {
  kind: 'PostfixUnaryExpression';
  span: TextSpan;
  identifier: IdentifierTokenSyntax;
  operator: TokenSyntax;
  children: SyntaxNode[];
};
export type CallExpressionSyntax = {
  kind: 'CallExpression';
  span: TextSpan;
  identifier: IdentifierTokenSyntax;
  open: TokenSyntax;
  args: (ExpressionSyntax | TokenSyntax)[];
  close: TokenSyntax;
  children: SyntaxNode[];
};
export type ExpressionSyntax =
  | LiteralExpressionSyntax
  | BinaryExpressionSyntax
  | UnaryExpressionSyntax
  | ParenthesizedExpressionSyntax
  | NameExpressionSyntax
  | AssignmentExpressionSyntax
  | OperatorAssignmentExpressionSyntax
  | PostfixUnaryExpressionSyntax
  | CallExpressionSyntax;
export function LiteralExpression(
  literal: NumberLiteralSyntax | BooleanLiteralSyntax | StringLiteralSyntax
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
export function OperatorAssignmentExpression(
  identifier: IdentifierTokenSyntax,
  operator: TokenSyntax,
  expression: ExpressionSyntax
): OperatorAssignmentExpressionSyntax {
  const span = identifier.span;
  const children: SyntaxNode[] = [identifier, operator, expression];
  return {
    kind: 'OperatorAssignmentExpression',
    span,
    identifier,
    operator,
    expression,
    children,
  };
}
export function PostfixUnaryExpression(
  identifier: IdentifierTokenSyntax,
  operator: TokenSyntax
): PostfixUnaryExpressionSyntax {
  const span = identifier.span;
  const children: SyntaxNode[] = [identifier, operator];
  return {
    kind: 'PostfixUnaryExpression',
    span,
    identifier,
    operator,
    children,
  };
}
export function CallExpression(
  identifier: IdentifierTokenSyntax,
  open: TokenSyntax,
  args: (ExpressionSyntax | TokenSyntax)[],
  close: TokenSyntax
): CallExpressionSyntax {
  const span = identifier.span;
  const children: SyntaxNode[] = [identifier, open, ...args, close];
  return {
    kind: 'CallExpression',
    span,
    identifier,
    open,
    args,
    close,
    children,
  };
}
