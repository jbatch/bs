import { Binder } from './binding/Binder';
import { Diagnostic, DiagnosticBag } from './reporting/Diagnostic';
import Terminal from './repl/Terminal';
import { Parser } from './parsing/Parser';
import { textSpan } from './text/TextSpan';
import { Evaluator } from './evaluation/Evaluator';
import { SourceText } from './text/SourceText';
import { BoundExpression } from './binding/BoundExpression';
import { BoundScope } from './binding/BoundScope';

const variables = {};
let globalScope = new BoundScope();

function printDiagnostic(sourceText: SourceText, diagnostic: Diagnostic) {
  const lineIndex = sourceText.getLineIndex(diagnostic.span.start);
  const lineNumber = lineIndex + 1;
  const errorLine = sourceText.lines[lineNumber - 1];
  const character = diagnostic.span.start - sourceText.lines[lineIndex].start + 1;
  Terminal.writeLine(`[${lineNumber}:${character}] ${diagnostic.message}`);

  const prefixSpan = textSpan(0, diagnostic.span.start);
  const suffixSpan = textSpan(diagnostic.span.end, errorLine.end);
  const prefix = sourceText.getText(prefixSpan);
  const error = sourceText.getText(diagnostic.span);
  const suffix = sourceText.getText(suffixSpan);

  Terminal.write('    ');
  Terminal.write(prefix);
  Terminal.write('\x1b[31m' + error + '\x1b[0m');
  Terminal.write(suffix);
  Terminal.writeLine();
}

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

    const { diagnostics, expression } = parseCode(inputText);

    if (diagnostics.hasDiagnostics()) {
      continue;
    }

    // Evaluate
    evaluateBoundExpression(expression);
  }
  process.exit(0);
}

const { diagnostics, expression, boundScope } = parseCode('1 + 2 == 3');
if (!diagnostics.hasDiagnostics()) {
  evaluateBoundExpression(expression);
  // Only update global scope if no issues occured in parsing.
  globalScope = boundScope;
}
main();

function evaluateBoundExpression(boundRoot: BoundExpression) {
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
  const expression = binder.bindExpression(compilationUnit.expression);
  const boundScope = binder.scope;

  const diagnostics = new DiagnosticBag();
  diagnostics.addBag(parser.diagnostics);
  diagnostics.addBag(binder.diagnostics);

  parser.prettyPrint(compilationUnit.expression);

  // Print errors
  if (diagnostics.hasDiagnostics()) {
    for (let diagnostic of diagnostics.diagnostics) {
      printDiagnostic(sourceText, diagnostic);
    }
    Terminal.writeLine();
  } else {
    globalScope = binder.scope;
  }

  return { diagnostics, expression, boundScope };
}
