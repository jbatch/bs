import {
  BoundBinaryOperatorTypeNode,
  BoundExpressionTypeNode,
  BoundNodeTypeNode,
  BoundUnaryOperatorTypeNode,
  EvaluationResultTypeNode,
  Generator,
  GeneratorTypeDefinitions,
  StringTypeNode,
  TypeTypeNode,
} from '../codegeneration/Generator';

const boundExpressionTypes: GeneratorTypeDefinitions = {
  UnaryExpression: {
    children: {
      operand: BoundExpressionTypeNode,
      operator: BoundUnaryOperatorTypeNode,
    },
    other: { type: TypeTypeNode },
  },
  BinaryExpression: {
    children: {
      left: BoundExpressionTypeNode,
      operator: BoundBinaryOperatorTypeNode,
      right: BoundExpressionTypeNode,
    },
    other: { type: TypeTypeNode },
  },
  LiteralExpression: {
    other: {
      type: TypeTypeNode,
      value: EvaluationResultTypeNode,
    },
  },
  VariableExpression: {
    children: {},
    other: {
      type: TypeTypeNode,
      name: StringTypeNode,
    },
  },
  AssignmentExpression: {
    children: {
      expression: BoundExpressionTypeNode,
    },
    other: {
      type: TypeTypeNode,
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
