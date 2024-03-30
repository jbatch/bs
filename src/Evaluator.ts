import assert from 'node:assert';
import { BoundExpression } from './BoundExpression';
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

      switch (node.operatorKind) {
        case 'Identity':
          return operand;
        case 'Negation':
          return -operand;
        default:
          throw new Error(`Invalid unary operator ${node}`);
      }
    }

    if (node.kind === 'BinaryExpression') {
      // TODO handle binary opressions for non-number types
      assert(node.left.type === 'number');
      assert(node.right.type === 'number');
      const left = this.evaluateExpression(node.left) as number;
      const right = this.evaluateExpression(node.right) as number;

      switch (node.operatorKind) {
        case 'Addition':
          return left + right;
        case 'Subtraction':
          return left - right;
        case 'Multiplication':
          return left * right;
        case 'Division':
          return left / right;
        default:
          throw new Error(`Unexpected binary operator ${node}`);
      }
    }

    throw new Error(`Unexpected expression type ${node}`);
  }
}
