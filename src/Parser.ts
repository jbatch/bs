import { ExpressionSyntax, SyntaxNode } from './Expression';
import { Lexer } from './Lexer';
import { getBinaryOperatorPrecedence, getUnaryOperatorPrecedence } from './SyntaxHelper';
import { SyntaxKind, SyntaxToken } from './SyntaxToken';

type SyntaxTree = { root: ExpressionSyntax };

export class Parser {
  tokens: SyntaxToken[];
  position: number = 0;
  diagnostics: string[] = [];

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
    this.diagnostics.push(...lexer.diagnostics);
  }

  current(): SyntaxToken {
    if (this.position >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[this.position];
  }

  nextToken(): SyntaxToken {
    const token = this.current();
    this.position++;
    return token;
  }

  matchToken(kind: SyntaxKind): SyntaxToken {
    const current = this.current();
    if (current.kind === kind) {
      this.position++;
      return current;
    }
    this.diagnostics.push(`Syntax error: unexpected token ${current.kind} expected ${kind}`);
    return { kind, position: this.position, text: undefined, value: undefined, children: [] };
  }

  parse(): SyntaxTree {
    const expression = this.parseExpression();

    const eof = this.matchToken('EndOfFileToken');
    return { root: expression };
  }

  parseExpression(parentPrecedence: number = 0): ExpressionSyntax {
    let left: ExpressionSyntax;
    var unaryPrecedence = getUnaryOperatorPrecedence(this.current().kind);
    if (unaryPrecedence !== 0 && unaryPrecedence >= parentPrecedence) {
      const operator = this.nextToken();
      const operand = this.parseExpression(unaryPrecedence);
      const children = [operator, operand];
      left = { kind: 'UnaryExpression', operator, operand, children };
    } else {
      left = this.parsePrimaryExpression();
    }

    while (true) {
      var precedence = getBinaryOperatorPrecedence(this.current().kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }

      const operator = this.nextToken();
      const right = this.parseExpression(precedence - 1 * 2);
      const children = [left, operator, right];
      left = { kind: 'BinaryExpression', left, operator, right, children };
    }
    return left;
  }

  parsePrimaryExpression(): ExpressionSyntax {
    const current = this.current();
    if (current.kind == 'OpenParenthesisToken') {
    }
    switch (current.kind) {
      case 'OpenParenthesisToken': {
        const open = this.nextToken();
        const expression = this.parseExpression();
        const close = this.matchToken('CloseParenthesisToken');
        const children = [open, expression, close];
        return { kind: 'ParenthesizedExpression', open, expression, close, children };
      }
      case 'TrueKeyword':
      case 'FalseKeyword': {
        const literal = this.nextToken();
        return { kind: 'LiteralExpression', literal, children: [] };
      }
      default: {
        const literal = this.matchToken('NumberToken');
        return { kind: 'LiteralExpression', literal, children: [] };
      }
    }
  }

  prettyPrint(node: SyntaxNode, indent: string = '', isLast: boolean = true) {
    const marker = isLast ? '└──' : '├──';
    process.stdout.write(indent);
    process.stdout.write(marker);
    process.stdout.write(node.kind);
    if (node.kind === 'LiteralExpression' && node.literal.value) {
      process.stdout.write(' ' + node.literal.value.toString());
    }
    console.log();
    indent += isLast ? '   ' : '│  ';
    for (let i = 0; i < node.children.length; i++) {
      this.prettyPrint(node.children[i], indent, i === node.children.length - 1);
    }
  }
}
