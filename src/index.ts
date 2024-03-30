import readline from 'readline';
import { Parser } from './Parser';
import { Binder } from './Binder';
import { Evaluator } from './Evaluator';

const rl = readline.createInterface(process.stdin, process.stdout);

function onInput(line: string) {
  const parser = new Parser(line);
  var tree = parser.parse();
  const binder = new Binder();
  const boundRoot = binder.bindExpression(tree.root);
  const diagnostics = [...parser.diagnostics, ...binder.diagnostics];

  if (diagnostics.length > 0) {
    for (let diagnosic of parser.diagnostics) {
      console.log(diagnosic);
    }
    console.log();
    rl.prompt();
    return;
  }

  parser.prettyPrint(tree.root);

  const evaluator = new Evaluator(boundRoot);
  console.log();
  console.log(evaluator.evaluate());
  rl.prompt();
}

rl.on('line', onInput);

function main() {
  onInput('(1 + 2) * 3');
}

main();
