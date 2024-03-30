import assert from 'node:assert';
import {
  BoundBinaryOperatorKind,
  BoundExpression,
  BoundUnaryOperatorKind,
  Type,
} from './BoundExpression';
import { EvaluationResult } from './EvaluationResult';

export class Evaluator {
  root: BoundExpression;
  constructor(root: BoundExpression) {
    this.root = root;
  }

  evaluate(): EvaluationResult {
    return this.evaluateExpression(this.root);
  }

  evaluateExpression(node: BoundExpression): EvaluationResult {
    if (node.kind === 'LiteralExpression') {
      return node.value!;
    }

    if (node.kind === 'UnaryExpression') {
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

    if (node.kind === 'BinaryExpression') {
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

    throw new Error(`Unexpected expression type ${node}`);
  }
}
