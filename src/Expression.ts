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
    }
  | {
      kind: 'NameExpression';
      identifier: SyntaxToken;
      children: SyntaxNode[];
    }
  | {
      kind: 'AssignmentExpression';
      identifier: SyntaxToken;
      equals: SyntaxToken;
      expression: ExpressionSyntax;
      children: SyntaxNode[];
    };

export function LiteralExpression(literal: SyntaxToken): ExpressionSyntax {
  const children = [literal];
  return { kind: 'LiteralExpression', literal, children };
}

export function BinaryExpression(
  left: ExpressionSyntax,
  operator: SyntaxToken,
  right: ExpressionSyntax
): ExpressionSyntax {
  const children = [left, operator, right];
  return { kind: 'BinaryExpression', left, operator, right, children };
}

export function UnaryExpression(
  operator: SyntaxToken,
  operand: ExpressionSyntax
): ExpressionSyntax {
  const children = [operator, operand];
  return { kind: 'UnaryExpression', operator, operand, children };
}

export function ParenthesizedExpression(
  open: SyntaxToken,
  expression: ExpressionSyntax,
  close: SyntaxToken
): ExpressionSyntax {
  const children = [open, expression, close];
  return { kind: 'ParenthesizedExpression', open, expression, close, children };
}

export function NameExpression(identifier: SyntaxToken): ExpressionSyntax {
  return { kind: 'NameExpression', identifier, children: [identifier] };
}

export function AssignmentExpression(
  identifier: SyntaxToken,
  equals: SyntaxToken,
  expression: ExpressionSyntax
): ExpressionSyntax {
  const children = [identifier, equals, expression];
  return { kind: 'AssignmentExpression', identifier, equals, expression, children };
}
