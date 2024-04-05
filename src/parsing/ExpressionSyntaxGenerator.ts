import ts, { TypeNode, factory } from 'typescript';
import fs from 'fs';
import {
  ExpressionSyntaxTypeNode,
  Generator,
  TokenSyntaxTypeNode,
  TypeNodeMap,
} from '../codegeneration/GeneratorHelpers';

const expressionTypes: Record<string, TypeNodeMap> = {
  LiteralExpression: {
    literal: TokenSyntaxTypeNode,
  },
  BinaryExpression: {
    left: ExpressionSyntaxTypeNode,
    operator: TokenSyntaxTypeNode,
    right: ExpressionSyntaxTypeNode,
  },
  UnaryExpression: {
    operator: TokenSyntaxTypeNode,
    operand: ExpressionSyntaxTypeNode,
  },
  ParenthesizedExpression: {
    open: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
    close: TokenSyntaxTypeNode,
  },
  NameExpression: {
    identifier: TokenSyntaxTypeNode,
  },
  AssignmentExpression: {
    identifier: TokenSyntaxTypeNode,
    equals: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
  },
};

const generator = new Generator('ExpressionSyntax', expressionTypes, {
  typeSuffix: 'Syntax',
  hasChildren: true,
  hasSpan: true,
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

const filePath = 'src/parsing/ExpressionSyntax.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
