import {
  BooleanTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  StringTypeNode,
  SymbolTypeNode,
  TypeSymbolTypeNode,
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
};

const generator = new Generator('Symbol', 'src/symbols/Symbol.ts', SymbolTypeNode, symbolTypes, {
  hasChildren: false,
  hasSpan: false,
  typeSuffix: 'Symbol',
});

generator.run();
