import assert from 'node:assert';
import { BoundExpression, BoundStatement } from '../binding/BoundExpression';
import { EvaluationResult } from './EvaluationResult';

export class Evaluator {
  root: BoundStatement;
  variables: Record<string, any>;
  lastResult?: EvaluationResult;

  constructor(root: BoundStatement, variables: Record<string, any>) {
    this.root = root;
    this.variables = variables;
  }

  evaluate(): EvaluationResult | undefined {
    this.evaluateStatement(this.root);
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
    }
  }

  private evaluateBlockStatement(block: BoundStatement) {
    assert(block.kind === 'BlockStatement');

    for (let statement of block.statements) {
      this.evaluateStatement(statement);
    }
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
      default:
        throw new Error(`Invalid unary operator ${node}`);
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
      default:
        throw new Error(`Unexpected binary operator ${node}`);
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
