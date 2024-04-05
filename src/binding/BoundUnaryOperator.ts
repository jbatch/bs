import { SyntaxKind } from '../parsing/SyntaxNode';
import { Type } from './BoundExpression';

export type BoundUnaryOperatorKind = 'Identity' | 'Negation' | 'LogicalNegation' | 'OnesCompliment';

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
