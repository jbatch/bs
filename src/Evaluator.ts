import assert from 'node:assert';
import { BoundExpression } from './BoundExpression';
import { EvaluationResult } from './EvaluationResult';

export class Evaluator {
  root: BoundExpression;
  variables: Record<string, any>;
  constructor(root: BoundExpression, variables: Record<string, any>) {
    this.root = root;
    this.variables = variables;
  }

  evaluate(): EvaluationResult {
    return this.evaluateExpression(this.root);
  }

  private evaluateExpression(node: BoundExpression): EvaluationResult {
    switch (node.kind) {
      case 'UnaryExpression':
        this.evaluateUnaryExpression(node);
      case 'BinaryExpression':
        this.evaluateBinaryExpression(node);
      case 'LiteralExpression':
        this.evaluateLiteralExpression(node);
      case 'VariableExpression':
        this.evaluateVariableExpression(node);
      case 'AssignmentExpression':
        this.evaluateAssignmentExpression(node);
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
