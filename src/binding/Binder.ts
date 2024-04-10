import assert from 'node:assert';
import {
  AssignmentExpressionSyntax,
  CallExpressionSyntax,
  ExpressionSyntax,
  OperatorAssignmentExpressionSyntax,
  PostfixUnaryExpressionSyntax,
} from '../parsing/ExpressionSyntax';
import {
  FunctionDeclarationSyntax,
  StatementKind,
  StatementSyntax,
} from '../parsing/StatementSyntax';
import { DiagnosticBag } from '../reporting/Diagnostic';
import { TextSpan } from '../text/TextSpan';
import {
  BoundAssignmentExpression,
  BoundBinaryExpression,
  BoundCallExpression,
  BoundExpression,
  BoundLiteralExpression,
  BoundOperatorAssignmentExpression,
  BoundPostfixUnaryExpression,
  BoundTypeCastExpression,
  BoundUnaryExpression,
  BoundVariableExpression,
  ErrorExpression,
} from './BoundExpression';
import { BoundScope } from './BoundScope';
import {
  BoundBlockStatement,
  BoundExpressionStatement,
  BoundForStatement,
  BoundIfStatement,
  BoundStatement,
  BoundVariableDelcarationStatement,
  BoundWhileStatement,
} from './BoundStatement';
import { BoundUnaryOperator, bindUnaryOperator } from './BoundUnaryOperator';
import { getTokenText } from '../parsing/SyntaxHelper';
import { BoundBinaryOperator, bindBinaryOperator } from './BoundBinaryOperator';
import {
  BUILT_IN_FUNCTIONS,
  Bool,
  Err,
  Int,
  String,
  TypeSymbol,
  Variable,
  VariableSymbol,
  CASTABLE_TYPES,
  FunctionSymbol,
  Void,
} from '../symbols/Symbol';
import { Either, isLeft, left, right } from '../container/Either';
import { IdentifierTokenSyntax, TokenSyntax } from '../parsing/TokenSyntax';
import { BoundErrorExpression } from './BoundExpression';

export class Binder {
  scope: BoundScope;
  diagnostics: DiagnosticBag = new DiagnosticBag();

  constructor(parent: BoundScope) {
    this.scope = new BoundScope(parent);
  }

  public bindGlobalStatements(statements: StatementSyntax[]): BoundStatement[] {
    // No function declarations should be bound as global statements
    assert(!statements.some((s) => s.kind === 'FunctionDeclaration'));
    return statements.map((s) => this.bindStatement(s));
  }

  public bindFunctionDeclarations(functions: FunctionDeclarationSyntax[]): void {
    for (const declaration of functions) {
      this.bindFunctionDeclaration(declaration);
    }
  }

  private bindFunctionDeclaration(declaration: FunctionDeclarationSyntax) {
    const name = declaration.identifier.text;
    // We only support void functions right now
    const type = Void;

    const parameters = declaration.parameters.map((param) => {
      const type = this.bindTypeSymbol(param.type.identifier) ?? Err;
      if (type.name === Err.name) {
        this.diagnostics.reportInvalidTypeSymbol(
          param.type.identifier.span,
          param.type.identifier.text
        );
      }
      const name = param.identifier.text;
      return Variable(name, type, true);
    });

    // Check for repeated parameter names
    const names = parameters.map((param) => param.name);
    const firstDuplicate = names.findIndex((name, idx) => names.lastIndexOf(name) !== idx);
    if (firstDuplicate != -1) {
      const param = declaration.parameters[firstDuplicate];
      this.diagnostics.reportDuplicateParameterName(param.identifier.span, param.identifier.text);
    }

    const fn: FunctionSymbol = {
      kind: 'Function',
      name,
      type,
      parameters,
    };
  }

