import ts from 'typescript';
import fs from 'fs';
import {
  ExpressionSyntaxTypeNode,
  Generator,
  StatementSyntaxTypeNode,
  TokenSyntaxTypeNode,
  TypeNodeMap,
  array,
  optional,
} from '../codegeneration/GeneratorHelpers';

const statmentTypes: Record<string, TypeNodeMap> = {
  ExpressionStatement: {
    expression: ExpressionSyntaxTypeNode,
  },
  BlockStatement: {
    open: TokenSyntaxTypeNode,
    statements: array(StatementSyntaxTypeNode),
    close: TokenSyntaxTypeNode,
  },
  VariableDeclarationStatement: {
    keyword: TokenSyntaxTypeNode,
    identifier: TokenSyntaxTypeNode,
    equals: TokenSyntaxTypeNode,
    expression: ExpressionSyntaxTypeNode,
  },
  IfStatement: {
    ifKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    condition: ExpressionSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    ifBlock: StatementSyntaxTypeNode,
    elseKeyword: optional(TokenSyntaxTypeNode),
    elseBlock: optional(StatementSyntaxTypeNode),
  },
  WhileStatement: {
    whileKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    loopCondition: ExpressionSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    whileBlock: StatementSyntaxTypeNode,
  },
  ForStatement: {
    forKeyword: TokenSyntaxTypeNode,
    openParenthesis: TokenSyntaxTypeNode,
    beginStatement: StatementSyntaxTypeNode,
    loopCondition: ExpressionSyntaxTypeNode,
    endStatement: StatementSyntaxTypeNode,
    closeParenthesis: TokenSyntaxTypeNode,
    forBlock: StatementSyntaxTypeNode,
  },
};

const generator = new Generator('StatementSyntax', statmentTypes, {
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

const filePath = 'src/parsing/StatementSyntax.ts';

const header = fs.readFileSync(filePath).toString().split('// Generated code')[0];
fs.writeFileSync(filePath, [`${header}`, '// Generated code\n\n', generatedSource].join(''));

console.log(`Wrote generated source code to ${filePath}`);
