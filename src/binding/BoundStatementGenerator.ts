import {
  BooleanTypeNode,
  BoundBlockStatementTypeNode,
  BoundExpressionTypeNode,
  BoundLabelTypeNode,
  BoundNodeTypeNode,
  BoundStatementTypeNode,
  FunctionSymbolTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  TypeSymbolTypeNode,
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
  VariableDeclarationStatement: {
    children: {
      variable: VariableSymbolTypeNode,
      expression: BoundExpressionTypeNode,
    },
  },
  IfStatement: {
    children: {
      condition: BoundExpressionTypeNode,
      ifBlock: BoundBlockStatementTypeNode,
      elseBlock: optional(BoundBlockStatementTypeNode),
    },
  },
  WhileStatement: {
    children: {
      loopCondition: BoundExpressionTypeNode,
      whileBlock: BoundBlockStatementTypeNode,
    },
    other: {
      continueLabel: BoundLabelTypeNode,
      breakLabel: BoundLabelTypeNode,
    },
  },
  ForStatement: {
    children: {
      beginStatement: BoundStatementTypeNode,
      loopCondition: BoundExpressionTypeNode,
      endStatement: BoundStatementTypeNode,
      forBlock: BoundBlockStatementTypeNode,
    },
    other: {
      continueLabel: BoundLabelTypeNode,
      breakLabel: BoundLabelTypeNode,
    },
  },
  FunctionDeclarationStatement: {
    other: {
      functionSymbol: FunctionSymbolTypeNode,
      type: optional(TypeSymbolTypeNode),
    },
  },
  ReturnStatement: {
    children: { value: optional(BoundExpressionTypeNode) },
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
      ifLabel: BoundLabelTypeNode,
      elseLabel: BoundLabelTypeNode,
      endLabel: BoundLabelTypeNode,
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
