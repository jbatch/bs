import {
  BooleanLiteralSyntaxTypeNode,
  ExpressionSyntaxTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  IdentifierTokenSyntaxTypeNode,
  NumberLiteralSyntaxTypeNode,
  SyntaxNodeTypeNode,
  TokenSyntaxTypeNode,
  TypeNodeMap,
  or,
} from '../codegeneration/Generator.ts';

const expressionTypes: GeneratorTypeDefinitions = {
  LiteralExpression: {
    children: {
      literal: or(NumberLiteralSyntaxTypeNode, BooleanLiteralSyntaxTypeNode),
    },
  },
  BinaryExpression: {
    children: {
      left: ExpressionSyntaxTypeNode,
      operator: TokenSyntaxTypeNode,
      right: ExpressionSyntaxTypeNode,
    },
  },
  UnaryExpression: {
    children: {
      operator: TokenSyntaxTypeNode,
      operand: ExpressionSyntaxTypeNode,
    },
  },
  ParenthesizedExpression: {
    children: {
      open: TokenSyntaxTypeNode,
      expression: ExpressionSyntaxTypeNode,
      close: TokenSyntaxTypeNode,
    },
  },
  NameExpression: {
    children: {
      identifier: IdentifierTokenSyntaxTypeNode,
    },
  },
  AssignmentExpression: {
    children: {
      identifier: IdentifierTokenSyntaxTypeNode,
      equals: TokenSyntaxTypeNode,
      expression: ExpressionSyntaxTypeNode,
    },
  },
};

const generator = new Generator(
  'ExpressionSyntax',
  'src/parsing/ExpressionSyntax.ts',
  SyntaxNodeTypeNode,
  expressionTypes,
  {
    typeSuffix: 'Syntax',
    hasChildren: true,
    hasSpan: true,
  }
);

generator.run();
