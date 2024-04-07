import { SyntaxKind } from '../parsing/SyntaxNode';
import Terminal from '../repl/Terminal';
import { TypeSymbol } from '../symbols/Symbol';
import { SourceText } from '../text/SourceText';
import { TextSpan, textSpan } from '../text/TextSpan';

export type Diagnostic = { message: string; span: TextSpan };

export class DiagnosticBag {
  diagnostics: Diagnostic[] = [];

  constructor() {}

  hasDiagnostics() {
    return this.diagnostics.length > 0;
  }

  printDiagnostic(sourceText: SourceText) {
    this.diagnostics.forEach((diagnostic) => {
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
    });
    Terminal.writeLine();
  }

  addBag(other: DiagnosticBag) {
    this.diagnostics.push(...other.diagnostics);
  }

  private report(message: string, span: TextSpan) {
    const diagnostic = { message, span };
    this.diagnostics.push(diagnostic);
  }

  reportInvalidNumber(span: TextSpan, text: string) {
    const message = `The number '${text}' isn't valid number.`;
    this.report(message, span);
  }

  reportBadCharacter(position: number, character: string) {
    const span = textSpan(position, 1);
    const message = `Bad character input: '${character}'.`;
    this.report(message, span);
  }

  reportUnexpectedToken(span: TextSpan, actualKind: SyntaxKind, expectedKind: SyntaxKind) {
    const message = `Unexpected token <${actualKind}>, expected <${expectedKind}>.`;
    this.report(message, span);
  }

  reportUndefinedUnaryOperator(span: TextSpan, operatorText: string, operandType: TypeSymbol) {
    const message = `Unary operator '${operatorText}' is not defined for type [${operandType.name}].`;
    this.report(message, span);
  }

  reportUnexpectedLiteralType(span: TextSpan, literalType: string) {
    const message = `Unexpected literal type [${literalType}]`;
    this.report(message, span);
  }

  reportUnexpectedLiteralValue(span: TextSpan, text: string) {
    const message = `Unexpected literal '${text}'`;
    this.report(message, span);
  }

  reportTypeMismatch(span: TextSpan, expected: TypeSymbol, found: TypeSymbol) {
    const message = `TypeError: expected [${expected.name}] but found [${found.name}]`;
    this.report(message, span);
  }

  reportSyntaxError(span: TextSpan, expected: SyntaxKind, found: SyntaxKind) {
    const message = `SyntaxError: expected [${expected}] but found [${found}]`;
  }

  reportUndefinedBinaryOperator(
    span: TextSpan,
    operatorText: string,
    leftType: TypeSymbol,
    rightType: TypeSymbol
  ) {
    const message = `Binary operator '${operatorText}' is not defined for types [${leftType.name}] and [${rightType.name}].`;
    this.report(message, span);
  }

  reportUndefinedName(span: TextSpan, name: string) {
    const message = `Unknown variable '${name}'`;
    this.report(message, span);
  }

  reportVariableAlreadyDeclared(span: TextSpan, name: string) {
    const message = `Variable ${name} is already declared in scope`;
    this.report(message, span);
  }

  reportUndefinedVariable(span: TextSpan, name: string) {
    const message = `Variable '${name}' is not defined`;
    this.report(message, span);
  }

  reportCannotAssignToReadonlyVariable(span: TextSpan, name: string) {
    const message = `Cannot assign to read-only variable '${name}'`;
    this.report(message, span);
  }

  reportCannotAssignIncompatibleTypes(span: TextSpan, expected: TypeSymbol, found: TypeSymbol) {
    const message = `TypeError: Cannot assign [${found.name}] to [${expected.name}] variable '${name}'`;
    this.report(message, span);
  }

  reportUnterminatedString(span: TextSpan) {
    const message = `Unterminated string literal`;
    this.report(message, span);
  }
}
