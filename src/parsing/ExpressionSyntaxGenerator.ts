import {
  ExpressionSyntaxTypeNode,
  Generator,
  TokenSyntaxTypeNode,
  TypeNodeMap,
} from '../codegeneration/Generator';

const expressionTypes: Record<string, TypeNodeMap> = {
  LiteralExpression: {
    literal: TokenSyntaxTypeNode,
  },
  BinaryExpression: {
    left: ExpressionSyntaxTypeNode,
    operator: TokenSyntaxTypeNode,
    right: ExpressionSyntaxTypeNode,
  },
  UnaryExpression: {
    operator: TokenSyntaxTypeNode,
    operand: ExpressionSyntaxTypeNode,
  },
  ParenthesizedExpression: {
    open: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
    close: TokenSyntaxTypeNode,
  },
  NameExpression: {
    identifier: TokenSyntaxTypeNode,
  },
  AssignmentExpression: {
    identifier: TokenSyntaxTypeNode,
    equals: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
  },
};

const generator = new Generator(
  'ExpressionSyntax',
  'src/parsing/ExpressionSyntax.ts',
  expressionTypes,
  {
    typeSuffix: 'Syntax',
    hasChildren: true,
    hasSpan: true,
  }
);

generator.run();