  private bindStatement(statement: StatementSyntax, expectedKind?: StatementKind): BoundStatement {
    if (expectedKind && statement.kind !== expectedKind) {
      this.diagnostics.reportSyntaxError(statement.span, expectedKind, statement.kind);
    }
    switch (statement.kind) {
      case 'ExpressionStatement':
        return this.bindExpressionStatement(statement.expression);
      case 'BlockStatement':
        return this.bindBlockStatement(statement.statements);
      case 'VariableDeclarationStatement':
        return this.bindVariableDeclarationStatement(statement);
      case 'IfStatement':
        return this.bindIfStatement(statement);
      case 'WhileStatement':
        return this.bindWhileStatement(statement);
      case 'ForStatement':
        return this.bindForStatement(statement);
      case 'FunctionDeclaration':
        throw new Error('Function declarations should not be bound');
    }
  }

  private bindExpressionStatement(expression: ExpressionSyntax): BoundStatement {
    const boundExpression = this.bindExpression(expression);
    return BoundExpressionStatement(boundExpression);
  }

  private bindBlockStatement(statements: StatementSyntax[]): BoundStatement {
    // Wrap execution scope in a new temporary scope for the duration of the block
    this.scope = new BoundScope(this.scope);
    const boundStatements = statements.map((s) => this.bindStatement(s));
    this.scope = this.scope.parent!;
    return BoundBlockStatement(boundStatements);
  }

  private bindVariableDeclarationStatement(declaration: StatementSyntax): BoundStatement {
    assert(declaration.kind === 'VariableDeclarationStatement');
    const expression = this.bindExpression(declaration.expression);
    const name = declaration.identifier.text;
    const readonly = declaration.keyword.kind === 'ConstKeyword';

    // Check expression type matches declared type
    const type = expression.type;
    if (declaration.typeClause) {
      const declaredType = this.bindTypeSymbol(declaration.typeClause.identifier);
      if (declaredType && declaredType.name !== type.name) {
        this.diagnostics.reportCannotAssignIncompatibleTypes(
          declaration.expression.span,
          name,
          declaredType,
          type
        );
      }
    }

    const variable = Variable(name, type, readonly);

    if (!this.scope.tryDeclareVariable(variable)) {
      this.diagnostics.reportVariableAlreadyDeclared(declaration.equals.span, name);
    }

    return BoundVariableDelcarationStatement(variable, expression);
  }

  private bindIfStatement(statement: StatementSyntax): BoundStatement {
    assert(statement.kind === 'IfStatement');
    const condition = this.bindExpressionWithExpectedType(statement.condition, Bool);
    const ifBlock = this.bindStatement(statement.ifBlock, 'BlockStatement');
    let elseBlock;
    if (statement.elseBlock) {
      elseBlock = this.bindStatement(statement.elseBlock, 'BlockStatement');
    }

    return BoundIfStatement(condition, ifBlock, elseBlock);
  }

  private bindWhileStatement(statement: StatementSyntax): BoundStatement {
    assert(statement.kind === 'WhileStatement');
    const loopCondition = this.bindExpressionWithExpectedType(statement.loopCondition, Bool);
    const whileBlock = this.bindStatement(statement.whileBlock, 'BlockStatement');
    return BoundWhileStatement(loopCondition, whileBlock);
  }

  private bindForStatement(statement: StatementSyntax): BoundStatement {
    assert(statement.kind === 'ForStatement');
    this.scope = new BoundScope(this.scope);
    const beginStatement = this.bindStatement(
      statement.beginStatement,
      'VariableDeclarationStatement'
    );
    const loopCondition = this.bindExpressionWithExpectedType(statement.loopCondition, Bool);
    const endStatement = this.bindStatement(statement.endStatement);
    const forBlock = this.bindStatement(statement.forBlock, 'BlockStatement');
    this.scope = this.scope.parent!;
    return BoundForStatement(beginStatement, loopCondition, endStatement, forBlock);
  }

