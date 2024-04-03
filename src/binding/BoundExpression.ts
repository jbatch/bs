import { EvaluationResult } from '../evaluation/EvaluationResult';
import { SyntaxKind } from '../parsing/SyntaxNode';

export type BoundUnaryOperatorKind = 'Identity' | 'Negation' | 'LogicalNegation';

export type BoundBinaryOperatorKind =
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'LogicalAnd'
  | 'LogicalOr'
  | 'Equals'
  | 'NotEquals'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'GreaterThan'
  | 'GreaterThanOrEqual';

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

type BoundBinaryOperator = {
  kind: BoundBinaryOperatorKind;
  syntaxKind: SyntaxKind;
  leftType: Type;
  rightType: Type;
  type: Type;
};

function boundBinaryOperator(
  kind: BoundBinaryOperatorKind,
  syntaxKind: SyntaxKind,
  operandType: Type,
  type?: Type
): BoundBinaryOperator {
  if (type === undefined) {
    return {
      kind,
      syntaxKind,
      leftType: operandType,
      rightType: operandType,
      type: operandType,
    };
  }
  return {
    kind,
    syntaxKind,
    leftType: operandType,
    rightType: operandType,
    type,
  };
}

const BINARY_OPERATORS: BoundBinaryOperator[] = [
  boundBinaryOperator('Addition', 'PlusToken', 'number'),
  boundBinaryOperator('Subtraction', 'MinusToken', 'number'),
  boundBinaryOperator('Multiplication', 'StarToken', 'number'),
  boundBinaryOperator('LogicalAnd', 'AmpersandAmpersandToken', 'boolean'),
  boundBinaryOperator('LogicalOr', 'PipePipeToken', 'boolean'),
  boundBinaryOperator('Equals', 'EqualsEqualsToken', 'number', 'boolean'),
  boundBinaryOperator('NotEquals', 'BangEqualsToken', 'number', 'boolean'),
  boundBinaryOperator('Equals', 'EqualsEqualsToken', 'boolean', 'boolean'),
  boundBinaryOperator('NotEquals', 'BangEqualsToken', 'boolean', 'boolean'),
  boundBinaryOperator('LessThan', 'LessToken', 'number', 'boolean'),
  boundBinaryOperator('LessThanOrEqual', 'LessOrEqualsToken', 'number', 'boolean'),
  boundBinaryOperator('GreaterThan', 'GreaterToken', 'number', 'boolean'),
  boundBinaryOperator('GreaterThanOrEqual', 'GreaterOrEqualsToken', 'number', 'boolean'),
];

export function bindBinaryOperator(
  syntaxKind: SyntaxKind,
  leftType: Type,
  rightType: Type
): BoundBinaryOperator | undefined {
  return BINARY_OPERATORS.find(
    (op) => op.syntaxKind === syntaxKind && op.leftType === leftType && op.rightType === rightType
  );
}

type BoundUnaryOperator = {
  kind: BoundUnaryOperatorKind;
  syntaxKind: SyntaxKind;
  operandType: Type;
  type: Type;
};

function boundUnaryOperator(
  kind: BoundUnaryOperatorKind,
  syntaxKind: SyntaxKind,
  type: Type
): BoundUnaryOperator {
  return { kind, syntaxKind, operandType: type, type };
}

const UNARY_OPERATORS: BoundUnaryOperator[] = [
  boundUnaryOperator('Identity', 'PlusToken', 'number'),
  boundUnaryOperator('Negation', 'MinusToken', 'number'),
  boundUnaryOperator('LogicalNegation', 'BangToken', 'boolean'),
];

export function bindUnaryOperator(
  syntaxKind: SyntaxKind,
  operandType: Type
): BoundUnaryOperator | undefined {
  return UNARY_OPERATORS.find(
    (op) => op.syntaxKind === syntaxKind && op.operandType === operandType
  );
}
