import { EvaluationResult } from './EvaluationResult';

export type BoundUnaryOperatorKind = 'Identity' | 'Negation' | 'LogicalNegation';

export type BoundBinaryOperatorKind =
  | 'Addition'
  | 'Subtraction'
  | 'Multiplication'
  | 'Division'
  | 'LogicalAnd'
  | 'LogicalOr';

export type Type = 'number' | 'boolean';

export type BoundExpression =
  | {
      kind: 'UnaryExpression';
      type: Type;
      operand: BoundExpression;
      operatorKind: BoundUnaryOperatorKind;
    }
  | {
      kind: 'BinaryExpression';
      type: Type;
      left: BoundExpression;
      operatorKind: BoundBinaryOperatorKind;
      right: BoundExpression;
    }
  | {
      kind: 'LiteralExpression';
      type: Type;
      value: EvaluationResult;
    };
