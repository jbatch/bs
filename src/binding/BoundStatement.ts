import { VariableSymbol } from '../text/VariableSymbol';
import { BoundExpression } from './BoundExpression';

// Generated code

export type ExpressionStatement = {
  kind: 'ExpressionStatement';
  expression: BoundExpression;
};
export type BlockStatement = {
  kind: 'BlockStatement';
  statements: BoundStatement[];
};
export type VariableDelcarationStatement = {
  kind: 'VariableDelcarationStatement';
  variable: VariableSymbol;
  expression: BoundExpression;
};
export type IfStatement = {
  kind: 'IfStatement';
  condition: BoundExpression;
  ifBlock: BoundStatement;
  elseBlock: BoundStatement | undefined;
};
export type WhileStatement = {
  kind: 'WhileStatement';
  loopCondition: BoundExpression;
  whileBlock: BoundStatement;
};
export type ForStatement = {
  kind: 'ForStatement';
  beginStatement: BoundStatement;
  loopCondition: BoundExpression;
  endStatement: BoundStatement;
  forBlock: BoundStatement;
};
export type BoundStatement =
  | ExpressionStatement
  | BlockStatement
  | VariableDelcarationStatement
  | IfStatement
  | WhileStatement
  | ForStatement;
export function BoundExpressionStatement(expression: BoundExpression): ExpressionStatement {
  return {
    kind: 'ExpressionStatement',
    expression,
  };
}
export function BoundBlockStatement(statements: BoundStatement[]): BlockStatement {
  return {
    kind: 'BlockStatement',
    statements,
  };
}
export function BoundVariableDelcarationStatement(
  variable: VariableSymbol,
  expression: BoundExpression
): VariableDelcarationStatement {
  return {
    kind: 'VariableDelcarationStatement',
    variable,
    expression,
  };
}
export function BoundIfStatement(
  condition: BoundExpression,
  ifBlock: BoundStatement,
  elseBlock: BoundStatement | undefined
): IfStatement {
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
): WhileStatement {
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
): ForStatement {
  return {
    kind: 'ForStatement',
    beginStatement,
    loopCondition,
    endStatement,
    forBlock,
  };
}
