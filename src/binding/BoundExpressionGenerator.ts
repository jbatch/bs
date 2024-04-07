import {
  BoundBinaryOperatorTypeNode,
  BoundExpressionTypeNode,
  BoundNodeTypeNode,
  BoundUnaryOperatorTypeNode,
  EvaluationResultTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  StringTypeNode,
  TypeSymbolTypeNode,
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
      name: StringTypeNode,
    },
  },
  AssignmentExpression: {
    children: {
      expression: BoundExpressionTypeNode,
    },
    other: {
      type: TypeSymbolTypeNode,
      name: StringTypeNode,
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
