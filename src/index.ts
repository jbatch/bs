import { Binder } from './binding/Binder';
import { Diagnostic, DiagnosticBag } from './reporting/Diagnostic';
import Terminal from './repl/Terminal';
import { Parser } from './parsing/Parser';
import { textSpan } from './text/TextSpan';
import { Evaluator } from './evaluation/Evaluator';

const variables = {};

function printDiagnostic(parser: Parser, diagnostic: Diagnostic) {
  const sourceText = parser.source;
  const lineIndex = parser.source.getLineIndex(diagnostic.span.start);
  const lineNumber = lineIndex + 1;
  const errorLine = sourceText.lines[lineNumber - 1];
  const character = diagnostic.span.start - parser.source.lines[lineIndex].start + 1;
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

    const parser = new Parser(lines.join('\n'));
    // Reset collected lines
    lines = [];

    const tree = parser.parse();
    const binder = new Binder(variables);
    const boundRoot = binder.bindExpression(tree.root);
    const diagnostics = new DiagnosticBag();
    diagnostics.addBag(parser.diagnostics);
    diagnostics.addBag(binder.diagnostics);

    parser.prettyPrint(tree.root);

    // Print errors
    if (diagnostics.hasDiagnostics()) {
      for (let diagnostic of diagnostics.diagnostics) {
        printDiagnostic(parser, diagnostic);
      }
      Terminal.writeLine();
      continue;
    }

    // Evaluate
    try {
      const evaluator = new Evaluator(boundRoot, variables);
      Terminal.writeLine();
      Terminal.writeLine(evaluator.evaluate());
    } catch (error: any) {
      console.error(error.message);
    }
  }
  process.exit(0);
}

main();
