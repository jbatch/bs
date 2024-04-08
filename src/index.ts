import { Binder } from './binding/Binder';
import { DiagnosticBag } from './reporting/Diagnostic';
import Terminal from './repl/Terminal';
import { Parser } from './parsing/Parser';

import { Evaluator } from './evaluation/Evaluator';

import { BoundScope } from './binding/BoundScope';
import { BlockStatement } from './binding/BoundStatement';
import { prettyPrintTree } from './parsing/SyntaxNode';
import { prettyPrintProgram } from './binding/BoundNode';
import { Lowerer } from './lowerer/Lowerer';
import fs from 'fs';

const variables = {};
let globalScope = new BoundScope();
let showTree = false;
let showProgram = false;

async function main() {
  console.log('Welcome to batchScript v0.0.1.');

  let quit = false;
  let lines: string[] = [];
  while (!quit) {
    const prompt = lines.length === 0 ? '> ' : '| ';
    let line = await Terminal.input(prompt);
    if (['.q', '.quit', '.exit'].includes(line)) {
      quit = true;
      break;
    }

    if (['.t', '.showTree'].includes(line)) {
      showTree = !showTree;
      const msg = `Print tree ${showTree ? 'enabled' : 'disabled'}`;
      Terminal.writeLine(msg);
      continue;
    }

    if (['.p', '.showProgram'].includes(line)) {
      showProgram = !showProgram;
      const msg = `Print program ${showProgram ? 'enabled' : 'disabled'}`;
      Terminal.writeLine(msg);
      continue;
    }

    if (line.startsWith('.load')) {
      const m = line.match(/.load (.*)/);
      if (!m) {
        Terminal.writeLine(`Usage: .load <source_file>`);
        continue;
      }
      const filename = m[1];
      if (!fs.existsSync(filename)) {
        Terminal.writeLine(`File not found: ${filename}`);
        continue;
      }
      Terminal.writeLine(`Opening file: ${filename}`);
      const fileLines = fs.readFileSync(filename).toString().split('\n');
      lines = fileLines;
      // HACK to make file run right away
      line = '';
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
    await evaluateBoundStatement(loweredBlockStatment);
  }
  process.exit(0);
}

main();

async function evaluateBoundStatement(boundRoot: BlockStatement) {
  try {
    const evaluator = new Evaluator(boundRoot, variables);
    Terminal.writeLine();
    const result = await evaluator.evaluate();
    if (result === undefined) {
      return;
    }
    Terminal.writeLine(result);
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
