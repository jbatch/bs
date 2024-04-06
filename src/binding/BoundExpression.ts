import { EvaluationResult } from '../evaluation/EvaluationResult';
import { BoundBinaryOperator } from './BoundBinaryOperator';
import { BoundNode } from './BoundNode';
import { BoundUnaryOperator } from './BoundUnaryOperator';

export type Type = 'number' | 'boolean';

// Generated code

export type UnaryExpression = {
  kind: 'UnaryExpression';
  type: Type;
  operand: BoundExpression;
  operator: BoundUnaryOperator;
  children: BoundNode[];
};
export type BinaryExpression = {
  kind: 'BinaryExpression';
  type: Type;
  left: BoundExpression;
  operator: BoundBinaryOperator;
  right: BoundExpression;
  children: BoundNode[];
};
export type LiteralExpression = {
  kind: 'LiteralExpression';
  type: Type;
  value: EvaluationResult;
  children: BoundNode[];
};
export type VariableExpression = {
  kind: 'VariableExpression';
  type: Type;
  name: string;
  children: BoundNode[];
};
export type AssignmentExpression = {
  kind: 'AssignmentExpression';
  type: Type;
  name: string;
  expression: BoundExpression;
  children: BoundNode[];
};
export type BoundExpression =
  | UnaryExpression
  | BinaryExpression
  | LiteralExpression
  | VariableExpression
  | AssignmentExpression;
export function BoundUnaryExpression(
  type: Type,
  operand: BoundExpression,
  operator: BoundUnaryOperator
): UnaryExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'UnaryExpression',
    type,
    operand,
    operator,
    children,
  };
}
export function BoundBinaryExpression(
  type: Type,
  left: BoundExpression,
  operator: BoundBinaryOperator,
  right: BoundExpression
): BinaryExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'BinaryExpression',
    type,
    left,
    operator,
    right,
    children,
  };
}
export function BoundLiteralExpression(type: Type, value: EvaluationResult): LiteralExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'LiteralExpression',
    type,
    value,
    children,
  };
}
export function BoundVariableExpression(type: Type, name: string): VariableExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'VariableExpression',
    type,
    name,
    children,
  };
}
export function BoundAssignmentExpression(
  type: Type,
  name: string,
  expression: BoundExpression
): AssignmentExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'AssignmentExpression',
    type,
    name,
    expression,
    children,
  };
}
