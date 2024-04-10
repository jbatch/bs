import { EvaluationResult } from '../evaluation/EvaluationResult';
import { FunctionSymbol, TypeSymbol, VariableSymbol } from '../symbols/Symbol';
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
  variable: VariableSymbol;
  children: BoundNode[];
};
export type AssignmentExpression = {
  kind: 'AssignmentExpression';
  type: TypeSymbol;
  variable: VariableSymbol;
  expression: BoundExpression;
  children: BoundNode[];
};
export type OperatorAssignmentExpression = {
  kind: 'OperatorAssignmentExpression';
  type: TypeSymbol;
  variable: VariableSymbol;
  operator: BoundBinaryOperator;
  expression: BoundExpression;
  children: BoundNode[];
};
export type PostfixUnaryExpression = {
  kind: 'PostfixUnaryExpression';
  type: TypeSymbol;
  variable: VariableSymbol;
  operator: BoundUnaryOperator;
  children: BoundNode[];
};
export type CallExpression = {
  kind: 'CallExpression';
  functionSymbol: FunctionSymbol;
  type: TypeSymbol;
  args: BoundExpression[];
  children: BoundNode[];
};
export type TypeCastExpression = {
  kind: 'TypeCastExpression';
  type: TypeSymbol;
  expression: BoundExpression;
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
  | CallExpression
  | TypeCastExpression
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
export function BoundVariableExpression(
  type: TypeSymbol,
  variable: VariableSymbol
): VariableExpression {
  const children: BoundNode[] = [];
  return {
    kind: 'VariableExpression',
    type,
    variable,
    children,
  };
}
export function BoundAssignmentExpression(
  type: TypeSymbol,
  variable: VariableSymbol,
  expression: BoundExpression
): AssignmentExpression {
  const children: BoundNode[] = [expression];
  return {
    kind: 'AssignmentExpression',
    type,
    variable,
    expression,
    children,
  };
}
export function BoundOperatorAssignmentExpression(
  type: TypeSymbol,
  variable: VariableSymbol,
  operator: BoundBinaryOperator,
  expression: BoundExpression
): OperatorAssignmentExpression {
  const children: BoundNode[] = [operator, expression];
  return {
    kind: 'OperatorAssignmentExpression',
    type,
    variable,
    operator,
    expression,
    children,
  };
}
export function BoundPostfixUnaryExpression(
  type: TypeSymbol,
  variable: VariableSymbol,
  operator: BoundUnaryOperator
): PostfixUnaryExpression {
  const children: BoundNode[] = [operator];
  return {
    kind: 'PostfixUnaryExpression',
    type,
    variable,
    operator,
    children,
  };
}
export function BoundCallExpression(
  functionSymbol: FunctionSymbol,
  type: TypeSymbol,
  args: BoundExpression[]
): CallExpression {
  const children: BoundNode[] = [...args];
  return {
    kind: 'CallExpression',
    functionSymbol,
    type,
    args,
    children,
  };
}
export function BoundTypeCastExpression(
  type: TypeSymbol,
  expression: BoundExpression
): TypeCastExpression {
  const children: BoundNode[] = [expression];
  return {
    kind: 'TypeCastExpression',
    type,
    expression,
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
