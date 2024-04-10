import {
  BoundBinaryOperatorTypeNode,
  BoundExpressionTypeNode,
  BoundNodeTypeNode,
  BoundUnaryOperatorTypeNode,
  EvaluationResultTypeNode,
  FunctionSymbolTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  TypeSymbolTypeNode,
  VariableSymbolTypeNode,
  array,
} from '../codegeneration/Generator';

const boundExpressionTypes: GeneratorTypeDefinitions = {
  UnaryExpression: {
    children: {
      operand: BoundExpressionTypeNode,
      operator: BoundUnaryOperatorTypeNode,
    },
    other: { type: TypeSymbolTypeNode },
  },
  BinaryExpression: {
    children: {
      left: BoundExpressionTypeNode,
      operator: BoundBinaryOperatorTypeNode,
      right: BoundExpressionTypeNode,
    },
    other: { type: TypeSymbolTypeNode },
  },
  LiteralExpression: {
    other: {
      type: TypeSymbolTypeNode,
      value: EvaluationResultTypeNode,
    },
  },
  VariableExpression: {
    children: {},
    other: {
      type: TypeSymbolTypeNode,
      variable: VariableSymbolTypeNode,
    },
  },
  AssignmentExpression: {
    children: {
      expression: BoundExpressionTypeNode,
    },
    other: {
      type: TypeSymbolTypeNode,
      variable: VariableSymbolTypeNode,
    },
  },
  OperatorAssignmentExpression: {
    children: {
      operator: BoundBinaryOperatorTypeNode,
      expression: BoundExpressionTypeNode,
    },
    other: {
      type: TypeSymbolTypeNode,
      variable: VariableSymbolTypeNode,
    },
  },
  PostfixUnaryExpression: {
    children: {
      operator: BoundUnaryOperatorTypeNode,
    },
    other: {
      type: TypeSymbolTypeNode,
      variable: VariableSymbolTypeNode,
    },
  },
  CallExpression: {
    children: {
      args: array(BoundExpressionTypeNode),
    },
    other: {
      functionSymbol: FunctionSymbolTypeNode,
      type: TypeSymbolTypeNode,
    },
  },
  TypeCastExpression: {
    children: {
      expression: BoundExpressionTypeNode,
    },
    other: {
      type: TypeSymbolTypeNode,
    },
  },
  ErrorExpression: {
    other: {
      type: TypeSymbolTypeNode,
    },
  },
};

const generator = new Generator(
  'BoundExpression',
  'src/binding/BoundExpression.ts',
  BoundNodeTypeNode,
  boundExpressionTypes,
  {
    constructorPrefix: 'Bound',
    hasChildren: true,
    hasSpan: false,
  }
);

generator.run();
