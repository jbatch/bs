import {
  ExpressionSyntaxTypeNode,
  Generator,
  IdentifierTokenSyntaxTypeNode,
  StatementSyntaxTypeNode,
  TokenSyntaxTypeNode,
  TypeNodeMap,
  array,
  optional,
} from '../codegeneration/Generator';

const statmentTypes: Record<string, TypeNodeMap> = {
  ExpressionStatement: {
    expression: ExpressionSyntaxTypeNode,
  },
  BlockStatement: {
    open: TokenSyntaxTypeNode,
    statements: array(StatementSyntaxTypeNode),
    close: TokenSyntaxTypeNode,
  },
  VariableDeclarationStatement: {
    keyword: TokenSyntaxTypeNode,
    identifier: IdentifierTokenSyntaxTypeNode,
    equals: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
  },
  IfStatement: {
    ifKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    condition: ExpressionSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    ifBlock: StatementSyntaxTypeNode,
    elseKeyword: optional(TokenSyntaxTypeNode),
    elseBlock: optional(StatementSyntaxTypeNode),
  },
  WhileStatement: {
    whileKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    loopCondition: ExpressionSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    whileBlock: StatementSyntaxTypeNode,
  },
  ForStatement: {
    forKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    beginStatement: StatementSyntaxTypeNode,
    loopCondition: ExpressionSyntaxTypeNode,
    endStatement: StatementSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    forBlock: StatementSyntaxTypeNode,
  },
};

const generator = new Generator(
  'StatementSyntax',
  'src/parsing/StatementSyntax.ts',
  statmentTypes,
  {
    typeSuffix: 'Syntax',
    hasChildren: true,
    hasSpan: true,
  }
);

generator.run();
