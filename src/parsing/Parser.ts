import { DiagnosticBag } from '../reporting/Diagnostic';
import {
  AssignmentExpression,
  BinaryExpression,
  ExpressionSyntax,
  LiteralExpression,
  NameExpression,
  ParenthesizedExpression,
  UnaryExpression,
} from './ExpressionSyntax';
import { Lexer } from './Lexer';
import { SourceText } from '../text/SourceText';
import { textSpan } from '../text/TextSpan';
import { getBinaryOperatorPrecedence, getUnaryOperatorPrecedence } from './SyntaxHelper';
import { TokenSyntax, TokenSyntaxKind } from './TokenSyntax';
import { CompilationUnit, SyntaxNode } from './SyntaxNode';
import { BlockStatement, ExpressionStatement, StatementSyntax } from './StatementSyntax';

export class Parser {
  tokens: TokenSyntax[];
  position: number = 0;
  diagnostics: DiagnosticBag = new DiagnosticBag();
  source: SourceText;

  constructor(text: string) {
    this.source = new SourceText(text);
    this.tokens = [];

    const lexer = new Lexer(this.source);
    let token: TokenSyntax;
    do {
      token = lexer.nextToken();

      if (token.kind !== 'WhitespaceToken' && token.kind !== 'BadToken') {
        this.tokens.push(token);
      }
    } while (token.kind !== 'EndOfFileToken');
    this.diagnostics.addBag(lexer.diagnostics);
  }

  parse(): CompilationUnit {
    const statement = this.parseStatement();
    const eof = this.matchToken('EndOfFileToken');
    const children = [statement, eof];
    return { kind: 'CompilationUnit', statement, eof, children };
  }

  private current(): TokenSyntax {
    return this.peek(0);
  }

  private peek(offset: number) {
    const index = this.position + offset;
    if (index >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[index];
  }

  private nextToken(): TokenSyntax {
    const token = this.current();
    this.position++;
    return token;
  }

  private matchToken(kind: TokenSyntaxKind): TokenSyntax {
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

  private parseStatement(): StatementSyntax {
    if (this.current().kind === 'OpenBraceToken') {
      return this.parseBlockStatement();
    }
    return this.parseExpressionStatement();
  }

  private parseBlockStatement(): StatementSyntax {
    const statements = [];

    const open = this.matchToken('OpenBraceToken');

    while (this.current().kind !== 'EndOfFileToken' && this.current().kind !== 'CloseBraceToken') {
      const statement = this.parseStatement();
      statements.push(statement);
    }

    const close = this.matchToken('CloseBraceToken');
    return BlockStatement(open, statements, close);
  }

  private parseExpressionStatement(): StatementSyntax {
    const expression = this.parseExpression();
    return ExpressionStatement(expression);
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
