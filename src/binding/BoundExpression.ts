import assert from 'assert';
import { EvaluationResult } from '../evaluation/EvaluationResult';
import { Err, TypeSymbol } from '../symbols/Symbol';
import { BoundBinaryOperator } from './BoundBinaryOperator';
import { BoundNode } from './BoundNode';
import { BoundUnaryOperator } from './BoundUnaryOperator';

// export type Type = 'number' | 'boolean' | 'string';

// Generated code

export type UnaryExpression = {
  kind: 'UnaryExpression';
  type: TypeSymbol;
  operand: BoundExpression;
  operator: BoundUnaryOperator;
  children: BoundNode[];
};
export type BinaryExpression = {
  kind: 'BinaryExpression';
  type: TypeSymbol;
  left: BoundExpression;
  operator: BoundBinaryOperator;
  right: BoundExpression;
  children: BoundNode[];
};
export type LiteralExpression = {
  kind: 'LiteralExpression';
  type: TypeSymbol;
  value: EvaluationResult;
  children: BoundNode[];
};
export type VariableExpression = {
  kind: 'VariableExpression';
  type: TypeSymbol;
  name: string;
  children: BoundNode[];
};
export type AssignmentExpression = {
  kind: 'AssignmentExpression';
  type: TypeSymbol;
  name: string;
  expression: BoundExpression;
  children: BoundNode[];
};
export type OperatorAssignmentExpression = {
  kind: 'OperatorAssignmentExpression';
  type: TypeSymbol;
  name: string;
  operator: BoundBinaryOperator;
  expression: BoundExpression;
  children: BoundNode[];
};
export type PostfixUnaryExpression = {
  kind: 'PostfixUnaryExpression';
  type: TypeSymbol;
  name: string;
  operator: BoundUnaryOperator;
  children: BoundNode[];
};
export type ErrorExpression = {
  kind: 'ErrorExpression';
  type: TypeSymbol;
  children: BoundNode[];
};
export type BoundExpression =
  | UnaryExpression
  | BinaryExpression
  | LiteralExpression
  | VariableExpression
  | AssignmentExpression
  | OperatorAssignmentExpression
  | PostfixUnaryExpression
  | ErrorExpression;
export function BoundUnaryExpression(
  type: TypeSymbol,
  operand: BoundExpression,
  operator: BoundUnaryOperator
): UnaryExpression {
  const children: BoundNode[] = [operand, operator];
  return {
    kind: 'UnaryExpression',
    type,
    operand,
    operator,
    children,
  };
}
export function BoundBinaryExpression(
  type: TypeSymbol,
  left: BoundExpression,
  operator: BoundBinaryOperator,
  right: BoundExpression
): BinaryExpression {
  const children: BoundNode[] = [left, operator, right];
  return {
    kind: 'BinaryExpression',
    type,
    left,
    operator,
    right,
    children,
  };
}
export function BoundLiteralExpression(
  type: TypeSymbol,
  value: EvaluationResult
): LiteralExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'LiteralExpression',
    type,
    value,
    children,
  };
}
export function BoundVariableExpression(type: TypeSymbol, name: string): VariableExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'VariableExpression',
    type,
    name,
    children,
  };
}
export function BoundAssignmentExpression(
  type: TypeSymbol,
  name: string,
  expression: BoundExpression
): AssignmentExpression {
  const children: BoundNode[] = [expression];
  return {
    kind: 'AssignmentExpression',
    type,
    name,
    expression,
    children,
  };
}
export function BoundOperatorAssignmentExpression(
  type: TypeSymbol,
  name: string,
  operator: BoundBinaryOperator,
  expression: BoundExpression
): OperatorAssignmentExpression {
  const children: BoundNode[] = [operator, expression];
  return {
    kind: 'OperatorAssignmentExpression',
    type,
    name,
    operator,
    expression,
    children,
  };
}
export function BoundPostfixUnaryExpression(
  type: TypeSymbol,
  name: string,
  operator: BoundUnaryOperator
): PostfixUnaryExpression {
  const children: BoundNode[] = [operator];
  return {
    kind: 'PostfixUnaryExpression',
    type,
    name,
    operator,
    children,
  };
}
export function BoundErrorExpression(type: TypeSymbol): ErrorExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'ErrorExpression',
    type,
    children,
  };
}
