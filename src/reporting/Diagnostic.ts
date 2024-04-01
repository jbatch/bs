import { Type } from '../binding/BoundExpression';
import { SyntaxKind } from '../parsing/SyntaxToken';
import { TextSpan, textSpan } from '../text/TextSpan';

export type Diagnostic = { message: string; span: TextSpan };

export class DiagnosticBag {
  diagnostics: Diagnostic[] = [];

  constructor() {}

  hasDiagnostics() {
    return this.diagnostics.length > 0;
  }

  addBag(other: DiagnosticBag) {
    this.diagnostics.push(...other.diagnostics);
  }

  private report(message: string, span: TextSpan) {
    const diagnostic = { message, span };
    this.diagnostics.push(diagnostic);
  }

  reportInvalidNumber(span: TextSpan, text: string) {
    const message = `The number ${text} isn't valid number.`;
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

  reportUndefinedUnaryOperator(span: TextSpan, operatorText: string, operandType: Type) {
    const message = `Unary operator '${operatorText}' is not defined for type ${operandType}.`;
    this.report(message, span);
  }

  reportUnexpectedLiteralType(span: TextSpan, literalType: string) {
    const message = `Unexpected literal type ${literalType}`;
    this.report(message, span);
  }

  reportUnexpectedLiteralValue(span: TextSpan, text: string) {
    const message = `Unexpected literal '${text}'`;
    this.report(message, span);
  }

  reportUndefinedBinaryOperator(
    span: TextSpan,
    operatorText: string,
    leftType: Type,
    rightType: Type
  ) {
    const message = `Binary operator '${operatorText}' is not defined for types ${leftType} and ${rightType}.`;
    this.report(message, span);
  }

  reportUndefinedName(span: TextSpan, name: string) {
    const message = `Unknown variable '${name}'`;
    this.report(message, span);
  }
}
