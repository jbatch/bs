import {
  Generator,
  GeneratorTypeDefinitions,
  IdentifierTokenSyntaxTypeNode,
  StatementSyntaxTypeNode,
  SyntaxNodeTypeNode,
  TokenSyntaxTypeNode,
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
