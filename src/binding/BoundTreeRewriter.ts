import {
  AssignmentExpression,
  BinaryExpression,
  BoundAssignmentExpression,
  BoundBinaryExpression,
  BoundCallExpression,
  BoundExpression,
  BoundOperatorAssignmentExpression,
  BoundTypeCastExpression,
  BoundUnaryExpression,
  CallExpression,
  ErrorExpression,
  LiteralExpression,
  OperatorAssignmentExpression,
  PostfixUnaryExpression,
  TypeCastExpression,
  UnaryExpression,
  VariableExpression,
} from './BoundExpression';
import {
  BlockStatement,
  BoundBlockStatement,
  BoundConditionalGoToStatement,
  BoundExpressionStatement,
  BoundForStatement,
  BoundIfStatement,
  BoundStatement,
  BoundWhileStatement,
  ConditionalGoToStatement,
  ExpressionStatement,
  ForStatement,
  FunctionDeclarationStatement,
  GoToStatement,
  IfStatement,
  LabelStatement,
  VariableDeclarationStatement,
  WhileStatement,
} from './BoundStatement';

export class BoundTreeRewriter {
  public rewriteBoundStatement(boundTreeRoot: BoundStatement): BoundStatement {
    switch (boundTreeRoot.kind) {
      case 'ExpressionStatement':
        return this.rewriteExpressionStatement(boundTreeRoot);
      case 'BlockStatement':
        return this.rewriteBlockStatement(boundTreeRoot);
      case 'VariableDeclarationStatement':
        return this.rewriteVariableDelcarationStatement(boundTreeRoot);
      case 'IfStatement':
        return this.rewriteIfStatement(boundTreeRoot);
      case 'WhileStatement':
        return this.rewriteWhileStatement(boundTreeRoot);
      case 'ForStatement':
        return this.rewriteForStatement(boundTreeRoot);
      case 'LabelStatement':
        return this.rewriteLabelStatement(boundTreeRoot);
      case 'GoToStatement':
        return this.rewriteGoToStatement(boundTreeRoot);
      case 'ConditionalGoToStatement':
        return this.rewriteConditionalGoToStatement(boundTreeRoot);
      case 'FunctionDeclarationStatement':
        return this.rewriteFunctionDeclarationStatement(boundTreeRoot);
    }
  }

  protected rewriteExpressionStatement(statement: ExpressionStatement): BoundStatement {
    let { expression } = statement;
    expression = this.rewriteExpression(statement.expression);
    return BoundExpressionStatement(expression);
  }

  protected rewriteExpression(expression: BoundExpression): BoundExpression {
    switch (expression.kind) {
      case 'UnaryExpression':
        return this.rewriteUnaryExpression(expression);
      case 'BinaryExpression':
        return this.rewriteBinaryExpression(expression);
      case 'LiteralExpression':
        return this.rewriteLiteralExpression(expression);
      case 'VariableExpression':
        return this.rewriteVariableExpression(expression);
      case 'AssignmentExpression':
        return this.rewriteAssignmentExpression(expression);
      case 'OperatorAssignmentExpression':
        return this.rewriteOperatorAssignmentExpression(expression);
      case 'PostfixUnaryExpression':
        return this.rewritePostfixUnaryExpression(expression);
      case 'CallExpression':
        return this.rewriteCallExpression(expression);
      case 'TypeCastExpression':
        return this.rewriteTypeCastExpression(expression);
      case 'ErrorExpression':
        return this.rewriteErrorExpression(expression);
    }
  }

  protected rewriteBlockStatement(statement: BlockStatement): BlockStatement {
    const statements = statement.statements;
    return BoundBlockStatement(statements.map((s) => this.rewriteBoundStatement(s)));
  }

  protected rewriteVariableDelcarationStatement(
    statement: VariableDeclarationStatement
  ): BoundStatement {
    return statement;
  }

