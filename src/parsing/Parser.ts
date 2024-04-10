import { DiagnosticBag } from '../reporting/Diagnostic';
import {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  ExpressionSyntax,
  LiteralExpression,
  NameExpression,
  OperatorAssignmentExpression,
  ParenthesizedExpression,
  PostfixUnaryExpression,
  UnaryExpression,
} from './ExpressionSyntax';
import { Lexer } from './Lexer';
import { SourceText } from '../text/SourceText';
import { textSpan } from '../text/TextSpan';
import { getBinaryOperatorPrecedence, getUnaryOperatorPrecedence } from './SyntaxHelper';
import {
  BooleanLiteral,
  CommaToken,
  IdentifierTokenSyntax,
  NumberLiteral,
  NumberTokenSyntax,
  StringLiteral,
  TokenSyntax,
  TokenSyntaxKind,
} from './TokenSyntax';
import {
  BlockStatement,
  ExpressionStatement,
  ForStatement,
  IfStatement,
  StatementSyntax,
  VariableDeclarationStatement,
  WhileStatement,
} from './StatementSyntax';
import assert from 'node:assert';
import { CompilationUnitNode, FunctionArgument, TypeClause, TypeClauseNode } from './ContainerNode';

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

  parse(): CompilationUnitNode {
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
    } as TokenSyntax;
  }

  private matchOptionalToken(kind: TokenSyntaxKind): TokenSyntax | undefined {
    const current = this.current();
    if (current.kind === kind) {
      this.position++;
      return current;
    }

    return undefined;
  }

  private parseStatement(): StatementSyntax {
    switch (this.current().kind) {
      case 'OpenBraceToken':
        return this.parseBlockStatement();
      case 'VarKeyword':
      case 'ConstKeyword':
        return this.parseVariableDeclaration();
      case 'IfKeyword':
        return this.parseIfStatement();
      case 'WhileKeyword':
        return this.parseWhileStatement();
      case 'ForKeyword':
        return this.parseForStatement();

      default:
        return this.parseExpressionStatement();
    }
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

  private parseVariableDeclaration(): StatementSyntax {
    assert(this.current().kind === 'VarKeyword' || this.current().kind === 'ConstKeyword');
    const keyword = this.matchToken(this.current().kind);
    const identifier = this.matchToken('IdentifierToken') as IdentifierTokenSyntax;

    let typeClause = undefined;
    if (this.current().kind === 'ColonToken') {
      typeClause = this.parseTypeClause();
    }
    const equals = this.matchToken('EqualsToken');
    const expression = this.parseExpression();
    return VariableDeclarationStatement(keyword, identifier, typeClause, equals, expression);
  }

  private parseIfStatement(): StatementSyntax {
    const ifKeyword = this.matchToken('IfKeyword');
    const openParenthesis = this.matchToken('OpenParenthesisToken');
    const condition = this.parseExpression();
    const closeParenthesis = this.matchToken('CloseParenthesisToken');
    const ifStatement = this.parseBlockStatement();
    let elseKeyword;
    let elseStatement;
    if (this.current().kind === 'ElseKeyword') {
      elseKeyword = this.matchToken('ElseKeyword');
      elseStatement = this.parseBlockStatement();
    }
    return IfStatement(
      ifKeyword,
      openParenthesis,
      condition,
      closeParenthesis,
      ifStatement,
      elseKeyword,
      elseStatement
    );
  }

  private parseWhileStatement(): StatementSyntax {
    const whileKeyword = this.matchToken('WhileKeyword');
    const openParenthesis = this.matchToken('OpenParenthesisToken');
    const loopCondition = this.parseExpression();
    const closeParenthesis = this.matchToken('CloseParenthesisToken');
    const whileBlock = this.parseBlockStatement();

    return WhileStatement(
      whileKeyword,
      openParenthesis,
      loopCondition,
      closeParenthesis,
      whileBlock
    );
  }

  private parseForStatement(): StatementSyntax {
    const forKeyword = this.matchToken('ForKeyword');
    const openParenthesis = this.matchToken('OpenParenthesisToken');
    const beginStatement = this.parseStatement();
    this.matchToken('SemicolonToken');
    const loopCondition = this.parseExpression();
    this.matchToken('SemicolonToken');
    const endStatement = this.parseStatement();
    const closeParenthesis = this.matchToken('CloseParenthesisToken');
    const forBlock = this.parseBlockStatement();
    return ForStatement(
      forKeyword,
      openParenthesis,
      beginStatement,
      loopCondition,
      endStatement,
      closeParenthesis,
      forBlock
    );
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
      const identifier = this.matchToken('IdentifierToken') as IdentifierTokenSyntax;
      const equals = this.nextToken();
      const expression = this.parseExpression();
      return AssignmentExpression(identifier, equals, expression);
    }

    // Postfix unary operators
    if (
      this.peek(0).kind === 'IdentifierToken' &&
      (this.peek(1).kind === 'PlusPlus' || this.peek(1).kind === 'MinusMinus')
    ) {
      const identifier = this.matchToken('IdentifierToken') as IdentifierTokenSyntax;
      const operator = this.nextToken();
      return PostfixUnaryExpression(identifier, operator);
    }

    // Operator assignments
    if (
      this.peek(0).kind === 'IdentifierToken' &&
      (this.peek(1).kind === 'PlusEquals' || this.peek(1).kind === 'MinusEquals')
    ) {
      const identifier = this.matchToken('IdentifierToken') as IdentifierTokenSyntax;
      const operator = this.nextToken();
      const expression = this.parseExpression();
      return OperatorAssignmentExpression(identifier, operator, expression);
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
        const token = this.nextToken();
        return LiteralExpression(BooleanLiteral(token.span, true));
      case 'FalseKeyword': {
        const token = this.nextToken();
        return LiteralExpression(BooleanLiteral(token.span, false));
      }
      case 'IdentifierToken': {
        return this.parseNameOrCall();
      }
      case 'StringToken': {
        const stringToken = this.matchToken('StringToken');
        assert(stringToken.kind === 'StringToken');
        return LiteralExpression(StringLiteral(stringToken.span, stringToken.value));
      }

      default: {
        const number = this.matchToken('NumberToken') as NumberTokenSyntax;
        return LiteralExpression(NumberLiteral(number.span, number.value));
      }
    }
  }

  parseNameOrCall(): ExpressionSyntax {
    if (this.peek(0).kind === 'IdentifierToken' && this.peek(1).kind === 'OpenParenthesisToken') {
      return this.parseCallExpression();
    }
    return this.parseNameExpression();
  }

  parseCallExpression(): ExpressionSyntax {
    const identifier = this.matchToken('IdentifierToken');
    assert(identifier.kind === 'IdentifierToken');
    const open = this.matchToken('OpenParenthesisToken');
    const args = [];
    while (this.peek(0).kind !== 'CloseParenthesisToken') {
      const expression = this.parseExpression();
      const comma = this.matchOptionalToken('CommaToken');
      args.push(FunctionArgument(expression, comma));
    }
    const close = this.matchToken('CloseParenthesisToken');
    return CallExpression(identifier, open, args, close);
  }

  parseNameExpression(): ExpressionSyntax {
    const identifier = this.matchToken('IdentifierToken');
    assert(identifier.kind === 'IdentifierToken');
    return NameExpression(identifier);
  }

  parseTypeClause(): TypeClauseNode {
    const colon = this.matchToken('ColonToken');
    const identifier = this.matchToken('IdentifierToken');
    assert(identifier.kind === 'IdentifierToken');
    return TypeClause(colon, identifier);
  }
}
