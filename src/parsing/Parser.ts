import assert from 'node:assert';
import { DiagnosticBag } from '../reporting/Diagnostic';
import { SourceText } from '../text/SourceText';
import { textSpan } from '../text/TextSpan';
import {
  CompilationUnitNode,
  FunctionArgument,
  FunctionParameter,
  FunctionParameterNode,
  TypeClause,
  TypeClauseNode,
} from './ContainerNode';
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
import {
  BlockStatement,
  BreakStatement,
  ContinueStatement,
  ExpressionStatement,
  ForStatement,
  FunctionDeclaration,
  IfStatement,
  ReturnStatement,
  StatementSyntax,
  VariableDeclarationStatement,
  WhileStatement,
} from './StatementSyntax';
import { getBinaryOperatorPrecedence, getUnaryOperatorPrecedence } from './SyntaxHelper';
import {
  BooleanLiteral,
  IdentifierTokenSyntax,
  NumberLiteral,
  NumberTokenSyntax,
  ReturnKeyword,
  StringLiteral,
  TokenSyntax,
  TokenSyntaxKind,
} from './TokenSyntax';

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
    const statements = [];
    while (this.current().kind !== 'EndOfFileToken') {
      const start = this.position;
      const statement = this.parseStatement();
      statements.push(statement);
      // If we didn't make any progress parsing a statement skip the current token (the error was already reported)
      if (this.position === start) {
        this.position++;
      }
    }
    const eof = this.matchToken('EndOfFileToken');
    const children = [...statements, eof];
    return { kind: 'CompilationUnit', statements, eof, children };
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
      case 'FunctionKeyword':
        return this.parseFunctionDeclarationStatement();
      case 'ContinueKeyword':
        return this.parseContinueKeyword();
      case 'BreakKeyword':
        return this.parseBreakKeyword();
      case 'ReturnKeyword':
        return this.parseReturnStatement();
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

    const typeClause = this.parseOptionalTypeClause();
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

  private parseFunctionDeclarationStatement(): StatementSyntax {
    const functionKeyword = this.matchToken('FunctionKeyword');
    const identifier = this.matchToken('IdentifierToken');
    assert(identifier.kind === 'IdentifierToken');
    const openParenthesis = this.matchToken('OpenParenthesisToken');
    const parameters = this.parseFunctionParameters();
    const closeParenthesis = this.matchToken('CloseParenthesisToken');
    const typeClause = this.parseOptionalTypeClause();
    const functionBlock = this.parseBlockStatement();
    assert(functionBlock.kind === 'BlockStatement');

    return FunctionDeclaration(
      functionKeyword,
      identifier,
      openParenthesis,
      parameters,
      closeParenthesis,
      typeClause,
      functionBlock
    );
  }

  private parseFunctionParameters(): FunctionParameterNode[] {
    const parameters = [];
    while (this.current().kind !== 'CloseParenthesisToken') {
      const identifier = this.matchToken('IdentifierToken');
      assert(identifier.kind === 'IdentifierToken');
      const typeCluase = this.parseTypeClause();
      const comma = this.matchOptionalToken('CommaToken');
      const parameter = FunctionParameter(identifier, typeCluase, comma);
      parameters.push(parameter);
    }
    return parameters;
  }

  private parseContinueKeyword(): StatementSyntax {
    const continueKeyword = this.matchToken('ContinueKeyword');
    return ContinueStatement(continueKeyword);
  }

  private parseBreakKeyword(): StatementSyntax {
    const breakKeyword = this.matchToken('BreakKeyword');
    return BreakStatement(breakKeyword);
  }

  parseReturnStatement(): StatementSyntax {
    const breakKeyword = this.matchToken('ReturnKeyword');
    const start = this.position;
    // TODO find a nicer way to implement parseOptionalExpression()
    let value: ExpressionSyntax | undefined = this.parseExpression();
    if (value.kind === 'LiteralExpression' && value.literal.value === undefined) {
      // We didn't read in an actual expression, roll back the read.
      this.position--;
      // Suppress last diagnostic
      this.diagnostics.diagnostics.pop();
      value = undefined;
    }
    return ReturnStatement(breakKeyword, value);
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
      case 'NumberToken': {
        const number = this.matchToken('NumberToken') as NumberTokenSyntax;
        return LiteralExpression(NumberLiteral(number.span, number.value));
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

  parseOptionalTypeClause(): TypeClauseNode | undefined {
    if (this.current().kind === 'ColonToken') {
      return this.parseTypeClause();
    }
    return undefined;
  }

  parseTypeClause(): TypeClauseNode {
    const colon = this.matchToken('ColonToken');
    const identifier = this.matchToken('IdentifierToken');
    assert(identifier.kind === 'IdentifierToken');
    return TypeClause(colon, identifier);
  }
}
