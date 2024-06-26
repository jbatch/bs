import {
  BooleanLiteralSyntaxTypeNode,
  ExpressionSyntaxTypeNode,
  FunctionArgumentNodeTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  IdentifierTokenSyntaxTypeNode,
  NumberLiteralSyntaxTypeNode,
  StringLiteralSyntaxTypeNode,
  SyntaxNodeTypeNode,
  TokenSyntaxTypeNode,
  array,
  or,
} from '../codegeneration/Generator';

const expressionTypes: GeneratorTypeDefinitions = {
  LiteralExpression: {
    children: {
      literal: or(
        NumberLiteralSyntaxTypeNode,
        BooleanLiteralSyntaxTypeNode,
        StringLiteralSyntaxTypeNode
      ),
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
  OperatorAssignmentExpression: {
    children: {
      identifier: IdentifierTokenSyntaxTypeNode,
      operator: TokenSyntaxTypeNode,
      expression: ExpressionSyntaxTypeNode,
    },
  },
  PostfixUnaryExpression: {
    children: {
      identifier: IdentifierTokenSyntaxTypeNode,
      operator: TokenSyntaxTypeNode,
    },
  },
  CallExpression: {
    children: {
      identifier: IdentifierTokenSyntaxTypeNode,
      open: TokenSyntaxTypeNode,
      args: array(FunctionArgumentNodeTypeNode),
      close: TokenSyntaxTypeNode,
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
