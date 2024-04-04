import { EvaluationResult } from '../evaluation/EvaluationResult';
import { BoundBinaryOperator, BoundUnaryOperator } from './BoundOperator';

export type Type = 'number' | 'boolean';

// Expressions

export type BoundExpression =
  | {
      kind: 'UnaryExpression';
      type: Type;
      operand: BoundExpression;
      operator: BoundUnaryOperator;
    }
  | {
      kind: 'BinaryExpression';
      type: Type;
      left: BoundExpression;
      operator: BoundBinaryOperator;
      right: BoundExpression;
    }
  | {
      kind: 'LiteralExpression';
      type: Type;
      value: EvaluationResult;
    }
  | {
      kind: 'VariableExpression';
      type: Type;
      name: string;
    }
  | {
      kind: 'AssignmentExpression';
      type: Type;
      name: string;
      expression: BoundExpression;
    };

export function BoundUnaryExpression(
  type: Type,
  operator: BoundUnaryOperator,
  operand: BoundExpression
): BoundExpression {
  return {
    kind: 'UnaryExpression',
    type,
    operand,
    operator,
  };
}

export function BoundBinaryExpression(
  type: Type,
  left: BoundExpression,
  operator: BoundBinaryOperator,
  right: BoundExpression
): BoundExpression {
  return {
    kind: 'BinaryExpression',
    type,
    left,
    operator,
    right,
  };
}

export function BoundLiteralExpression(type: Type, value: EvaluationResult): BoundExpression {
  return {
    kind: 'LiteralExpression',
    type,
    value,
  };
}

export function BoundVariableExpression(type: Type, name: string): BoundExpression {
  return {
    kind: 'VariableExpression',
    type,
    name,
  };
}

export function BoundAssignmentExpression(
  type: Type,
  name: string,
  expression: BoundExpression
): BoundExpression {
  return {
    kind: 'AssignmentExpression',
    type,
    name,
    expression,
  };
}
