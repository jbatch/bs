import assert from 'node:assert';
import { ExpressionSyntax } from '../parsing/ExpressionSyntax';
import { StatementSyntax } from '../parsing/StatementSyntax';
import { DiagnosticBag } from '../reporting/Diagnostic';
import { TextSpan } from '../text/TextSpan';
import {
  BoundAssignmentExpression,
  BoundBinaryExpression,
  BoundExpression,
  BoundLiteralExpression,
  BoundUnaryExpression,
  BoundVariableExpression,
  Type,
  bindBinaryOperator,
  bindUnaryOperator,
} from './BoundExpression';
import { BoundScope } from './BoundScope';
import {
  BoundBlockStatement,
  BoundExpressionStatement,
  BoundStatement,
  BoundVariableDelcarationStatement,
} from './BoundStatement';

export class Binder {
  scope: BoundScope;
  diagnostics: DiagnosticBag = new DiagnosticBag();

  constructor(parent: BoundScope) {
    this.scope = new BoundScope(parent);
  }

  public bindStatement(statement: StatementSyntax): BoundStatement {
    switch (statement.kind) {
      case 'ExpressionStatement':
        return this.bindExpressionStatement(statement.expression);
      case 'BlockStatement':
        return this.bindBlockStatement(statement.statements);
      case 'VariableDeclarationStatement':
        return this.bindVariableDeclarationStatement(statement);
    }
  }

  private bindExpressionStatement(expression: ExpressionSyntax): BoundStatement {
    const boundExpression = this.bindExpression(expression);
    return BoundExpressionStatement(boundExpression);
  }

  private bindBlockStatement(statements: StatementSyntax[]): BoundStatement {
    // Wrap execution scope in a new temporary scope for the duration of the block
    this.scope = new BoundScope(this.scope);
    const boundStatements = statements.map(this.bindStatement.bind(this));
    this.scope = this.scope.parent!;
    return BoundBlockStatement(boundStatements);
  }

  private bindVariableDeclarationStatement(declaration: StatementSyntax): BoundStatement {
    assert(declaration.kind === 'VariableDeclarationStatement');
    const expression = this.bindExpression(declaration.expression);
    const name = declaration.identifier.text!;
    const readonly = declaration.keyword.kind === 'ConstKeyword';
    const type = expression.type;
    const variable = { name, type, readonly };

    if (!this.scope.tryDeclare(variable)) {
      this.diagnostics.reportVariableAlreadyDeclared(declaration.equals.span, name);
    }

    return BoundVariableDelcarationStatement(variable, expression);
  }

  private bindExpression(expression: ExpressionSyntax) {
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
    const variable = this.scope.tryLookup(name);
    if (variable === undefined) {
      this.diagnostics.reportUndefinedName(expression.identifier.span, name);
      return BoundLiteralExpression('number', 0);
    }
    const type = variable.type;
    return BoundVariableExpression(type, name);
  }

  private bindAssignmentExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'AssignmentExpression');
    const name = expression.identifier.text!;
    const boundExpression = this.bindExpression(expression.expression);
    const type = boundExpression.type;
    const variable = this.scope.tryLookup(name);
    if (!variable) {
      this.diagnostics.reportUndefinedVariable(expression.identifier.span, name);
      return boundExpression;
    }

    if (variable.readonly) {
      this.diagnostics.reportCannotAssignToReadonlyVariable(expression.equals.span, name);
      return boundExpression;
    }

    if (type !== variable.type) {
      this.diagnostics.reportCannotAssignIncompatibleTypes(
        expression.equals.span,
        variable.type,
        type
      );
      return boundExpression;
    }
    return BoundAssignmentExpression(type, name, boundExpression);
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
