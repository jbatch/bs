import { EvaluationResult } from './EvaluationResult';
import { SyntaxKind } from './SyntaxToken';

export type BoundUnaryOperatorKind = 'Identity' | 'Negation' | 'LogicalNegation';

export type BoundBinaryOperatorKind =
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'LogicalAnd'
  | 'LogicalOr'
  | 'Equals'
  | 'NotEquals';

export type Type = 'number' | 'boolean';

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
