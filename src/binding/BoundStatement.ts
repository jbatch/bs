import { FunctionSymbol, TypeSymbol, VariableSymbol } from '../symbols/Symbol';
import { BoundExpression } from './BoundExpression';
import { BoundLabel } from './BoundLabel';
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
export type VariableDeclarationStatement = {
  kind: 'VariableDeclarationStatement';
  variable: VariableSymbol;
  expression: BoundExpression;
  children: BoundNode[];
};
export type IfStatement = {
  kind: 'IfStatement';
  condition: BoundExpression;
  ifBlock: BlockStatement;
  elseBlock: BlockStatement | undefined;
  children: BoundNode[];
};
export type WhileStatement = {
  kind: 'WhileStatement';
  continueLabel: BoundLabel;
  breakLabel: BoundLabel;
  loopCondition: BoundExpression;
  whileBlock: BlockStatement;
  children: BoundNode[];
};
export type ForStatement = {
  kind: 'ForStatement';
  continueLabel: BoundLabel;
  breakLabel: BoundLabel;
  beginStatement: BoundStatement;
  loopCondition: BoundExpression;
  endStatement: BoundStatement;
  forBlock: BlockStatement;
  children: BoundNode[];
};
export type FunctionDeclarationStatement = {
  kind: 'FunctionDeclarationStatement';
  functionSymbol: FunctionSymbol;
  type: TypeSymbol | undefined;
  children: BoundNode[];
};
export type ReturnStatement = {
  kind: 'ReturnStatement';
  value: BoundExpression | undefined;
  children: BoundNode[];
};
export type LabelStatement = {
  kind: 'LabelStatement';
  label: BoundLabel;
  children: BoundNode[];
};
export type GoToStatement = {
  kind: 'GoToStatement';
  label: BoundLabel;
  children: BoundNode[];
};
export type ConditionalGoToStatement = {
  kind: 'ConditionalGoToStatement';
  label: BoundLabel;
  jumpIfTrue: boolean;
  condition: BoundExpression;
  children: BoundNode[];
};
export type BoundStatement =
  | ExpressionStatement
  | BlockStatement
  | VariableDeclarationStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | FunctionDeclarationStatement
  | ReturnStatement
  | LabelStatement
  | GoToStatement
  | ConditionalGoToStatement;
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
export function BoundVariableDeclarationStatement(
  variable: VariableSymbol,
  expression: BoundExpression
): VariableDeclarationStatement {
  const children: BoundNode[] = [variable, expression];
  return {
    kind: 'VariableDeclarationStatement',
    variable,
    expression,
    children,
  };
}
export function BoundIfStatement(
  condition: BoundExpression,
  ifBlock: BlockStatement,
  elseBlock: BlockStatement | undefined
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
  continueLabel: BoundLabel,
  breakLabel: BoundLabel,
  loopCondition: BoundExpression,
  whileBlock: BlockStatement
): WhileStatement {
  const children: BoundNode[] = [loopCondition, whileBlock];
  return {
    kind: 'WhileStatement',
    continueLabel,
    breakLabel,
    loopCondition,
    whileBlock,
    children,
  };
}
export function BoundForStatement(
  continueLabel: BoundLabel,
  breakLabel: BoundLabel,
  beginStatement: BoundStatement,
  loopCondition: BoundExpression,
  endStatement: BoundStatement,
  forBlock: BlockStatement
): ForStatement {
  const children: BoundNode[] = [beginStatement, loopCondition, endStatement, forBlock];
  return {
    kind: 'ForStatement',
    continueLabel,
    breakLabel,
    beginStatement,
    loopCondition,
    endStatement,
    forBlock,
    children,
  };
}
export function BoundFunctionDeclarationStatement(
  functionSymbol: FunctionSymbol,
  type: TypeSymbol | undefined
): FunctionDeclarationStatement {
  const children: BoundNode[] = [];
  return {
    kind: 'FunctionDeclarationStatement',
    functionSymbol,
    type,
    children,
  };
}
export function BoundReturnStatement(value: BoundExpression | undefined): ReturnStatement {
  const children: BoundNode[] = [value].filter(isDefined);
  return {
    kind: 'ReturnStatement',
    value,
    children,
  };
}
export function BoundLabelStatement(label: BoundLabel): LabelStatement {
  const children: BoundNode[] = [];
  return {
    kind: 'LabelStatement',
    label,
    children,
  };
}
export function BoundGoToStatement(label: BoundLabel): GoToStatement {
  const children: BoundNode[] = [];
  return {
    kind: 'GoToStatement',
    label,
    children,
  };
}
export function BoundConditionalGoToStatement(
  label: BoundLabel,
  jumpIfTrue: boolean,
  condition: BoundExpression
): ConditionalGoToStatement {
  const children: BoundNode[] = [condition];
  return {
    kind: 'ConditionalGoToStatement',
    label,
    jumpIfTrue,
    condition,
    children,
  };
}
