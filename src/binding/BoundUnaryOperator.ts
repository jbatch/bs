import { SyntaxKind } from '../parsing/SyntaxNode.ts';
import { Type } from './BoundExpression.ts';
import { BoundNode } from './BoundNode.ts';

export type BoundUnaryOperatorKind = 'Identity' | 'Negation' | 'LogicalNegation' | 'OnesCompliment';

export type BoundUnaryOperator = {
  kind: BoundUnaryOperatorKind;
  syntaxKind: SyntaxKind;
  operandType: Type;
  type: Type;
  children: BoundNode[];
};

function boundUnaryOperator(
  kind: BoundUnaryOperatorKind,
  syntaxKind: SyntaxKind,
  type: Type
): BoundUnaryOperator {
  const children: BoundNode[] = [];
  return { kind, syntaxKind, operandType: type, type, children };
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
