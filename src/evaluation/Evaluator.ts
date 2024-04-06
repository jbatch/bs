import assert from 'node:assert';
import { BoundExpression } from '../binding/BoundExpression';
import { EvaluationResult } from './EvaluationResult';
import {
  BoundStatement,
  LabelStatement,
  GoToStatement,
  ConditionalGoToStatement,
  BlockStatement,
} from '../binding/BoundStatement';

export class Evaluator {
  root: BlockStatement;
  variables: Record<string, EvaluationResult>;
  lastResult?: EvaluationResult;

  constructor(root: BlockStatement, variables: Record<string, EvaluationResult>) {
    this.root = root;
    this.variables = variables;
  }

  evaluate(): EvaluationResult | undefined {
    const labelMap: Record<string, number> = {};

    this.root.statements.forEach((statement, index) => {
      if (statement.kind === 'LabelStatement') {
        labelMap[statement.label.name] = index;
      }
    });

    let index = 0;
    while (index < this.root.statements.length) {
      const statement = this.root.statements[index];

      switch (statement.kind) {
        case 'ExpressionStatement':
          this.lastResult = this.evaluateExpression(statement.expression);
          break;
        case 'BlockStatement':
        case 'VariableDelcarationStatement':
        case 'IfStatement':
        case 'WhileStatement':
          this.evaluateStatement(statement);
          break;
        case 'ForStatement':
          // Rewritten
          break;
        case 'LabelStatement':
          // No-op
          break;
        case 'GoToStatement':
          index = labelMap[statement.label.name];
          continue;
        case 'ConditionalGoToStatement':
          const condition = Boolean(this.evaluateExpression(statement.condition));
          if (condition === statement.jumpIfTrue) {
            index = labelMap[statement.label.name];
            continue;
          } else {
            // No op
            break;
          }
      }
      index++;
    }

    return this.lastResult;
  }

  private evaluateStatement(statement: BoundStatement) {
    switch (statement.kind) {
      case 'ExpressionStatement':
        this.lastResult = this.evaluateExpression(statement.expression);
        break;
      case 'BlockStatement':
        this.evaluateBlockStatement(statement);
        break;
      case 'VariableDelcarationStatement':
        this.evaluateVariableDeclarationStatement(statement);
        break;
      case 'IfStatement':
        this.evaluateIfStatement(statement);
        break;
      case 'WhileStatement':
        this.evaluateWhileStatement(statement);
        break;
      case 'ForStatement':
        this.evaluateForStatement(statement);
        break;
      case 'LabelStatement':
        this.evaluateLabelStatement(statement);
        break;
      case 'GoToStatement':
        this.evaluateGoToStatement(statement);
        break;
      case 'ConditionalGoToStatement':
        this.evaluateConditionalGoToStatement(statement);
        break;
    }
  }

  private evaluateBlockStatement(block: BoundStatement) {
    assert(block.kind === 'BlockStatement');

    for (let statement of block.statements) {
      this.evaluateStatement(statement);
    }
  }

  private evaluateVariableDeclarationStatement(declaration: BoundStatement) {
    assert(declaration.kind === 'VariableDelcarationStatement');

    var value = this.evaluateExpression(declaration.expression);
    this.variables[declaration.variable.name] = value;
    this.lastResult = value;
  }

  private evaluateIfStatement(statement: BoundStatement) {
    assert(statement.kind === 'IfStatement');
    const conditionValue = this.evaluateExpression(statement.condition);
    assert(typeof conditionValue === 'boolean');
    if (Boolean(conditionValue)) {
      this.evaluateStatement(statement.ifBlock);
      return;
    }

    if (statement.elseBlock) {
      this.evaluateStatement(statement.elseBlock);
    }
  }

  private evaluateWhileStatement(statement: BoundStatement) {
    assert(statement.kind === 'WhileStatement');
    while (Boolean(this.evaluateExpression(statement.loopCondition))) {
      this.evaluateStatement(statement.whileBlock);
    }
  }

  private evaluateForStatement(statement: BoundStatement) {
    assert(statement.kind === 'ForStatement');
    this.evaluateStatement(statement.beginStatement);
    const a = this.evaluateExpression(statement.loopCondition);
    while (Boolean(this.evaluateExpression(statement.loopCondition))) {
      this.evaluateStatement(statement.forBlock);
      this.evaluateStatement(statement.endStatement);
    }
  }

  evaluateLabelStatement(statement: LabelStatement) {
    throw new Error('Method not implemented.');
  }

  evaluateGoToStatement(statement: GoToStatement) {
    throw new Error('Method not implemented.');
  }

  evaluateConditionalGoToStatement(statement: ConditionalGoToStatement) {
    throw new Error('Method not implemented.');
  }

  private evaluateExpression(node: BoundExpression): EvaluationResult {
    switch (node.kind) {
      case 'UnaryExpression':
        return this.evaluateUnaryExpression(node);
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(node);
      case 'LiteralExpression':
        return this.evaluateLiteralExpression(node);
      case 'VariableExpression':
        return this.evaluateVariableExpression(node);
      case 'AssignmentExpression':
        return this.evaluateAssignmentExpression(node);
    }

    throw new Error(`Unexpected expression type ${node}`);
  }

  private evaluateUnaryExpression(node: BoundExpression): EvaluationResult {
    assert(node.kind === 'UnaryExpression');
    var operand = this.evaluateExpression(node.operand);
    switch (node.operator.kind) {
      case 'Identity':
        return operand;
      case 'Negation':
        return -operand;
      case 'LogicalNegation':
        return !operand;
      case 'OnesCompliment':
        return ~operand;
    }
  }

  private evaluateBinaryExpression(node: BoundExpression): EvaluationResult {
    assert(node.kind === 'BinaryExpression');
    const left = this.evaluateExpression(node.left);
    const right = this.evaluateExpression(node.right);

    switch (node.operator.kind) {
      case 'Addition':
        return +left + +right;
      case 'Subtraction':
        return +left - +right;
      case 'Multiplication':
        return +left * +right;
      case 'Division':
        return +left / +right;
      case 'LogicalAnd':
        return left && right;
      case 'LogicalOr':
        return left || right;
      case 'Equals':
        return left == right;
      case 'NotEquals':
        return left != right;
      case 'LessThan':
        return left < right;
      case 'LessThanOrEqual':
        return left <= right;
      case 'GreaterThan':
        return left > right;
      case 'GreaterThanOrEqual':
        return left >= right;
      case 'BitwiseAnd':
        return Number(left) & Number(right);
      case 'BitwiseOr':
        return Number(left) | Number(right);
      case 'BitwiseXor':
        return Number(left) ^ Number(right);
    }
  }

  private evaluateLiteralExpression(node: BoundExpression): EvaluationResult {
    assert(node.kind === 'LiteralExpression');
    return node.value!;
  }

  private evaluateVariableExpression(node: BoundExpression): EvaluationResult {
    assert(node.kind === 'VariableExpression');
    return this.variables[node.name];
  }

  private evaluateAssignmentExpression(node: BoundExpression): EvaluationResult {
    assert(node.kind === 'AssignmentExpression');
    var value = this.evaluateExpression(node.expression);
    this.variables[node.name] = value;
    return value;
  }
}
