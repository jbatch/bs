import { VariableSymbol } from '../text/VariableSymbol';
import { BoundExpression } from './BoundExpression';

export type BoundStatement =
  | {
      kind: 'ExpressionStatement';
      expression: BoundExpression;
    }
  | {
      kind: 'BlockStatement';
      statements: BoundStatement[];
    }
  | {
      kind: 'VariableDelcarationStatement';
      variable: VariableSymbol;
      expression: BoundExpression;
    };

export function BoundExpressionStatement(expression: BoundExpression): BoundStatement {
  return {
    kind: 'ExpressionStatement',
    expression,
  };
}

export function BoundBlockStatement(statements: BoundStatement[]): BoundStatement {
  return {
    kind: 'BlockStatement',
    statements,
  };
}

export function BoundVariableDelcarationStatement(
  variable: VariableSymbol,
  expression: BoundExpression
): BoundStatement {
  return {
    kind: 'VariableDelcarationStatement',
    variable,
    expression,
  };
}
