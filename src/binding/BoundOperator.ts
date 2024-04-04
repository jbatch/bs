import { SyntaxKind } from '../parsing/SyntaxNode';
import { Type } from './BoundExpression';

export type BoundUnaryOperatorKind = 'Identity' | 'Negation' | 'LogicalNegation' | 'OnesCompliment';

export type BoundBinaryOperatorKind =
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'BitwiseAnd'
  | 'BitwiseOr'
  | 'BitwiseXor'
  | 'LogicalAnd'
  | 'LogicalOr'
  | 'Equals'
  | 'NotEquals'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'GreaterThan'
  | 'GreaterThanOrEqual';

export type BoundBinaryOperator = {
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
  boundBinaryOperator('Division', 'SlashToken', 'number'),
  boundBinaryOperator('BitwiseAnd', 'AmpersandToken', 'number'),
  boundBinaryOperator('BitwiseOr', 'PipeToken', 'number'),
  boundBinaryOperator('BitwiseXor', 'CaretToken', 'number'),
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

export type BoundUnaryOperator = {
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
  boundUnaryOperator('OnesCompliment', 'TildeToken', 'number'),
];

export function bindUnaryOperator(
  syntaxKind: SyntaxKind,
  operandType: Type
): BoundUnaryOperator | undefined {
  return UNARY_OPERATORS.find(
    (op) => op.syntaxKind === syntaxKind && op.operandType === operandType
  );
}