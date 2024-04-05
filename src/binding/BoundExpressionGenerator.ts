import {
  BoundBinaryOperatorTypeNode,
  BoundExpressionTypeNode,
  BoundUnaryOperatorTypeNode,
  EvaluationResultTypeNode,
  Generator,
  StringTypeNode,
  TypeNodeMap,
  TypeTypeNode,
} from '../codegeneration/Generator';

const boundExpressionTypes: Record<string, TypeNodeMap> = {
  UnaryExpression: {
    type: TypeTypeNode,
    operand: BoundExpressionTypeNode,
    operator: BoundUnaryOperatorTypeNode,
  },
  BinaryExpression: {
    type: TypeTypeNode,
    left: BoundExpressionTypeNode,
    operator: BoundBinaryOperatorTypeNode,
    right: BoundExpressionTypeNode,
  },
  LiteralExpression: {
    type: TypeTypeNode,
    value: EvaluationResultTypeNode,
  },
  VariableExpression: {
    type: TypeTypeNode,
    name: StringTypeNode,
  },
  AssignmentExpression: {
    type: TypeTypeNode,
    name: StringTypeNode,
    expression: BoundExpressionTypeNode,
  },
};

const generator = new Generator(
  'BoundExpression',
  'src/binding/BoundExpression.ts',
  boundExpressionTypes,
  {
    constructorPrefix: 'Bound',
    hasChildren: false,
    hasSpan: false,
  }
);

generator.run();
