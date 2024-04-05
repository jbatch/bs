import {
  BoundExpressionTypeNode,
  BoundStatementTypeNode,
  Generator,
  TypeNodeMap,
  VariableSymbolTypeNode,
  array,
  optional,
} from '../codegeneration/Generator';

const boundStatementTypes: Record<string, TypeNodeMap> = {
  ExpressionStatement: {
    expression: BoundExpressionTypeNode,
  },
  BlockStatement: {
    statements: array(BoundStatementTypeNode),
  },
  VariableDelcarationStatement: {
    variable: VariableSymbolTypeNode,
    expression: BoundExpressionTypeNode,
  },
  IfStatement: {
    condition: BoundExpressionTypeNode,
    ifBlock: BoundStatementTypeNode,
    elseBlock: optional(BoundStatementTypeNode),
  },
  WhileStatement: {
    loopCondition: BoundExpressionTypeNode,
    whileBlock: BoundStatementTypeNode,
  },
  ForStatement: {
    beginStatement: BoundStatementTypeNode,
    loopCondition: BoundExpressionTypeNode,
    endStatement: BoundStatementTypeNode,
    forBlock: BoundStatementTypeNode,
  },
};

const generator = new Generator(
  'BoundStatement',
  'src/binding/BoundStatement.ts',
  boundStatementTypes,
  {
    constructorPrefix: 'Bound',
    hasChildren: false,
    hasSpan: false,
  }
);

generator.run();
