import { ExpressionSyntax } from './ExpressionSyntax';
import { SyntaxNode } from './SyntaxNode';
import { TokenSyntax } from './TokenSyntax';

export type StatementSyntax =
  | {
      kind: 'ExpressionStatement';
      expression: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'BlockStatement';
      open: TokenSyntax;
      statements: StatementSyntax[];
      close: TokenSyntax;
      children: SyntaxNode[];
    };

export function ExpressionStatement(expression: ExpressionSyntax): StatementSyntax {
  return {
    kind: 'ExpressionStatement',
    expression,
    children: [expression],
  };
}
export function BlockStatement(
  open: TokenSyntax,
  statements: StatementSyntax[],
  close: TokenSyntax
): StatementSyntax {
  return {
    kind: 'BlockStatement',
    open,
    statements,
    close,
    children: [open, ...statements, close],
  };
}
