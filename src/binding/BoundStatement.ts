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
    }
  | {
      kind: 'IfStatement';
      condition: BoundExpression;
      ifBlock: BoundStatement;
      elseBlock?: BoundStatement;
    }
  | {
      kind: 'WhileStatement';
      loopCondition: BoundExpression;
      whileBlock: BoundStatement;
    }
  | {
      kind: 'ForStatement';
      beginStatement: BoundStatement;
      loopCondition: BoundExpression;
      endStatement: BoundStatement;
      forBlock: BoundStatement;
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

export function BoundIfStatement(
  condition: BoundExpression,
  ifBlock: BoundStatement,
  elseBlock?: BoundStatement
): BoundStatement {
  return {
    kind: 'IfStatement',
    condition,
    ifBlock,
    elseBlock,
  };
}

export function BoundWhileStatement(
  loopCondition: BoundExpression,
  whileBlock: BoundStatement
): BoundStatement {
  return {
    kind: 'WhileStatement',
    loopCondition,
    whileBlock,
  };
}

export function BoundForStatement(
  beginStatement: BoundStatement,
  loopCondition: BoundExpression,
  endStatement: BoundStatement,
  forBlock: BoundStatement
): BoundStatement {
  return {
    kind: 'ForStatement',
    beginStatement,
    loopCondition,
    endStatement,
    forBlock,
  };
}
