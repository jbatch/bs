import ts from 'typescript';
import fs from 'fs';
import {
  BoundBinaryOperatorTypeNode,
  BoundExpressionTypeNode,
  BoundUnaryOperatorTypeNode,
  EvaluationResultTypeNode,
  Generator,
  StringTypeNode,
  TypeNodeMap,
  TypeTypeNode,
} from '../codegeneration/GeneratorHelpers';

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

const generator = new Generator('BoundExpression', boundExpressionTypes, {
  constructorPrefix: 'Bound',
  hasChildren: false,
  hasSpan: false,
});

const typeDeclarations = generator.createTypeDeclarations();
const unionType = generator.createUnionType(typeDeclarations);
const constructors = generator.createConstructors();

function generateSourceCode(nodes: any) {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const resultFile = ts.createSourceFile(
    'temp.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX
  );

  return printer.printList(ts.ListFormat.MultiLine, nodes, resultFile);
}

const generatedSource = generateSourceCode([...typeDeclarations, unionType, ...constructors]);

const filePath = 'src/binding/BoundExpression.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
