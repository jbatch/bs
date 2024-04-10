import assert from 'node:assert';
import {
  AssignmentExpression,
  BinaryExpression,
  BoundExpression,
  CallExpression,
  LiteralExpression,
  TypeCastExpression,
  UnaryExpression,
  VariableExpression,
} from '../binding/BoundExpression';
import {
  BlockStatement,
  BoundStatement,
  ConditionalGoToStatement,
  GoToStatement,
  LabelStatement,
} from '../binding/BoundStatement';
import { EvaluationResult } from './EvaluationResult';

import { SymbolTable } from '../binding/SymbolTable';
import Terminal from '../repl/Terminal';
import { FunctionSymbol, Int, String as StringTypeSymbol, VariableSymbol } from '../symbols/Symbol';

export class Evaluator {
  root: BlockStatement;
  gloablVariables: Record<string, EvaluationResult>;
  functions: SymbolTable<FunctionSymbol, BlockStatement>;
  // Stack to hold current lock variable values
  locals: SymbolTable<VariableSymbol, EvaluationResult>[] = [];
  lastResult?: EvaluationResult;

  constructor(
    root: BlockStatement,
    gloablVariables: Record<string, EvaluationResult>,
    functions: SymbolTable<FunctionSymbol, BlockStatement>
  ) {
    this.root = root;
    this.gloablVariables = gloablVariables;
    this.functions = functions;
  }

  async evaluate() {
    this.evaluateBlockStatement(this.root);
  }

  async evaluateBlockStatement(block: BlockStatement): Promise<EvaluationResult> {
    const labelMap: Record<string, number> = {};

    block.statements.forEach((statement, index) => {
      if (statement.kind === 'LabelStatement') {
        labelMap[statement.label.name] = index;
      }
    });

    let index = 0;
    while (index < block.statements.length) {
      const statement = block.statements[index];

      switch (statement.kind) {
        case 'ExpressionStatement':
          this.lastResult = await this.evaluateExpression(statement.expression);
          break;
        case 'BlockStatement':
          // Should never happen because we flatten the statment tree
          throw new Error('Encountered unexpected block statement');
        case 'VariableDelcarationStatement':
          await this.evaluateVariableDeclarationStatement(statement);
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

  private async evaluateVariableDeclarationStatement(declaration: BoundStatement) {
    assert(declaration.kind === 'VariableDelcarationStatement');

    var value = await this.evaluateExpression(declaration.expression);
    if (declaration.variable.isLocal) {
      this.locals[0].setValue(declaration.variable, value);
    } else {
      this.gloablVariables[declaration.variable.name] = value;
    }
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

  private async evaluateUnaryExpression(node: UnaryExpression): Promise<EvaluationResult> {
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

  private async evaluateBinaryExpression(node: BinaryExpression): Promise<EvaluationResult> {
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

  private async evaluateLiteralExpression(node: LiteralExpression): Promise<EvaluationResult> {
    return node.value!;
  }

  private async evaluateVariableExpression(node: VariableExpression): Promise<EvaluationResult> {
    if (node.variable.isLocal) {
      return this.locals[0].getValue(node.variable);
    }
    return this.gloablVariables[node.variable.name];
  }

  private async evaluateAssignmentExpression(
    node: AssignmentExpression
  ): Promise<EvaluationResult> {
    var value = await this.evaluateExpression(node.expression);
    if (node.variable.isLocal) {
      this.locals[0].setValue(node.variable, value);
    } else {
      this.gloablVariables[node.variable.name] = value;
    }
    return value;
  }

  private async evaluateCallExpression(node: CallExpression): Promise<EvaluationResult> {
    const userDefinedFunction = this.functions.getValue(node.functionSymbol);
    if (userDefinedFunction) {
      const functionLocals = new SymbolTable<VariableSymbol, EvaluationResult>([]);
      for (let i = 0; i < node.args.length; i++) {
        const arg = node.args[i];
        const param = node.functionSymbol.parameters[i];
        const value = await this.evaluateExpression(arg);
        functionLocals.setValue(param, value);
      }
      this.locals.unshift(functionLocals);
      await this.evaluateBlockStatement(userDefinedFunction);
      this.locals.shift();
      return;
    }
    switch (node.functionSymbol.name) {
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
