import assert from 'node:assert';
import { SyntaxToken } from '../parsing/SyntaxToken';
import { TextSpan } from '../text/TextSpan';
import { ExpressionSyntax } from '../parsing/Expression';
import {
  BoundAssignmentExpression,
  BoundBinaryExpression,
  BoundBinaryOperatorKind,
  BoundExpression,
  BoundLiteralExpression,
  BoundUnaryExpression,
  BoundUnaryOperatorKind,
  BoundVariableExpression,
  Type,
  bindBinaryOperator,
  bindUnaryOperator,
} from './BoundExpression';
import { DiagnosticBag } from '../reporting/Diagnostic';

export class Binder {
  variables: Record<string, any>;
  diagnostics: DiagnosticBag = new DiagnosticBag();

  constructor(variables: Record<string, any>) {
    this.variables = variables;
  }

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
      case 'NameExpression':
        return this.bindNameExpression(expression);
      case 'AssignmentExpression':
        return this.bindAssignmentExpression(expression);
    }
  }

  private bindLiteralExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'LiteralExpression');
    const value = expression.literal.value ?? 0;
    var type = this.getLiteralType(expression.literal.span, value);
    return BoundLiteralExpression(type, value);
  }

  private bindBinaryExpression(expression: ExpressionSyntax): BoundExpression {
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
    return BoundBinaryExpression(type, left, operator, right);
  }

  private bindUnaryExpression(expression: ExpressionSyntax): BoundExpression {
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
    return BoundUnaryExpression(type, operator, operand);
  }

  private bindParenthesizedExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'ParenthesizedExpression');
    return this.bindExpression(expression.expression);
  }

  private bindNameExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'NameExpression');
    const name = expression.identifier.text!;
    if (this.variables[name] === undefined) {
      this.diagnostics.reportUndefinedName(expression.identifier.span, name);
      return BoundLiteralExpression('number', 0);
    }
    const value = this.variables[name];
    const type = this.getLiteralType(expression.identifier.span, value);
    return BoundVariableExpression(type, name);
  }

  private bindAssignmentExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'AssignmentExpression');
    const name = expression.identifier.text!;
    const boundExpression = this.bindExpression(expression.expression);
    const type = boundExpression.type;
    const defaultValue = this.getDefaultValueForType(type);
    this.variables[name] = defaultValue;
    return BoundAssignmentExpression(type, name, boundExpression);
  }

  private bindUnaryOperatorKind(operator: SyntaxToken): BoundUnaryOperatorKind {
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

  private bindBinaryOperatorKind(operator: SyntaxToken): BoundBinaryOperatorKind {
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

  private getLiteralType(span: TextSpan, value: any): Type {
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

  private getDefaultValueForType(type: Type) {
    switch (type) {
      case 'number':
        return 0;
      case 'boolean':
        return false;
    }
  }
}
