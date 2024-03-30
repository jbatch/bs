import { SyntaxToken } from './SyntaxToken';

export type SyntaxNode = ExpressionSyntax | SyntaxToken;

export type ExpressionSyntax =
  | {
      kind: 'LiteralExpression';
      literal: SyntaxToken;
      children: SyntaxNode[];
    }
  | {
      kind: 'BinaryExpression';
      left: ExpressionSyntax;
      operator: SyntaxToken;
      right: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'UnaryExpression';
      operator: SyntaxToken;
      operand: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'ParenthesizedExpression';
      open: SyntaxToken;
      expression: ExpressionSyntax;
      close: SyntaxToken;
      children: SyntaxNode[];
    };
