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

      switch (node.operatorKind) {
        case 'Identity':
          assert(node.operand.type === 'number');
          return operand;
        case 'Negation':
          assert(node.operand.type === 'number');
          return -operand;
        case 'LogicalNegation':
          assert(node.operand.type === 'boolean');
          return !operand;
        default:
          throw new Error(`Invalid unary operator ${node}`);
      }
    }

    if (node.kind === 'BinaryExpression') {
      const left = this.evaluateExpression(node.left);
      const right = this.evaluateExpression(node.right);

      switch (node.operatorKind) {
        case 'Addition':
          this.assertBinaryNumberOperation(node.left.type, node.right.type, node.operatorKind);
          return +left + +right;
        case 'Subtraction':
          this.assertBinaryNumberOperation(node.left.type, node.right.type, node.operatorKind);
          assert(node.left.type === 'number');
          return +left - +right;
        case 'Multiplication':
          this.assertBinaryNumberOperation(node.left.type, node.right.type, node.operatorKind);
          assert(node.left.type === 'number');
          return +left * +right;
        case 'Division':
          this.assertBinaryNumberOperation(node.left.type, node.right.type, node.operatorKind);
          assert(node.left.type === 'number');
          return +left / +right;
        case 'LogicalAnd':
          this.assertBinaryBooleanOperation(node.left.type, node.right.type, node.operatorKind);
          assert(node.left.type === 'boolean');
          return left && right;
        case 'LogicalOr':
          this.assertBinaryBooleanOperation(node.left.type, node.right.type, node.operatorKind);
          assert(node.left.type === 'boolean');
          return left || right;
        default:
          throw new Error(`Unexpected binary operator ${node}`);
      }
    }

    throw new Error(`Unexpected expression type ${node}`);
  }

  assertBinaryNumberOperation(t1: Type, t2: Type, operation: BoundBinaryOperatorKind) {
    assert(
      t1 === 'number' && t2 === 'number',
      `TypeError: cannot evaluate ${operation} for types: ${t1} and ${t2}`
    );
  }

  assertBinaryBooleanOperation(t1: Type, t2: Type, operation: BoundBinaryOperatorKind) {
    assert(
      t1 === 'boolean' && t2 === 'boolean',
      `TypeError: cannot evaluate ${operation} for types: ${t1} and ${t2}`
    );
  }

  assertUnaryNumberOperation(t1: Type, operation: BoundUnaryOperatorKind) {
    assert(t1 === 'number', `TypeError: cannot evaluate ${operation} for type: ${t1}`);
  }

  assertUnaryBooleanOperation(t1: Type, t2: Type, operation: BoundUnaryOperatorKind) {
    assert(t1 === 'boolean', `TypeError: cannot evaluate ${operation} for type: ${t1}`);
  }
}
