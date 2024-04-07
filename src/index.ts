import { Binder } from './binding/Binder.ts';
import { DiagnosticBag } from './reporting/Diagnostic.ts';
import Terminal from './repl/Terminal.ts';
import { Parser } from './parsing/Parser.ts';

import { Evaluator } from './evaluation/Evaluator.ts';

import { BoundScope } from './binding/BoundScope.ts';
import { BlockStatement, BoundStatement } from './binding/BoundStatement.ts';
import { prettyPrintTree } from './parsing/SyntaxNode.ts';
import { prettyPrintProgram } from './binding/BoundNode.ts';
import { Lowerer } from './lowerer/Lowerer.ts';

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
    const loweredBlockStatment = new Lowerer().lower(statement);

    if (showProgram) {
      prettyPrintProgram(loweredBlockStatment);
    }

    // Evaluate
    evaluateBoundStatement(loweredBlockStatment);
  }
  process.exit(0);
}

main();

function evaluateBoundStatement(boundRoot: BlockStatement) {
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
