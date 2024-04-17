import { parseArgs } from 'node:util';
import fs from 'node:fs';
import { Compiler } from './Compiler';
import { BoundScope } from '../binding/BoundScope';
import { Evaluator } from '../evaluation/Evaluator';
import Terminal from '../repl/Terminal';

type Args = {
  verbose: boolean;
  showProgram: boolean;
  showTree: boolean;
  filename: string;
};

function getCommandLineArgs(): Args {
  const { values, positionals } = parseArgs({
    args: process.argv,
    options: {
      verbose: { type: 'boolean', short: 'v' },
      program: { type: 'boolean', short: 'p' },
      tree: { type: 'boolean', short: 't' },
    },
    allowPositionals: true,
  });
  const verbose = values.verbose ?? false;
  const showProgram = values.program ?? false;
  const showTree = values.tree ?? false;
  const filename = positionals[2];
  if (!filename) {
    console.error('Usage: yarn bsc [filename]');
    process.exit(1);
  }
  return { verbose, showProgram, showTree, filename };
}

async function main() {
  const { verbose, showProgram, showTree, filename } = getCommandLineArgs();

  if (!fs.existsSync(filename)) {
    console.error(`File not found: ${filename}`);
    process.exit(1);
  }
  console.log(`Opening file: ${filename}`);
  const inputText = fs.readFileSync(filename).toString();

  const compiler = new Compiler(BoundScope.createRootScope());
  const compilationResult = compiler.compile(inputText, {
    showProgram,
    showTree,
    printLoweredTree: true,
  });
  const { sourceText, diagnostics, blockStatement, functionTable, updatedGlobalScope } =
    compilationResult;

  if (diagnostics.hasDiagnostics()) {
    // Print errors and reset
    diagnostics.printDiagnostic(sourceText);
    process.exit(1);
  }

  const evaluator = new Evaluator(blockStatement, {}, functionTable);
  try {
    const result = await evaluator.evaluate();
    if (result !== undefined) {
      Terminal.writeLine();
      Terminal.writeLine(result);
    }
  } catch (error: any) {
    if (verbose) {
      console.error(error);
    } else {
      console.error(`Unhandled Error: ${error.message}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
