import assert from 'node:assert';
import { SyntaxToken } from './SyntaxToken';
import { ExpressionSyntax } from './Expression';
import {
  BoundBinaryOperatorKind,
  BoundExpression,
  BoundUnaryOperatorKind,
  Type,
} from './BoundExpression';

export class Binder {
  diagnostics: string[] = [];

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
    assert(expression.kind === 'LiteralExpression' && expression.literal.value);
    const value = expression.literal.value;
    var type = this.getLiteralType(value);
    return { kind: 'LiteralExpression', type, value };
  }

  bindBinaryExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'BinaryExpression');
    const left = this.bindExpression(expression.left);
    // TODO calculate correct type for binary expression
    const type = left.type;
    const operatorKind = this.bindBinaryOperatorKind(expression.operator);
    const right = this.bindExpression(expression.right);
    return { kind: 'BinaryExpression', type, left, operatorKind, right };
  }

  bindUnaryExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'UnaryExpression');
    const operand = this.bindExpression(expression.operand);
    // TODO calculate correct type for unary expression
    const type = operand.type;
    const operatorKind = this.bindUnaryOperatorKind(expression.operator);
    return { kind: 'UnaryExpression', type, operand, operatorKind };
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
    }
    throw new Error(`Invalid binary operator kind ${operator.kind}`);
  }

  getLiteralType(value: any): Type {
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
        this.diagnostics.push(`Unexpected literal type ${typeof value}`);
        return 'number';
    }
  }
}

function isNumber(value: string | number): value is number {
  return typeof value === 'number';
}
