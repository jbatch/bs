import { SyntaxNode } from './SyntaxNode';
import { TokenSyntax } from './TokenSyntax';

export type ExpressionSyntax =
  | {
      kind: 'LiteralExpression';
      literal: TokenSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'BinaryExpression';
      left: ExpressionSyntax;
      operator: TokenSyntax;
      right: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'UnaryExpression';
      operator: TokenSyntax;
      operand: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'ParenthesizedExpression';
      open: TokenSyntax;
      expression: ExpressionSyntax;
      close: TokenSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'NameExpression';
      identifier: TokenSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'AssignmentExpression';
      identifier: TokenSyntax;
      equals: TokenSyntax;
      expression: ExpressionSyntax;
      children: SyntaxNode[];
    };

export function LiteralExpression(literal: TokenSyntax): ExpressionSyntax {
  const children = [literal];
  return { kind: 'LiteralExpression', literal, children };
}

export function BinaryExpression(
  left: ExpressionSyntax,
  operator: TokenSyntax,
  right: ExpressionSyntax
): ExpressionSyntax {
  const children = [left, operator, right];
  return { kind: 'BinaryExpression', left, operator, right, children };
}

export function UnaryExpression(
  operator: TokenSyntax,
  operand: ExpressionSyntax
): ExpressionSyntax {
  const children = [operator, operand];
  return { kind: 'UnaryExpression', operator, operand, children };
}

export function ParenthesizedExpression(
  open: TokenSyntax,
  expression: ExpressionSyntax,
  close: TokenSyntax
): ExpressionSyntax {
  const children = [open, expression, close];
  return { kind: 'ParenthesizedExpression', open, expression, close, children };
}

export function NameExpression(identifier: TokenSyntax): ExpressionSyntax {
  return { kind: 'NameExpression', identifier, children: [identifier] };
}

export function AssignmentExpression(
  identifier: TokenSyntax,
  equals: TokenSyntax,
  expression: ExpressionSyntax
): ExpressionSyntax {
  const children = [identifier, equals, expression];
  return { kind: 'AssignmentExpression', identifier, equals, expression, children };
}
