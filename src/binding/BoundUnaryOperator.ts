import { TokenSyntaxKind } from '../parsing/TokenSyntax';
import { Bool, Int, TypeSymbol } from '../symbols/Symbol';
import { BoundNode } from './BoundNode';

export type BoundUnaryOperatorKind =
  | 'Identity'
  | 'Negation'
  | 'LogicalNegation'
  | 'OnesCompliment'
  | 'Increment'
  | 'Decrement';

export type BoundUnaryOperator = {
  kind: BoundUnaryOperatorKind;
  syntaxKind: TokenSyntaxKind;
  operandType: TypeSymbol;
  type: TypeSymbol;
  children: BoundNode[];
};

function boundUnaryOperator(
  kind: BoundUnaryOperatorKind,
  syntaxKind: TokenSyntaxKind,
  type: TypeSymbol
): BoundUnaryOperator {
  const children: BoundNode[] = [];
  return { kind, syntaxKind, operandType: type, type, children };
}

const UNARY_OPERATORS: BoundUnaryOperator[] = [
  boundUnaryOperator('Identity', 'PlusToken', Int),
  boundUnaryOperator('Negation', 'MinusToken', Int),
  boundUnaryOperator('LogicalNegation', 'BangToken', Bool),
  boundUnaryOperator('OnesCompliment', 'TildeToken', Int),
  boundUnaryOperator('Increment', 'PlusPlus', Int),
  boundUnaryOperator('Decrement', 'MinusMinus', Int),
];

export function bindUnaryOperator(
  syntaxKind: TokenSyntaxKind,
  operandType: TypeSymbol
): BoundUnaryOperator | undefined {
  return UNARY_OPERATORS.find(
    (op) => op.syntaxKind === syntaxKind && op.operandType === operandType
  );
}
