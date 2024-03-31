import assert from 'node:assert';
import { SyntaxToken, TextSpan } from './SyntaxToken';
import { ExpressionSyntax } from './Expression';
import {
  BoundBinaryOperatorKind,
  BoundExpression,
  BoundUnaryOperatorKind,
  Type,
  bindBinaryOperator,
  bindUnaryOperator,
} from './BoundExpression';
import { DiagnosticBag } from './Diagnostic';

export class Binder {
  diagnostics: DiagnosticBag = new DiagnosticBag();

  bindExpression(expression: ExpressionSyntax) {
    switch (expression.kind) {
      case 'LiteralExpression':
        return this.bindLiteralExpression(expression);
      case 'BinaryExpression':
        return this.bindBinaryExpression(expression);
      case 'UnaryExpression':
        return this.bindUnaryExpression(expression);
      case 'ParenthesizedExpression':
        return this.bindParenthesizedExpression(expression);
    }
  }

  bindLiteralExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'LiteralExpression');
    const value = expression.literal.value ?? 0;
    var type = this.getLiteralType(expression.literal.span, value);
    return { kind: 'LiteralExpression', type, value };
  }

  bindBinaryExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'BinaryExpression');
    const left = this.bindExpression(expression.left);
    const right = this.bindExpression(expression.right);
    const operator = bindBinaryOperator(expression.operator.kind, left.type, right.type);
    if (operator === undefined) {
      this.diagnostics.reportUndefinedBinaryOperator(
        expression.operator.span,
        expression.operator.text!,
        left.type,
        right.type
      );
      return left;
    }
    const type = operator.type;
    return { kind: 'BinaryExpression', type, left, operator, right };
  }

  bindUnaryExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'UnaryExpression');
    const operand = this.bindExpression(expression.operand);
    const type = operand.type;
    const operator = bindUnaryOperator(expression.operator.kind, operand.type);
    if (operator === undefined) {
      this.diagnostics.reportUndefinedUnaryOperator(
        expression.operator.span,
        expression.operator.text!,
        operand.type
      );
      return operand;
    }
    return { kind: 'UnaryExpression', type, operand, operator };
  }

  bindParenthesizedExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'ParenthesizedExpression');
    return this.bindExpression(expression.expression);
  }

  bindUnaryOperatorKind(operator: SyntaxToken): BoundUnaryOperatorKind {
    switch (operator.kind) {
      case 'PlusToken':
        return 'Identity';
      case 'MinusToken':
        return 'Negation';
      case 'BangToken':
        return 'LogicalNegation';
    }
    throw new Error(`Invalid unary operator kind ${operator.kind}`);
  }

  bindBinaryOperatorKind(operator: SyntaxToken): BoundBinaryOperatorKind {
    switch (operator.kind) {
      case 'PlusToken':
        return 'Addition';
      case 'MinusToken':
        return 'Subtraction';
      case 'StarToken':
        return 'Multiplication';
      case 'SlashToken':
        return 'Division';
      case 'AmpersandAmpersandToken':
        return 'LogicalAnd';
      case 'PipePipeToken':
        return 'LogicalOr';
    }
    throw new Error(`Invalid binary operator kind ${operator.kind}`);
  }

  getLiteralType(span: TextSpan, value: any): Type {
    switch (typeof value) {
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'bigint':
      case 'string':
      case 'symbol':
      case 'undefined':
      case 'object':
      case 'function':
        this.diagnostics.reportUnexpectedLiteralType(span, typeof value);
        return 'number';
    }
  }
}

function isNumber(value: string | number): value is number {
  return typeof value === 'number';
}
