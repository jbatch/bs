import {
  ExpressionSyntaxTypeNode,
  Generator,
  IdentifierTokenSyntaxTypeNode,
  NumberTokenSyntaxTypeNode,
  TokenSyntaxTypeNode,
  TypeNodeMap,
} from '../codegeneration/Generator';

const expressionTypes: Record<string, TypeNodeMap> = {
  LiteralExpression: {
    literal: NumberTokenSyntaxTypeNode,
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
    identifier: IdentifierTokenSyntaxTypeNode,
  },
  AssignmentExpression: {
    identifier: IdentifierTokenSyntaxTypeNode,
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
