import {
  BooleanTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  StringTypeNode,
  SymbolTypeNode,
  TypeSymbolTypeNode,
  VariableSymbolTypeNode,
  array,
} from '../codegeneration/Generator';

const symbolTypes: GeneratorTypeDefinitions = {
  Variable: {
    other: {
      name: StringTypeNode,
      type: TypeSymbolTypeNode,
      readonly: BooleanTypeNode,
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
    },
  },
};

const generator = new Generator('Symbol', 'src/symbols/Symbol.ts', SymbolTypeNode, symbolTypes, {
  hasChildren: false,
  hasSpan: false,
  typeSuffix: 'Symbol',
});

generator.run();
