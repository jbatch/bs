import {
  BooleanTypeNode,
  BoundExpressionTypeNode,
  BoundLabelTypeNode,
  BoundNodeTypeNode,
  BoundStatementTypeNode,
  FunctionSymbolTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  VariableSymbolTypeNode,
  array,
  optional,
} from '../codegeneration/Generator';

const boundStatementTypes: GeneratorTypeDefinitions = {
  ExpressionStatement: {
    children: {
      expression: BoundExpressionTypeNode,
    },
  },
  BlockStatement: {
    children: {
      statements: array(BoundStatementTypeNode),
    },
  },
  VariableDelcarationStatement: {
    children: {
      variable: VariableSymbolTypeNode,
      expression: BoundExpressionTypeNode,
    },
  },
  IfStatement: {
    children: {
      condition: BoundExpressionTypeNode,
      ifBlock: BoundStatementTypeNode,
      elseBlock: optional(BoundStatementTypeNode),
    },
  },
  WhileStatement: {
    children: {
      loopCondition: BoundExpressionTypeNode,
      whileBlock: BoundStatementTypeNode,
    },
  },
  ForStatement: {
    children: {
      beginStatement: BoundStatementTypeNode,
      loopCondition: BoundExpressionTypeNode,
      endStatement: BoundStatementTypeNode,
      forBlock: BoundStatementTypeNode,
    },
  },
  FunctionDeclarationStatement: {
    other: {
      functionSymbol: FunctionSymbolTypeNode,
    },
  },
  LabelStatement: {
    other: {
      label: BoundLabelTypeNode,
    },
  },
  GoToStatement: {
    other: {
      label: BoundLabelTypeNode,
    },
  },
  ConditionalGoToStatement: {
    children: {
      condition: BoundExpressionTypeNode,
    },
    other: {
      label: BoundLabelTypeNode,
      jumpIfTrue: BooleanTypeNode,
    },
  },
};

const generator = new Generator(
  'BoundStatement',
  'src/binding/BoundStatement.ts',
  BoundNodeTypeNode,
  boundStatementTypes,
  {
    constructorPrefix: 'Bound',
    hasChildren: true,
    hasSpan: false,
  }
);

generator.run();
