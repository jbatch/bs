import { VariableSymbol } from '../text/VariableSymbol';
import { BoundExpression } from './BoundExpression';
import { BoundNode } from './BoundNode';

function isDefined<T>(node: T | undefined): node is T {
  return node !== undefined;
}

// Generated code

export type ExpressionStatement = {
  kind: 'ExpressionStatement';
  expression: BoundExpression;
  children: BoundNode[];
};
export type BlockStatement = {
  kind: 'BlockStatement';
  statements: BoundStatement[];
  children: BoundNode[];
};
export type VariableDelcarationStatement = {
  kind: 'VariableDelcarationStatement';
  variable: VariableSymbol;
  expression: BoundExpression;
  children: BoundNode[];
};
export type IfStatement = {
  kind: 'IfStatement';
  condition: BoundExpression;
  ifBlock: BoundStatement;
  elseBlock: BoundStatement | undefined;
  children: BoundNode[];
};
export type WhileStatement = {
  kind: 'WhileStatement';
  loopCondition: BoundExpression;
  whileBlock: BoundStatement;
  children: BoundNode[];
};
export type ForStatement = {
  kind: 'ForStatement';
  beginStatement: BoundStatement;
  loopCondition: BoundExpression;
  endStatement: BoundStatement;
  forBlock: BoundStatement;
  children: BoundNode[];
};
export type BoundStatement =
  | ExpressionStatement
  | BlockStatement
  | VariableDelcarationStatement
  | IfStatement
  | WhileStatement
  | ForStatement;
export function BoundExpressionStatement(expression: BoundExpression): ExpressionStatement {
  const children: BoundNode[] = [expression];
  return {
    kind: 'ExpressionStatement',
    expression,
    children,
  };
}
export function BoundBlockStatement(statements: BoundStatement[]): BlockStatement {
  const children: BoundNode[] = [...statements];
  return {
    kind: 'BlockStatement',
    statements,
    children,
  };
}
export function BoundVariableDelcarationStatement(
  variable: VariableSymbol,
  expression: BoundExpression
): VariableDelcarationStatement {
  const children: BoundNode[] = [variable, expression];
  return {
    kind: 'VariableDelcarationStatement',
    variable,
    expression,
    children,
  };
}
export function BoundIfStatement(
  condition: BoundExpression,
  ifBlock: BoundStatement,
  elseBlock: BoundStatement | undefined
): IfStatement {
  const children: BoundNode[] = [condition, ifBlock, elseBlock].filter(isDefined);
  return {
    kind: 'IfStatement',
    condition,
    ifBlock,
    elseBlock,
    children,
  };
}
export function BoundWhileStatement(
  loopCondition: BoundExpression,
  whileBlock: BoundStatement
): WhileStatement {
  const children: BoundNode[] = [loopCondition, whileBlock];
  return {
    kind: 'WhileStatement',
    loopCondition,
    whileBlock,
    children,
  };
}
export function BoundForStatement(
  beginStatement: BoundStatement,
  loopCondition: BoundExpression,
  endStatement: BoundStatement,
  forBlock: BoundStatement
): ForStatement {
  const children: BoundNode[] = [beginStatement, loopCondition, endStatement, forBlock];
  return {
    kind: 'ForStatement',
    beginStatement,
    loopCondition,
    endStatement,
    forBlock,
    children,
  };
}
