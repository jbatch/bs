import { TextSpan, textSpanWithEnd } from '../text/TextSpan';
import { SyntaxNode } from './SyntaxNode';
import { TokenSyntax } from './TokenSyntax';

export type ExpressionSyntax =
  | (
      | {
          kind: 'LiteralExpression';
          literal: TokenSyntax;
        }
      | {
          kind: 'BinaryExpression';
          left: ExpressionSyntax;
          operator: TokenSyntax;
          right: ExpressionSyntax;
        }
      | {
          kind: 'UnaryExpression';
          operator: TokenSyntax;
          operand: ExpressionSyntax;
        }
      | {
          kind: 'ParenthesizedExpression';
          open: TokenSyntax;
          expression: ExpressionSyntax;
          close: TokenSyntax;
        }
      | {
          kind: 'NameExpression';
          identifier: TokenSyntax;
        }
      | {
          kind: 'AssignmentExpression';
          identifier: TokenSyntax;
          equals: TokenSyntax;
          expression: ExpressionSyntax;
        }
    ) & { span: TextSpan; children: SyntaxNode[] };

export function LiteralExpression(literal: TokenSyntax): ExpressionSyntax {
  const span = literal.span;
  const children = [literal];
  return { kind: 'LiteralExpression', span, literal, children };
}

export function BinaryExpression(
  left: ExpressionSyntax,
  operator: TokenSyntax,
  right: ExpressionSyntax
): ExpressionSyntax {
  const span = textSpanWithEnd(left.span.start, right.span.end);
  const children = [left, operator, right];
  return { kind: 'BinaryExpression', span, left, operator, right, children };
}

export function UnaryExpression(
  operator: TokenSyntax,
  operand: ExpressionSyntax
): ExpressionSyntax {
  const span = textSpanWithEnd(operator.span.start, operand.span.end);
  const children = [operator, operand];
  return { kind: 'UnaryExpression', span, operator, operand, children };
}

export function ParenthesizedExpression(
  open: TokenSyntax,
  expression: ExpressionSyntax,
  close: TokenSyntax
): ExpressionSyntax {
  const span = textSpanWithEnd(open.span.start, close.span.end);
  const children = [open, expression, close];
  return { kind: 'ParenthesizedExpression', span, open, expression, close, children };
}

export function NameExpression(identifier: TokenSyntax): ExpressionSyntax {
  const span = identifier.span;
  return { kind: 'NameExpression', span, identifier, children: [identifier] };
}

export function AssignmentExpression(
  identifier: TokenSyntax,
  equals: TokenSyntax,
  expression: ExpressionSyntax
): ExpressionSyntax {
  const span = textSpanWithEnd(identifier.span.start, expression.span.end);
  const children = [identifier, equals, expression];
  return { kind: 'AssignmentExpression', span, identifier, equals, expression, children };
}
