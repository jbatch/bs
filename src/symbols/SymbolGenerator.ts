import {
  BooleanTypeNode,
  FunctionDeclarationSyntaxTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  StringTypeNode,
  SymbolTypeNode,
  TypeSymbolTypeNode,
  VariableSymbolTypeNode,
  array,
  optional,
} from '../codegeneration/Generator';

const symbolTypes: GeneratorTypeDefinitions = {
  Variable: {
    other: {
      name: StringTypeNode,
      type: TypeSymbolTypeNode,
      readonly: BooleanTypeNode,
      isLocal: BooleanTypeNode,
    },
  },
  Type: {
    other: {
      name: StringTypeNode,
    },
  },
  Function: {
    other: {
      name: StringTypeNode,
      type: TypeSymbolTypeNode,
      parameters: array(VariableSymbolTypeNode),
      declaration: optional(FunctionDeclarationSyntaxTypeNode),
    },
  },
};

const generator = new Generator('Symbol', 'src/symbols/Symbol.ts', SymbolTypeNode, symbolTypes, {
  hasChildren: false,
  hasSpan: false,
  typeSuffix: 'Symbol',
});

generator.run();
