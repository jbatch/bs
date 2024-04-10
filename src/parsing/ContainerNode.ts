import { ExpressionSyntax } from './ExpressionSyntax';
import { StatementSyntax } from './StatementSyntax';
import { SyntaxNode } from './SyntaxNode';
import { IdentifierTokenSyntax, TokenSyntax } from './TokenSyntax';

function isDefined<T>(node: T | undefined): node is T {
  return node !== undefined;
}

// Generated code

export type CompilationUnitNode = {
  kind: 'CompilationUnit';
  statement: StatementSyntax;
  eof: TokenSyntax;
  children: SyntaxNode[];
};
export type TypeClauseNode = {
  kind: 'TypeClause';
  colon: TokenSyntax;
  identifier: IdentifierTokenSyntax;
  children: SyntaxNode[];
};
export type FunctionArgumentNode = {
  kind: 'FunctionArgument';
  expression: ExpressionSyntax;
  comma: TokenSyntax | undefined;
  children: SyntaxNode[];
};
export type ContainerNode = CompilationUnitNode | TypeClauseNode | FunctionArgumentNode;
export function CompilationUnit(statement: StatementSyntax, eof: TokenSyntax): CompilationUnitNode {
  const children: SyntaxNode[] = [];
  return {
    kind: 'CompilationUnit',
    statement,
    eof,
    children,
  };
}
export function TypeClause(colon: TokenSyntax, identifier: IdentifierTokenSyntax): TypeClauseNode {
  const children: SyntaxNode[] = [colon, identifier];
  return {
    kind: 'TypeClause',
    colon,
    identifier,
    children,
  };
}
export function FunctionArgument(
  expression: ExpressionSyntax,
  comma: TokenSyntax | undefined
): FunctionArgumentNode {
  const children: SyntaxNode[] = [expression, comma].filter(isDefined);
  return {
    kind: 'FunctionArgument',
    expression,
    comma,
    children,
  };
}
