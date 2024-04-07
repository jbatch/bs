import {
  BinaryExpression,
  AssignmentExpression,
  BoundExpression,
  UnaryExpression,
  LiteralExpression,
  VariableExpression,
  BoundUnaryExpression,
  BoundBinaryExpression,
  BoundAssignmentExpression,
  ErrorExpression,
  OperatorAssignmentExpression,
  PostfixUnaryExpression,
  BoundOperatorAssignmentExpression,
} from './BoundExpression';
import {
  BlockStatement,
  BoundStatement,
  ExpressionStatement,
  VariableDelcarationStatement,
  IfStatement,
  ForStatement,
  BoundIfStatement,
  BoundWhileStatement,
  WhileStatement,
  BoundForStatement,
  BoundExpressionStatement,
  LabelStatement,
  GoToStatement,
  ConditionalGoToStatement,
  BoundConditionalGoToStatement,
  BoundBlockStatement,
} from './BoundStatement';

export class BoundTreeRewriter {
  public rewriteBoundStatement(boundTreeRoot: BoundStatement): BoundStatement {
    switch (boundTreeRoot.kind) {
      case 'ExpressionStatement':
        return this.rewriteExpressionStatement(boundTreeRoot);
      case 'BlockStatement':
        return this.rewriteBlockStatement(boundTreeRoot);
      case 'VariableDelcarationStatement':
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
      case 'ErrorExpression':
        return this.rewriteErrorExpression(expression);
    }
  }

  protected rewriteBlockStatement(statement: BlockStatement): BoundStatement {
    const statements = statement.statements;
    return BoundBlockStatement(statements.map((s) => this.rewriteBoundStatement(s)));
  }

  protected rewriteVariableDelcarationStatement(
    statement: VariableDelcarationStatement
  ): BoundStatement {
    return statement;
  }

  rewriteIfStatement(statement: IfStatement): BoundStatement {
    let { condition, ifBlock, elseBlock } = statement;
    condition = this.rewriteExpression(condition);
    const rewrittenIfBlock = this.rewriteBoundStatement(ifBlock);
    const rewrittenElseBlock =
      elseBlock === undefined ? undefined : this.rewriteBoundStatement(elseBlock);
    return BoundIfStatement(condition, rewrittenIfBlock, rewrittenElseBlock);
  }

  rewriteWhileStatement(statement: WhileStatement): BoundStatement {
    let { loopCondition, whileBlock } = statement;
    loopCondition = this.rewriteExpression(loopCondition);
    whileBlock = this.rewriteBoundStatement(whileBlock);
    return BoundWhileStatement(loopCondition, whileBlock);
  }

  rewriteForStatement(statement: ForStatement): BoundStatement {
    let { beginStatement, loopCondition, endStatement, forBlock } = statement;
    beginStatement = this.rewriteBoundStatement(beginStatement);
    loopCondition = this.rewriteExpression(loopCondition);
    endStatement = this.rewriteBoundStatement(endStatement);
    forBlock = this.rewriteBoundStatement(forBlock);
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
    let { type, name, expression: right } = expression;
    right = this.rewriteExpression(right);
    return BoundAssignmentExpression(type, name, right);
  }

  rewriteOperatorAssignmentExpression(expression: OperatorAssignmentExpression): BoundExpression {
    let { type, name, operator, expression: assignmentExpression } = expression;
    assignmentExpression = this.rewriteExpression(assignmentExpression);
    return BoundOperatorAssignmentExpression(type, name, operator, assignmentExpression);
  }

  rewritePostfixUnaryExpression(expression: PostfixUnaryExpression): BoundExpression {
    return expression;
  }

  protected rewriteErrorExpression(expression: ErrorExpression): BoundExpression {
    return expression;
  }
}
