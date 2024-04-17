import Terminal from './repl/Terminal';

import { Evaluator } from './evaluation/Evaluator';

import fs from 'fs';
import { BoundScope } from './binding/BoundScope';
import { BlockStatement } from './binding/BoundStatement';
import { SymbolTable } from './binding/SymbolTable';
import { Compiler } from './compiler/Compiler';
import { FunctionSymbol } from './symbols/Symbol';

const variables = {};
let globalScope = BoundScope.createRootScope();
let showTree = false;
let showProgram = true;
let printLoweredTree = true;
let verbose = false;

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

    if (['.l', '.lower'].includes(line)) {
      printLoweredTree = !printLoweredTree;
      const msg = `Print lowered tree ${printLoweredTree ? 'enabled' : 'disabled'}`;
      Terminal.writeLine(msg);
      continue;
    }

    if (['.v', '.verbose'].includes(line)) {
      verbose = !verbose;
      const msg = `Verbose error messages ${verbose ? 'enabled' : 'disabled'}`;
      Terminal.writeLine(msg);
      continue;
    }

    if (['.ls'].includes(line)) {
      const variables = globalScope.getDeclaredVariables();
      const functions = globalScope.getDeclaredFunctions();
      Terminal.writeLine('Variables');
      variables.forEach((v) => Terminal.writeLine(`\t${v.name}: ${v.type}`));
      Terminal.writeLine();
      Terminal.writeLine('Functions');
      functions.forEach((f) => Terminal.writeLine(`\t${f.name}(): ${f.type.name}`));
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

    const compiler = new Compiler(globalScope);
    const compilationResult = compiler.compile(inputText, {
      showProgram,
      showTree,
      printLoweredTree,
    });
    const { sourceText, diagnostics, blockStatement, functionTable, updatedGlobalScope } =
      compilationResult;

    if (diagnostics.hasDiagnostics()) {
      // Print errors and reset
      diagnostics.printDiagnostic(sourceText);
      continue;
    } else {
      globalScope = updatedGlobalScope;
    }

    // Evaluate
    await evaluateBoundStatement(blockStatement, functionTable);
  }
  process.exit(0);
}

main();

async function evaluateBoundStatement(
  boundRoot: BlockStatement,
  functions: SymbolTable<FunctionSymbol, BlockStatement>
) {
  try {
    const evaluator = new Evaluator(boundRoot, variables, functions);
    Terminal.writeLine();
    const result = await evaluator.evaluate();
    if (result === undefined) {
      return;
    }
    Terminal.writeLine(result);
  } catch (error: any) {
    if (verbose) {
      console.error(error);
    } else {
      console.error(`Unhandled Error: ${error.message}`);
    }
  }
}
