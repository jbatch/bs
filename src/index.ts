import readline from 'readline';
import { ExpressionSyntax, Parser } from './Parser';

const rl = readline.createInterface(process.stdin, process.stdout);

rl.on('line', (line) => {
  const parser = new Parser(line);
  var tree = parser.parse();
  if (parser.diagnostics.length > 0) {
    for (let diagnosic of parser.diagnostics) {
      console.log(diagnosic);
    }
    console.log();
    rl.prompt();
    return;
  }
  parser.prettyPrint(tree.root);
  const evaluator = new Evaluator(tree.root);
  console.log();
  console.log(evaluator.evaluate());
  rl.prompt();
});

class Evaluator {
  root: ExpressionSyntax;
  constructor(root: ExpressionSyntax) {
    this.root = root;
  }

  evaluate(): number {
    return this.evaluateExpression(this.root);
  }

  evaluateExpression(node: ExpressionSyntax): number {
    if (node.kind === 'NumberExpression') {
      return node.number.value!;
    }

    if (node.kind === 'UnaryExpression') {
      var operand = this.evaluateExpression(node.operand);

      switch (node.operator.kind) {
        case 'PlusToken':
          return operand;
        case 'MinusToken':
          return -operand;
        default:
          throw new Error(`Invalid unary operator ${node.operator.kind}`);
      }
    }

    if (node.kind === 'BinaryExpression') {
      const left = this.evaluateExpression(node.left);
      const right = this.evaluateExpression(node.right);

      switch (node.operator.kind) {
        case 'PlusToken':
          return left + right;
        case 'MinusToken':
          return left - right;
        case 'StarToken':
          return left * right;
        case 'SlashToken':
          return left / right;
        default:
          throw new Error(`Unexpected binary operator ${node.operator.kind}`);
      }
    }

    if (node.kind === 'ParenthesizedExpression') {
      return this.evaluateExpression(node.expression);
    }

    throw new Error(`Unexpected expression type ${node}`);
  }
}
function main() {
  const parser = new Parser('(1 + 2) * 3');
  var tree = parser.parse();
  parser.prettyPrint(tree.root);

  const evaluator = new Evaluator(tree.root);
  console.log();
  console.log(evaluator.evaluate());

  rl.setPrompt('> ');
  rl.prompt();
}

main();