  private bindExpression(expression: ExpressionSyntax): BoundExpression {
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
      case 'OperatorAssignmentExpression':
        return this.bindOperatorAssignmentExpression(expression);
      case 'PostfixUnaryExpression':
        return this.bindPostfixUnaryExpression(expression);
      case 'CallExpression':
        return this.bindCallExpression(expression);
    }
  }

  private bindExpressionWithExpectedType(
    expression: ExpressionSyntax,
    expectedType: TypeSymbol
  ): BoundExpression {
    const boundExpression = this.bindExpression(expression);
    if (boundExpression.type !== expectedType && boundExpression.type.name !== Err.name) {
      this.diagnostics.reportTypeMismatch(expression.span, expectedType, boundExpression.type);
    }
    return boundExpression;
  }

  private bindLiteralExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'LiteralExpression');
    const value = expression.literal.value;
    var type = this.getLiteralType(expression.span, value);
    return BoundLiteralExpression(type, value);
  }

  private bindBinaryExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'BinaryExpression');
    const left = this.bindExpression(expression.left);
    const right = this.bindExpression(expression.right);
    if (left.type.name === Err.name || right.type.name === Err.name) {
      return BoundErrorExpression(Err);
    }
    const maybeOperator = this.tryBindBinaryOperator(left.type, expression.operator, right.type);
    if (isLeft(maybeOperator)) {
      return maybeOperator.left;
    }
    const operator = maybeOperator.right;
    const type = operator.type;
    return BoundBinaryExpression(type, left, operator, right);
  }

  private bindUnaryExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'UnaryExpression');
    const operand = this.bindExpression(expression.operand);
    if (operand.type.name === Err.name) {
      return BoundErrorExpression(Err);
    }
    const type = operand.type;
    const maybeOperator = this.tryBindUnaryOperator(operand.type, expression.operator);
    if (isLeft(maybeOperator)) {
      return maybeOperator.left;
    }
    const operator = maybeOperator.right;
    return BoundUnaryExpression(type, operand, operator);
  }

  private bindParenthesizedExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'ParenthesizedExpression');
    return this.bindExpression(expression.expression);
  }

  private bindNameExpression(expression: ExpressionSyntax): BoundExpression {
    assert(expression.kind === 'NameExpression');
    const name = expression.identifier.text!;
    if (name === '') {
      // Means we fabricated a name expression and the error has already been reported
      return BoundErrorExpression(Err);
    }
    const variable = this.scope.tryLookupVariable(name);
    if (variable === undefined) {
      this.diagnostics.reportUndefinedName(expression.identifier.span, name);
      return BoundErrorExpression(Err);
    }
    const type = variable.type;
    return BoundVariableExpression(type, name);
  }

  private bindAssignmentExpression(expression: AssignmentExpressionSyntax): BoundExpression {
    const boundExpression = this.bindExpression(expression.expression);
    const type = boundExpression.type;
    const maybeVariable = this.tryGetVariable(expression.identifier, type);
    if (isLeft(maybeVariable)) {
      return maybeVariable.left;
    }

    return BoundAssignmentExpression(type, maybeVariable.right.name, boundExpression);
  }

  private bindOperatorAssignmentExpression(
    expression: OperatorAssignmentExpressionSyntax
  ): BoundExpression {
    const maybeVariable = this.tryGetVariable(expression.identifier);
    if (isLeft(maybeVariable)) {
      return maybeVariable.left;
    }
    const variable = maybeVariable.right;
    const boundExpression = this.bindExpression(expression.expression);
    const maybeOperator = this.tryBindBinaryOperator(
      variable.type,
      expression.operator,
      boundExpression.type
    );
    if (isLeft(maybeOperator)) {
      return maybeOperator.left;
    }
    const operator = maybeOperator.right;
    return BoundOperatorAssignmentExpression(
      operator.type,
      variable.name,
      operator,
      boundExpression
    );
  }

  private bindPostfixUnaryExpression(expression: PostfixUnaryExpressionSyntax): BoundExpression {
    // postfix unary operators only support ints
    const maybeVariable = this.tryGetVariable(expression.identifier, Int);
    if (isLeft(maybeVariable)) {
      return maybeVariable.left;
    }
    const variable = maybeVariable.right;
    const maybeOperator = this.tryBindUnaryOperator(variable.type, expression.operator);
    if (isLeft(maybeOperator)) {
      return maybeOperator.left;
    }
    const operator = maybeOperator.right;
    return BoundPostfixUnaryExpression(variable.type, variable.name, operator);
  }

  private bindCallExpression(expression: CallExpressionSyntax): BoundExpression {
    function isNotComma(arg: TokenSyntax | ExpressionSyntax): arg is ExpressionSyntax {
      return arg.kind !== 'CommaToken';
    }

    const args = expression.args;

    // Check if function is a type cast call
    if (args.length === 1) {
      const t = CASTABLE_TYPES[expression.identifier.text];
      if (t !== undefined) {
        return this.bindTypeCast(t, args[0].expression);
      }
    }

    const fn = this.scope.tryLookupFunction(expression.identifier.text);
    if (!fn) {
      this.diagnostics.reportUndefinedFunction(
        expression.identifier.span,
        expression.identifier.text
      );
      return BoundErrorExpression(Err);
    }

    const boundArgs = [];
    for (let i = 0; i < fn.parameters.length; i++) {
      const param = fn.parameters[i];
      const arg = args[i];
      const boundArg = this.bindExpression(arg.expression);
      if (param.type.name !== boundArg.type.name) {
        this.diagnostics.reportArguementTypeMismatch(
          arg.expression.span,
          fn.name,
          param.type,
          boundArg.type
        );
        return BoundErrorExpression(Err);
      }
      boundArgs.push(boundArg);
    }

    return BoundCallExpression(fn.name, fn.type, boundArgs);
  }

  private tryGetVariable(
    identifierToken: IdentifierTokenSyntax,
    expectedType?: TypeSymbol
  ): Either<ErrorExpression, VariableSymbol> {
    const { text: name, span } = identifierToken;
    const variable = this.scope.tryLookupVariable(name);
    if (!variable) {
      this.diagnostics.reportUndefinedVariable(span, name);
      return left(BoundErrorExpression(Err));
    }

    if (variable.readonly) {
      this.diagnostics.reportCannotAssignToReadonlyVariable(span, name);
      return left(BoundErrorExpression(Err));
    }

    if (expectedType && expectedType.name !== variable.type.name) {
      this.diagnostics.reportCannotAssignIncompatibleTypes(
        span,
        variable.name,
        variable.type,
        expectedType
      );
      return left(BoundErrorExpression(Err));
    }
    return right(variable);
  }

  private tryBindBinaryOperator(
    leftType: TypeSymbol,
    operator: TokenSyntax,
    rightType: TypeSymbol
  ): Either<ErrorExpression, BoundBinaryOperator> {
    const boundOperator = bindBinaryOperator(operator.kind, leftType, rightType);
    if (boundOperator === undefined) {
      this.diagnostics.reportUndefinedBinaryOperator(
        operator.span,
        getTokenText(operator),
        leftType,
        rightType
      );
      return left(BoundErrorExpression(Err));
    }
    return right(boundOperator);
  }

  private tryBindUnaryOperator(
    operandType: TypeSymbol,
    operator: TokenSyntax
  ): Either<ErrorExpression, BoundUnaryOperator> {
    const boundOperator = bindUnaryOperator(operator.kind, operandType);
    if (boundOperator === undefined) {
      this.diagnostics.reportUndefinedUnaryOperator(
        operator.span,
        getTokenText(operator),
        operandType
      );
      return left(BoundErrorExpression(Err));
    }
    return right(boundOperator);
  }

  private getLiteralType(span: TextSpan, value: any): TypeSymbol {
    switch (typeof value) {
      case 'number':
        return Int;
      case 'boolean':
        return Bool;
      case 'string':
        return String;
      case 'bigint':
      case 'symbol':
      case 'undefined':
      case 'object':
      case 'function':
        this.diagnostics.reportUnexpectedLiteralType(span, typeof value);
        return Int;
    }
  }

  private bindTypeSymbol(identifier: IdentifierTokenSyntax): TypeSymbol | undefined {
    switch (identifier.text) {
      case 'Int':
        return Int;
      case 'Bool':
        return Bool;
      case 'String':
        return String;
    }
    this.diagnostics.reportInvalidTypeSymbol(identifier.span, identifier.text);
    return undefined;
  }

  private bindTypeCast(type: TypeSymbol, expression: ExpressionSyntax): BoundExpression {
    const boundExpression = this.bindExpression(expression);
    return BoundTypeCastExpression(type, boundExpression);
  }
}
