import assert from 'node:assert';
import { BoundExpression, CallExpression, TypeCastExpression } from '../binding/BoundExpression';
import {
  BlockStatement,
  BoundStatement,
  ConditionalGoToStatement,
  GoToStatement,
  LabelStatement,
} from '../binding/BoundStatement';
import { EvaluationResult } from './EvaluationResult';

import Terminal from '../repl/Terminal';
import { Int, String as StringTypeSymbol } from '../symbols/Symbol';

export class Evaluator {
  root: BlockStatement;
  variables: Record<string, EvaluationResult>;
  lastResult?: EvaluationResult;

  constructor(root: BlockStatement, variables: Record<string, EvaluationResult>) {
    this.root = root;
    this.variables = variables;
  }

  async evaluate(): Promise<EvaluationResult> {
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
          this.lastResult = await this.evaluateExpression(statement.expression);
          break;
        case 'BlockStatement':
        case 'VariableDelcarationStatement':
          await this.evaluateStatement(statement);
          break;
        case 'IfStatement':
        case 'WhileStatement':
        case 'ForStatement':
          // Rewritten
          throw new Error('Encountered node that should be rewritten');
        case 'LabelStatement':
          // No-op
          break;
        case 'GoToStatement':
          index = labelMap[statement.label.name];
          continue;
        case 'ConditionalGoToStatement':
          const condition = Boolean(await this.evaluateExpression(statement.condition));
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

    return this.lastResult!;
  }

  private async evaluateStatement(statement: BoundStatement) {
    switch (statement.kind) {
      case 'ExpressionStatement':
        this.lastResult = await this.evaluateExpression(statement.expression);
        break;
      case 'BlockStatement':
        await this.evaluateBlockStatement(statement);
        break;
      case 'VariableDelcarationStatement':
        await this.evaluateVariableDeclarationStatement(statement);
        break;
      case 'LabelStatement':
        await this.evaluateLabelStatement(statement);
        break;
      case 'GoToStatement':
        await this.evaluateGoToStatement(statement);
        break;
      case 'ConditionalGoToStatement':
        await this.evaluateConditionalGoToStatement(statement);
        break;
    }
  }

  private async evaluateBlockStatement(block: BoundStatement) {
    assert(block.kind === 'BlockStatement');

    for (let statement of block.statements) {
      await this.evaluateStatement(statement);
    }
  }

  private async evaluateVariableDeclarationStatement(declaration: BoundStatement) {
    assert(declaration.kind === 'VariableDelcarationStatement');

    var value = await this.evaluateExpression(declaration.expression);
    this.variables[declaration.variable.name] = await value;
    this.lastResult = await value;
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

  private async evaluateExpression(node: BoundExpression): Promise<EvaluationResult> {
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
      case 'CallExpression':
        return this.evaluateCallExpression(node);
      case 'TypeCastExpression':
        return this.evaluateTypeCastExpression(node);
    }

    throw new Error(`Unexpected expression type ${node.kind}`);
  }

  private async evaluateUnaryExpression(node: BoundExpression): Promise<EvaluationResult> {
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
    throw new Error(`Unhandled unary operator: ${node.operator.kind}`);
  }

  private async evaluateBinaryExpression(node: BoundExpression): Promise<EvaluationResult> {
    assert(node.kind === 'BinaryExpression');
    const left = await this.evaluateExpression(node.left);
    const right = await this.evaluateExpression(node.right);
    assert(left !== undefined && right !== undefined);

    switch (node.operator.kind) {
      case 'Addition':
        if (node.left.type.name === Int.name && node.right.type.name === Int.name) {
          return +left + +right;
        } else if (
          node.left.type.name === StringTypeSymbol.name &&
          node.right.type.name === StringTypeSymbol.name
        ) {
          return String(left) + String(right);
        }
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

  private async evaluateLiteralExpression(node: BoundExpression): Promise<EvaluationResult> {
    assert(node.kind === 'LiteralExpression');
    return node.value!;
  }

  private async evaluateVariableExpression(node: BoundExpression): Promise<EvaluationResult> {
    assert(node.kind === 'VariableExpression');
    return this.variables[node.name];
  }

  private async evaluateAssignmentExpression(node: BoundExpression): Promise<EvaluationResult> {
    assert(node.kind === 'AssignmentExpression');
    var value = this.evaluateExpression(node.expression);
    this.variables[node.name] = await value;
    return value;
  }

  private async evaluateCallExpression(node: CallExpression): Promise<EvaluationResult> {
    switch (node.name) {
      case 'print':
        const result = await this.evaluateExpression(node.args[0]);
        Terminal.writeLine(result);
        return undefined;
      case 'input':
        const a = await Terminal.input('? ');
        return a;
      case 'rand':
        const min = await this.evaluateExpression(node.args[0]);
        const max = await this.evaluateExpression(node.args[1]);
        assert(typeof min === 'number' && typeof max === 'number');
        return Math.floor(Math.random() * (max - min) + min);
      default:
        throw new Error('Unexpected function call');
    }
  }

  private async evaluateTypeCastExpression(node: TypeCastExpression): Promise<EvaluationResult> {
    const arg = await this.evaluateExpression(node.expression);
    assert(arg !== undefined);
    switch (node.type.name) {
      case 'int':
        const n = Number(arg);
        if (!Number.isInteger(n)) {
          // TODO runtime error reporting
          return 0;
        }
        return n;
      case 'boolean':
        return Boolean(arg);
      case 'string':
        return String(arg);
    }
    throw new Error('Unexpected type cast expresison type' + node.type.name);
  }
}
