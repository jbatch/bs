import { DiagnosticBag } from './Diagnostic';
import {
  AssignmentExpression,
  BinaryExpression,
  ExpressionSyntax,
  LiteralExpression,
  NameExpression,
  ParenthesizedExpression,
  SyntaxNode,
  UnaryExpression,
} from './Expression';
import { Lexer } from './Lexer';
import { getBinaryOperatorPrecedence, getUnaryOperatorPrecedence } from './SyntaxHelper';
import { SyntaxKind, SyntaxToken, textSpan } from './SyntaxToken';

type SyntaxTree = { root: ExpressionSyntax };

export class Parser {
  tokens: SyntaxToken[];
  position: number = 0;
  diagnostics: DiagnosticBag = new DiagnosticBag();

  constructor(text: string) {
    this.tokens = [];

    const lexer = new Lexer(text);
    let token: SyntaxToken;
    do {
      token = lexer.nextToken();

      if (token.kind !== 'WhitespaceToken' && token.kind !== 'BadToken') {
        this.tokens.push(token);
      }
    } while (token.kind !== 'EndOfFileToken');
    this.diagnostics.addBag(lexer.diagnostics);
  }

  parse(): SyntaxTree {
    const expression = this.parseExpression();

    const eof = this.matchToken('EndOfFileToken');
    return { root: expression };
  }

  private current(): SyntaxToken {
    return this.peek(0);
  }

  private peek(offset: number) {
    const index = this.position + offset;
    if (index >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[index];
  }

  private nextToken(): SyntaxToken {
    const token = this.current();
    this.position++;
    return token;
  }

  private matchToken(kind: SyntaxKind): SyntaxToken {
    const current = this.current();
    if (current.kind === kind) {
      this.position++;
      return current;
    }

    this.diagnostics.reportUnexpectedToken(current.span, current.kind, kind);
    this.position++;
    return {
      kind,
      span: textSpan(this.position, 1),
      text: undefined,
      value: undefined,
      children: [],
    };
  }

  private parseExpression(): ExpressionSyntax {
    return this.parseAssignmentExpression();
  }

  private parseAssignmentExpression(): ExpressionSyntax {
    if (this.peek(0).kind === 'IdentifierToken' && this.peek(1).kind === 'EqualsToken') {
      const identifier = this.nextToken();
      const equals = this.nextToken();
      const expression = this.parseAssignmentExpression();
      return AssignmentExpression(identifier, equals, expression);
    }
    return this.parseBinaryExpression();
  }

  private parseBinaryExpression(parentPrecedence: number = 0): ExpressionSyntax {
    let left: ExpressionSyntax;
    var unaryPrecedence = getUnaryOperatorPrecedence(this.current().kind);
    if (unaryPrecedence !== 0 && unaryPrecedence >= parentPrecedence) {
      const operator = this.nextToken();
      const operand = this.parseBinaryExpression(unaryPrecedence);
      left = UnaryExpression(operator, operand);
    } else {
      left = this.parsePrimaryExpression();
    }

    while (true) {
      var precedence = getBinaryOperatorPrecedence(this.current().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }

      const operator = this.nextToken();
      const right = this.parseBinaryExpression(precedence);
      left = BinaryExpression(left, operator, right);
    }
    return left;
  }

  private parsePrimaryExpression(): ExpressionSyntax {
    const current = this.current();
    switch (current.kind) {
      case 'OpenParenthesisToken': {
        const open = this.nextToken();
        const expression = this.parseExpression();
        const close = this.matchToken('CloseParenthesisToken');
        return ParenthesizedExpression(open, expression, close);
      }
      case 'TrueKeyword':
      case 'FalseKeyword': {
        const literal = this.nextToken();
        return LiteralExpression(literal);
      }
      case 'IdentifierToken': {
        const identifier = this.nextToken();
        return NameExpression(identifier);
      }

      default: {
        const literal = this.matchToken('NumberToken');
        return LiteralExpression(literal);
      }
    }
  }

  prettyPrint(node: SyntaxNode, indent: string = '', isLast: boolean = true) {
    const marker = isLast ? '└──' : '├──';
    process.stdout.write(indent);
    process.stdout.write(marker);
    process.stdout.write(node.kind);
    if (node.kind === 'LiteralExpression' && node.literal.value) {
      process.stdout.write(' (' + node.literal.value.toString() + ')');
    }
    if (node.kind === 'IdentifierToken' && node.text) {
      process.stdout.write(' (' + node.text + ')');
    }
    console.log();
    indent += isLast ? '   ' : '│  ';
    for (let i = 0; i < node.children.length; i++) {
      this.prettyPrint(node.children[i], indent, i === node.children.length - 1);
    }
  }
}
