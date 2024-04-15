import { SyntaxKind } from '../parsing/SyntaxNode';
import Terminal from '../repl/Terminal';
import { TypeSymbol } from '../symbols/Symbol';
import { SourceText } from '../text/SourceText';
import { TextSpan, textSpan, textSpanWithEnd } from '../text/TextSpan';

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
      const character = diagnostic.span.start - sourceText.lines[lineIndex].start + 1;
      Terminal.writeLine(`[${lineNumber}:${character}] ${diagnostic.message}`);

      const errorLine = sourceText.lines[lineIndex];
      const prefixSpan = textSpanWithEnd(errorLine.start, diagnostic.span.start);
      const suffixSpan = textSpanWithEnd(diagnostic.span.end, errorLine.end);
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

  reportInvalidTypeSymbol(span: TextSpan, text: string) {
    const message = `Invalid type symbol [${text}]`;
    this.report(message, span);
  }

  reportDuplicateParameterName(span: TextSpan, text: string) {
    const message = `Duplicate parameter name: [${text}]`;
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
    const message = `Type error: Binary operator '${operatorText}' is not defined for types [${leftType.name}] and [${rightType.name}].`;
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
    const message = `Reference error: variable '${name}' is not defined`;
    this.report(message, span);
  }

  reportCannotAssignToReadonlyVariable(span: TextSpan, name: string) {
    const message = `Cannot assign to read-only variable '${name}'`;
    this.report(message, span);
  }

  reportCannotAssignIncompatibleTypes(
    span: TextSpan,
    name: string,
    expected: TypeSymbol,
    found: TypeSymbol
  ) {
    const message = `TypeError: Cannot assign [${found.name}] to [${expected.name}] variable '${name}'`;
    this.report(message, span);
  }

  reportUnterminatedString(span: TextSpan) {
    const message = `Unterminated string literal`;
    this.report(message, span);
  }

  reportUndefinedFunction(span: TextSpan, name: string) {
    const message = `Reference error: function '${name}' is not defined`;
    this.report(message, span);
  }

  reportArgumentCountMismatch(span: TextSpan, name: string, expected: number, found: number) {
    const message = `Function '${name}' called with ${found} arguments, expected ${expected}`;
    this.report(message, span);
  }

  reportArgumentTypeMismatch(
    span: TextSpan,
    name: string,
    expected: TypeSymbol,
    found: TypeSymbol
  ) {
    const message = `TypeError: ${name} expected [${expected.name}] argument but got [${found.name}]`;
    this.report(message, span);
  }

  reportBreakContinueStatementOutsideLoop(span: TextSpan) {
    const message = 'Continue or break statement not allowed outside loop';
    this.report(message, span);
  }

  reportReturnOutsideFunction(span: TextSpan) {
    const message = 'Cannot return outside of a function';
    this.report(message, span);
  }
  reportReturningValueFromVoidFunction(span: TextSpan) {
    const message = 'Cannot return value from void function';
    this.report(message, span);
  }
  reportNoReturnValueForNonVoidFunction(span: TextSpan, expectedType: TypeSymbol) {
    const message = `Cannot return void from [${expectedType.name}] function`;
    this.report(message, span);
  }
  reportReturnTypeMismatch(span: TextSpan, expectedType: TypeSymbol, foundType: TypeSymbol) {
    const message = `TypeError: Function returned wrong type. Expected [${expectedType.name}] but found [${foundType.name}]`;
    this.report(message, span);
  }

  reportAllPathsMustReturn(span: TextSpan) {
    const message = 'All paths for non-voice function must end in a return statement.';
    this.report(message, span);
  }
}
