import {
  ExpressionSyntaxTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  IdentifierTokenSyntaxTypeNode,
  StatementSyntaxTypeNode,
  SyntaxNodeTypeNode,
  TokenSyntaxTypeNode,
  optional,
} from '../codegeneration/Generator';

const containerNodeTypes: GeneratorTypeDefinitions = {
  CompilationUnit: {
    other: {
      statement: StatementSyntaxTypeNode,
      eof: TokenSyntaxTypeNode,
    },
  },
  TypeClause: {
    children: {
      colon: TokenSyntaxTypeNode,
      identifier: IdentifierTokenSyntaxTypeNode,
    },
  },
  FunctionArgument: {
    children: {
      expression: ExpressionSyntaxTypeNode,
      comma: optional(TokenSyntaxTypeNode),
    },
  },
};

const generator = new Generator(
  'ContainerNode',
  'src/parsing/ContainerNode.ts',
  SyntaxNodeTypeNode,
  containerNodeTypes,
  {
    typeSuffix: 'Node',
    hasChildren: true,
  }
);

generator.run();
