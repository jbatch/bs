import ts from 'typescript';
import fs from 'fs';
import {
  BoundExpressionTypeNode,
  BoundStatementTypeNode,
  Generator,
  TypeNodeMap,
  VariableSymbolTypeNode,
  array,
  optional,
} from '../codegeneration/GeneratorHelpers';

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

const generator = new Generator('BoundStatement', boundStatementTypes, {
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

const filePath = 'src/binding/BoundStatement.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