  rewriteIfStatement(statement: IfStatement): BoundStatement {
    let { condition, ifBlock, elseBlock } = statement;
    condition = this.rewriteExpression(condition);
    const rewrittenIfBlock = this.rewriteBlockStatement(ifBlock);
    const rewrittenElseBlock =
      elseBlock === undefined ? undefined : this.rewriteBlockStatement(elseBlock);
    return BoundIfStatement(condition, rewrittenIfBlock, rewrittenElseBlock);
  }

  rewriteWhileStatement(statement: WhileStatement): BoundStatement {
    let { loopCondition, whileBlock } = statement;
    loopCondition = this.rewriteExpression(loopCondition);
    whileBlock = this.rewriteBlockStatement(whileBlock);
    return BoundWhileStatement(loopCondition, whileBlock);
  }

  rewriteForStatement(statement: ForStatement): BoundStatement {
    let { beginStatement, loopCondition, endStatement, forBlock } = statement;
    beginStatement = this.rewriteBoundStatement(beginStatement);
    loopCondition = this.rewriteExpression(loopCondition);
    endStatement = this.rewriteBoundStatement(endStatement);
    forBlock = this.rewriteBlockStatement(forBlock);
    return BoundForStatement(beginStatement, loopCondition, endStatement, forBlock);
  }

  protected rewriteLabelStatement(statement: LabelStatement): BoundStatement {
    return statement;
  }

  protected rewriteGoToStatement(statement: GoToStatement): BoundStatement {
    return statement;
  }

  protected rewriteConditionalGoToStatement(statement: ConditionalGoToStatement): BoundStatement {
    let { label, jumpIfTrue, condition } = statement;
    condition = this.rewriteExpression(condition);
    return BoundConditionalGoToStatement(label, jumpIfTrue, condition);
  }

  protected rewriteFunctionDeclarationStatement(
    statement: FunctionDeclarationStatement
  ): BoundStatement {
    return statement;
  }

  protected rewriteUnaryExpression(expression: UnaryExpression): BoundExpression {
    let { type, operator, operand } = expression;
    operand = this.rewriteExpression(operand);
    return BoundUnaryExpression(type, operand, operator);
  }

  protected rewriteBinaryExpression(expression: BinaryExpression): BoundExpression {
    let { type, left, operator, right } = expression;
    left = this.rewriteExpression(left);
    right = this.rewriteExpression(right);
    return BoundBinaryExpression(type, left, operator, right);
  }

  protected rewriteLiteralExpression(expression: LiteralExpression): BoundExpression {
    return expression;
  }

  protected rewriteVariableExpression(expression: VariableExpression): BoundExpression {
    return expression;
  }

  protected rewriteAssignmentExpression(expression: AssignmentExpression): BoundExpression {
    let { type, variable, expression: right } = expression;
    right = this.rewriteExpression(right);
    return BoundAssignmentExpression(type, variable, right);
  }

  protected rewriteOperatorAssignmentExpression(
    expression: OperatorAssignmentExpression
  ): BoundExpression {
    let { type, variable, operator, expression: assignmentExpression } = expression;
    assignmentExpression = this.rewriteExpression(assignmentExpression);
    return BoundOperatorAssignmentExpression(type, variable, operator, assignmentExpression);
  }

  protected rewritePostfixUnaryExpression(expression: PostfixUnaryExpression): BoundExpression {
    return expression;
  }

  protected rewriteCallExpression(expression: CallExpression): BoundExpression {
    const newArgs = expression.args.map((arg) => this.rewriteExpression(arg));
    return BoundCallExpression(expression.functionSymbol, expression.type, newArgs);
  }

  protected rewriteTypeCastExpression(expression: TypeCastExpression): BoundExpression {
    const newExpression = this.rewriteExpression(expression.expression);

    return BoundTypeCastExpression(expression.type, newExpression);
  }

  protected rewriteErrorExpression(expression: ErrorExpression): BoundExpression {
    return expression;
  }
}
