import { Lexer, SyntaxKind, SyntaxToken } from './Lexer';
import { getBinaryOperatorPrecedence, getUnaryOperatorPrecedence } from './SyntaxHelper';

type SyntaxNode = ExpressionSyntax | SyntaxToken;
export type ExpressionSyntax =
  | {
      kind: 'LiteralExpression';
      literal: SyntaxToken;
      children: SyntaxNode[];
    }
  | {
      kind: 'BinaryExpression';
      left: ExpressionSyntax;
      operator: SyntaxToken;
      right: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'UnaryExpression';
      operator: SyntaxToken;
      operand: ExpressionSyntax;
      children: SyntaxNode[];
    }
  | {
      kind: 'ParenthesizedExpression';
      open: SyntaxToken;
      expression: ExpressionSyntax;
      close: SyntaxToken;
      children: SyntaxNode[];
    };
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
      const operator = this.current();
      this.position++;
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

      const operator = this.current();
      this.position++;
      const right = this.parseExpression(precedence - 1 * 2);
      const children = [left, operator, right];
      left = { kind: 'BinaryExpression', left, operator, right, children };
    }
    return left;
  }

  parsePrimaryExpression(): ExpressionSyntax {
    const current = this.current();
    if (current.kind == 'OpenParenthesisToken') {
      const open = current;
      this.position++;
      const expression = this.parseExpression();
      const close = this.matchToken('CloseParenthesisToken');
      const children = [open, expression, close];
      return { kind: 'ParenthesizedExpression', open, expression, close, children };
    }

    const literal = this.matchToken('NumberToken');
    return { kind: 'LiteralExpression', literal, children: [] };
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
