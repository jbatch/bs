import { TokenSyntaxKind } from '../parsing/TokenSyntax';
import { Bool, Int, String, TypeSymbol } from '../symbols/Symbol';
import { BoundNode } from './BoundNode';

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
  syntaxKind: TokenSyntaxKind;
  leftType: TypeSymbol;
  rightType: TypeSymbol;
  type: TypeSymbol;
  children: BoundNode[];
};

function boundBinaryOperator(
  kind: BoundBinaryOperatorKind,
  syntaxKind: TokenSyntaxKind,
  operandType: TypeSymbol,
  type?: TypeSymbol
): BoundBinaryOperator {
  const children: BoundNode[] = [];
  if (type === undefined) {
    return {
      kind,
      syntaxKind,
      leftType: operandType,
      rightType: operandType,
      type: operandType,
      children,
    };
  }
  return {
    kind,
    syntaxKind,
    leftType: operandType,
    rightType: operandType,
    type,
    children,
  };
}

const BINARY_OPERATORS: BoundBinaryOperator[] = [
  boundBinaryOperator('Addition', 'PlusToken', Int),
  boundBinaryOperator('Addition', 'PlusEquals', Int),
  boundBinaryOperator('Addition', 'PlusToken', String),
  boundBinaryOperator('Addition', 'PlusEquals', String),
  boundBinaryOperator('Subtraction', 'MinusToken', Int),
  boundBinaryOperator('Subtraction', 'MinusEquals', Int),
  boundBinaryOperator('Multiplication', 'StarToken', Int),
  boundBinaryOperator('Division', 'SlashToken', Int),
  boundBinaryOperator('BitwiseAnd', 'AmpersandToken', Int),
  boundBinaryOperator('BitwiseOr', 'PipeToken', Int),
  boundBinaryOperator('BitwiseXor', 'CaretToken', Int),
  boundBinaryOperator('LogicalAnd', 'AmpersandAmpersandToken', Bool),
  boundBinaryOperator('LogicalOr', 'PipePipeToken', Bool),
  boundBinaryOperator('Equals', 'EqualsEqualsToken', Int, Bool),
  boundBinaryOperator('NotEquals', 'BangEqualsToken', Int, Bool),
  boundBinaryOperator('Equals', 'EqualsEqualsToken', String, Bool),
  boundBinaryOperator('NotEquals', 'BangEqualsToken', String, Bool),
  boundBinaryOperator('Equals', 'EqualsEqualsToken', Bool, Bool),
  boundBinaryOperator('NotEquals', 'BangEqualsToken', Bool, Bool),
  boundBinaryOperator('LessThan', 'LessToken', Int, Bool),
  boundBinaryOperator('LessThanOrEqual', 'LessOrEqualsToken', Int, Bool),
  boundBinaryOperator('GreaterThan', 'GreaterToken', Int, Bool),
  boundBinaryOperator('GreaterThanOrEqual', 'GreaterOrEqualsToken', Int, Bool),
];

export function bindBinaryOperator(
  syntaxKind: TokenSyntaxKind,
  leftType: TypeSymbol,
  rightType: TypeSymbol
): BoundBinaryOperator | undefined {
  return BINARY_OPERATORS.find(
    (op) =>
      op.syntaxKind === syntaxKind &&
      op.leftType.name === leftType.name &&
      op.rightType.name === rightType.name
  );
}
