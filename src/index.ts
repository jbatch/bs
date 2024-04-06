import { Binder } from './binding/Binder';
import { DiagnosticBag } from './reporting/Diagnostic';
import Terminal from './repl/Terminal';
import { Parser } from './parsing/Parser';

import { Evaluator } from './evaluation/Evaluator';

import { BoundScope } from './binding/BoundScope';
import { BoundStatement } from './binding/BoundStatement';
import { prettyPrintTree } from './parsing/SyntaxNode';
import { prettyPrintProgram } from './binding/BoundNode';
import { Lowerer } from './lowerer/Lowerer';

const variables = {};
let globalScope = new BoundScope();
let showTree = false;
let showProgram = false;

async function main() {
  let quit = false;
  let lines = [];
  while (!quit) {
    const prompt = lines.length === 0 ? '> ' : '| ';
    const line = await Terminal.input(prompt);
    if (line === '#q' || line === '#quit') {
      quit = true;
      break;
    }

    if (line === '#t' || line === '#showTree') {
      showTree = !showTree;
      const msg = `Print tree ${showTree ? 'enabled' : 'disabled'}`;
      Terminal.writeLine(msg);
      continue;
    }

    if (line === '#p' || line === '#showProgram') {
      showProgram = !showProgram;
      const msg = `Print program ${showProgram ? 'enabled' : 'disabled'}`;
      Terminal.writeLine(msg);
      continue;
    }

    if (lines.length === 0) {
      if (line.length === 0) {
        continue;
      }
    }

    lines.push(line);

    if (line.length != 0) {
      // still typing
      continue;
    }

    const inputText = lines.join('\n');
    // Reset collected lines
    lines = [];

    let { diagnostics, statement } = parseCode(inputText);

    if (diagnostics.hasDiagnostics()) {
      continue;
    }

    // Rewrite tree
    statement = new Lowerer().rewriteBoundStatement(statement);

    if (showProgram) {
      prettyPrintProgram(statement);
    }

    // Evaluate
    evaluateBoundStatement(statement);
  }
  process.exit(0);
}

const { diagnostics, statement, boundScope } = parseCode('1 + 2 == 3');
if (!diagnostics.hasDiagnostics()) {
  evaluateBoundStatement(statement);
  // Only update global scope if no issues occured in parsing.
  globalScope = boundScope;
}
main();

function evaluateBoundStatement(boundRoot: BoundStatement) {
  try {
    const evaluator = new Evaluator(boundRoot, variables);
    Terminal.writeLine();
    Terminal.writeLine(evaluator.evaluate());
  } catch (error: any) {
    console.error(error.message);
  }
}

function parseCode(inputText: string) {
  const parser = new Parser(inputText);
  const sourceText = parser.source;
  const compilationUnit = parser.parse();
  const binder = new Binder(globalScope);
  const statement = binder.bindStatement(compilationUnit.statement);
  const boundScope = binder.scope;

  const diagnostics = new DiagnosticBag();
  diagnostics.addBag(parser.diagnostics);
  diagnostics.addBag(binder.diagnostics);

  if (showTree) {
    prettyPrintTree(compilationUnit.statement);
  }

  // Print errors
  if (diagnostics.hasDiagnostics()) {
    diagnostics.printDiagnostic(sourceText);
  } else {
    globalScope = binder.scope;
  }

  return { diagnostics, statement, boundScope };
}
