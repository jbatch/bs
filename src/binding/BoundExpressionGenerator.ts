import {
  BoundBinaryOperatorTypeNode,
  BoundExpressionTypeNode,
  BoundNodeTypeNode,
  BoundUnaryOperatorTypeNode,
  EvaluationResultTypeNode,
  Generator,
  StringTypeNode,
  TypeNodeMap,
  TypeTypeNode,
} from '../codegeneration/Generator';

const boundExpressionTypes: Record<string, TypeNodeMap> = {
  UnaryExpression: {
    operand: BoundExpressionTypeNode,
    operator: BoundUnaryOperatorTypeNode,
  },
  BinaryExpression: {
    left: BoundExpressionTypeNode,
    operator: BoundBinaryOperatorTypeNode,
    right: BoundExpressionTypeNode,
  },
  LiteralExpression: {
    value: EvaluationResultTypeNode,
  },
  VariableExpression: {
    name: StringTypeNode,
  },
  AssignmentExpression: {
    name: StringTypeNode,
    expression: BoundExpressionTypeNode,
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
    hasType: true,
    hasSpan: false,
    emptyChildren: true,
  }
);

generator.run();
