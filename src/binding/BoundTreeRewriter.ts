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

  private rewriteExpressionStatement(statement: ExpressionStatement): BoundStatement {
    let { expression } = statement;
    expression = this.rewriteExpression(statement.expression);
    return BoundExpressionStatement(expression);
  }

  private rewriteExpression(expression: BoundExpression): BoundExpression {
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
    }
  }

  private rewriteBlockStatement(statement: BlockStatement): BoundStatement {
    return statement;
  }

  private rewriteVariableDelcarationStatement(
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

  private rewriteWhileStatement(statement: WhileStatement): BoundStatement {
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

  private rewriteLabelStatement(statement: LabelStatement): BoundStatement {
    return statement;
  }

  private rewriteGoToStatement(statement: GoToStatement): BoundStatement {
    return statement;
  }

  private rewriteConditionalGoToStatement(statement: ConditionalGoToStatement): BoundStatement {
    let { label, jumpIfTrue, condition } = statement;
    condition = this.rewriteExpression(condition);
    return BoundConditionalGoToStatement(label, jumpIfTrue, condition);
  }

  private rewriteUnaryExpression(expression: UnaryExpression): BoundExpression {
    let { type, operator, operand } = expression;
    operand = this.rewriteExpression(operand);
    return BoundUnaryExpression(type, operand, operator);
  }

  private rewriteBinaryExpression(expression: BinaryExpression): BoundExpression {
    let { type, left, operator, right } = expression;
    left = this.rewriteExpression(left);
    right = this.rewriteExpression(right);
    return BoundBinaryExpression(type, left, operator, right);
  }

  private rewriteLiteralExpression(expression: LiteralExpression): BoundExpression {
    return expression;
  }

  private rewriteVariableExpression(expression: VariableExpression): BoundExpression {
    return expression;
  }

  private rewriteAssignmentExpression(expression: AssignmentExpression): BoundExpression {
    let { type, name, expression: right } = expression;
    right = this.rewriteExpression(right);
    return BoundAssignmentExpression(type, name, right);
  }
}
