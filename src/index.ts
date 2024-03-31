import readline from 'readline';
import { Parser } from './Parser';
import { Binder } from './Binder';
import { Evaluator } from './Evaluator';
import { DiagnosticBag } from './Diagnostic';

const rl = readline.createInterface(process.stdin, process.stdout);
const variables = {};

function onInput(line: string) {
  const parser = new Parser(line);
  var tree = parser.parse();
  const binder = new Binder(variables);
  const boundRoot = binder.bindExpression(tree.root);
  const diagnostics = new DiagnosticBag();
  diagnostics.addBag(parser.diagnostics);
  diagnostics.addBag(binder.diagnostics);

  parser.prettyPrint(tree.root);
  if (diagnostics.hasDiagnostics()) {
    for (let diagnostic of diagnostics.diagnostics) {
      console.log(diagnostic.message);

      const prefix = line.substring(0, diagnostic.span.start);
      const error = line.substring(diagnostic.span.start, diagnostic.span.end);
      const suffix = line.substring(diagnostic.span.end);

      write('    ');
      write(prefix);
      write('\x1b[31m' + error + '\x1b[0m');
      write(suffix);
      console.log();
    }
    console.log();
    rl.prompt();
    return;
  }

  try {
    const evaluator = new Evaluator(boundRoot, variables);
    console.log();
    console.log(evaluator.evaluate());
  } catch (error: any) {
    console.error(error.message);
  }
  rl.prompt();
}

rl.on('line', onInput);

function write(s: string) {
  process.stdout.write(s);
}

function main() {
  onInput('1 + 2 == 3');
}

main();
