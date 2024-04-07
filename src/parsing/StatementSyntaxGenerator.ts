import {
  ExpressionSyntaxTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  IdentifierTokenSyntaxTypeNode,
  StatementSyntaxTypeNode,
  SyntaxNodeTypeNode,
  TokenSyntaxTypeNode,
  TypeNodeMap,
  array,
  optional,
} from '../codegeneration/Generator.ts';

const statmentTypes: GeneratorTypeDefinitions = {
  ExpressionStatement: {
    children: {
      expression: ExpressionSyntaxTypeNode,
    },
  },
  BlockStatement: {
    children: {
      open: TokenSyntaxTypeNode,
      statements: array(StatementSyntaxTypeNode),
      close: TokenSyntaxTypeNode,
    },
  },
  VariableDeclarationStatement: {
    children: {
      keyword: TokenSyntaxTypeNode,
      identifier: IdentifierTokenSyntaxTypeNode,
      equals: TokenSyntaxTypeNode,
      expression: ExpressionSyntaxTypeNode,
    },
  },
  IfStatement: {
    children: {
      ifKeyword: TokenSyntaxTypeNode,
      openParenthesis: TokenSyntaxTypeNode,
      condition: ExpressionSyntaxTypeNode,
      closeParenthesis: TokenSyntaxTypeNode,
      ifBlock: StatementSyntaxTypeNode,
      elseKeyword: optional(TokenSyntaxTypeNode),
      elseBlock: optional(StatementSyntaxTypeNode),
    },
  },
  WhileStatement: {
    children: {
      whileKeyword: TokenSyntaxTypeNode,
      openParenthesis: TokenSyntaxTypeNode,
      loopCondition: ExpressionSyntaxTypeNode,
      closeParenthesis: TokenSyntaxTypeNode,
      whileBlock: StatementSyntaxTypeNode,
    },
  },
  ForStatement: {
    children: {
      forKeyword: TokenSyntaxTypeNode,
      openParenthesis: TokenSyntaxTypeNode,
      beginStatement: StatementSyntaxTypeNode,
      loopCondition: ExpressionSyntaxTypeNode,
      endStatement: StatementSyntaxTypeNode,
      closeParenthesis: TokenSyntaxTypeNode,
      forBlock: StatementSyntaxTypeNode,
    },
  },
};

const generator = new Generator(
  'StatementSyntax',
  'src/parsing/StatementSyntax.ts',
  SyntaxNodeTypeNode,
  statmentTypes,
  {
    typeSuffix: 'Syntax',
    hasChildren: true,
    hasSpan: true,
  }
);

generator.run();
